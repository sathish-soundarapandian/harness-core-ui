/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, get, merge } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, useGetGcsBuckets, useGetProjects } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type {
  GoogleCloudStorageArtifactProps,
  GoogleCloudStorageInitialValuesType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import {
  ArtifactIdentifierValidation,
  ENABLED_ARTIFACT_TYPES,
  ModalViewFor
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  defaultArtifactInitialValues,
  getConnectorIdValue,
  resetFieldValue,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { isFixedNonEmptyValue } from '@pipeline/utils/stageHelpers'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function GoogleCloudStorage(
  props: StepProps<ConnectorConfigDTO> & GoogleCloudStorageArtifactProps
): React.ReactElement {
  const {
    context,
    handleSubmit,
    expressions,
    allowableTypes,
    prevStepData,
    initialValues,
    previousStep,
    artifactIdentifiers,
    isReadonly = false,
    selectedArtifact,
    isMultiArtifactSource,
    formClassName = '',
    editArtifactModePrevStepData
  } = props

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const [lastProjectsQueryData, setLastProjectsQueryData] = React.useState({
    connectorRef: ''
  })
  const [lastBucketsQueryData, setLastBucketsQueryData] = React.useState({
    connectorRef: '',
    project: ''
  })

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const getConnectorRefQueryData = (): string => {
    return (
      modifiedPrevStepData?.connectorId?.value ||
      modifiedPrevStepData?.connectorId?.connector?.value ||
      modifiedPrevStepData?.identifier
    )
  }

  // Project
  const {
    data: projectsData,
    loading: loadingProjects,
    error: fetchProjectsError,
    refetch: refetchProjects
  } = useMutateAsGet(useGetProjects, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true
  })

  const projectOptions: SelectOption[] = React.useMemo(() => {
    if (loadingProjects) {
      return [{ label: getString('loading'), value: getString('loading') }]
    } else if (fetchProjectsError) {
      return []
    }
    return defaultTo(projectsData?.data?.projects, []).map(project => ({
      value: project.id as string,
      label: project.name as string
    }))
  }, [projectsData?.data, loadingProjects, fetchProjectsError])

  const canFetchProjects = useCallback((): boolean => {
    const connectorRef = getConnectorRefQueryData()
    return !!(lastProjectsQueryData.connectorRef !== connectorRef && shouldFetchFieldOptions(modifiedPrevStepData, []))
  }, [lastProjectsQueryData, modifiedPrevStepData])

  const fetchProjects = useCallback((): void => {
    if (canFetchProjects()) {
      const connectorRef = getConnectorRefQueryData()
      refetchProjects({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          connectorRef
        }
      })
      setLastProjectsQueryData({ connectorRef })
    }
  }, [canFetchProjects, refetchProjects])

  // Bucket
  const {
    data: bucketsData,
    error: fetchBucketsError,
    loading: loadingBuckets,
    refetch: refetchBuckets
  } = useMutateAsGet(useGetGcsBuckets, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true
  })

  const bucketOptions = useMemo(() => {
    if (loadingBuckets) {
      return [{ value: getString('loading'), label: getString('loading') }]
    }
    if (fetchBucketsError) {
      return []
    }
    return defaultTo(bucketsData?.data?.buckets, []).map(bucket => ({
      label: bucket.id as string,
      value: bucket.name as string
    }))
  }, [bucketsData, fetchBucketsError, loadingBuckets])

  const canFetchBuckets = useCallback(
    (project: string): boolean => {
      const connectorRef = getConnectorRefQueryData()
      return !!(
        (lastBucketsQueryData.connectorRef !== connectorRef || lastBucketsQueryData.project !== project) &&
        shouldFetchFieldOptions(modifiedPrevStepData, [])
      )
    },
    [modifiedPrevStepData, lastBucketsQueryData]
  )

  const fetchBuckets = useCallback(
    (project = ''): void => {
      if (canFetchBuckets(project)) {
        const connectorRef = getConnectorRefQueryData()
        refetchBuckets({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef,
            project: isFixedNonEmptyValue(project) ? project : undefined
          }
        })
        setLastBucketsQueryData({ connectorRef, project })
      }
    },
    [canFetchBuckets, refetchBuckets]
  )

  // Validation
  const schemaObject = {
    project: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('projectLabel') })),
    bucket: Yup.mixed().required(
      getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.bucketLabel') })
    ),
    artifactPath: Yup.string().required(
      getString('common.validation.fieldIsRequired', { name: getString('pipeline.artifactPathLabel') })
    )
  }
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const primarySchema = Yup.object().shape(schemaObject)

  const getValidationSchema = useCallback(() => {
    if (isIdentifierAllowed) {
      return sidecarSchema
    }
    return primarySchema
  }, [primarySchema, sidecarSchema, isIdentifierAllowed])

  const handleValidate = (formData: GoogleCloudStorageInitialValuesType & { connectorId?: string }): void => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }

  // Initial Values
  const getInitialValues = React.useCallback((): GoogleCloudStorageInitialValuesType => {
    // Initia specValues
    const specValues = get(initialValues, 'spec', null)
    // if specValues is nil or selected type is not matching with initialValues.type then assume NEW
    if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
      return defaultArtifactInitialValues(defaultTo(selectedArtifact, ENABLED_ARTIFACT_TYPES.GoogleCloudStorage))
    }
    // Clone the values
    const artifactValues = {
      ...specValues
    }
    if (isIdentifierAllowed && initialValues?.identifier) {
      merge(artifactValues, { identifier: initialValues?.identifier })
    }
    return artifactValues
  }, [initialValues, selectedArtifact, isIdentifierAllowed])

  // Submit
  const submitFormData = (formData: GoogleCloudStorageInitialValuesType & { connectorId?: string }): void => {
    // Initial data
    const artifactObj = {
      spec: {
        connectorRef: formData.connectorId,
        project: formData.project,
        bucket: formData.bucket,
        artifactPath: formData.artifactPath
      }
    }
    if (isIdentifierAllowed) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    // Submit the final object
    handleSubmit(artifactObj)
  }

  const getProjectHelperText = React.useCallback(
    (formik: FormikProps<GoogleCloudStorageInitialValuesType>) => {
      const prevStepConnectorRef = getConnectorIdValue(modifiedPrevStepData)
      if (
        getMultiTypeFromValue(get(formik?.values, `project`)) === MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(prevStepConnectorRef) === MultiTypeInputType.RUNTIME ||
          prevStepConnectorRef?.length === 0)
      ) {
        return getString('pipeline.projectHelperText')
      }
    },
    [modifiedPrevStepData]
  )

  const getBucketHelperText = React.useCallback(
    (formik: FormikProps<GoogleCloudStorageInitialValuesType>) => {
      const prevStepConnectorRef = getConnectorIdValue(modifiedPrevStepData)
      if (
        getMultiTypeFromValue(get(formik?.values, `bucket`)) === MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(prevStepConnectorRef) === MultiTypeInputType.RUNTIME ||
          prevStepConnectorRef?.length === 0)
      ) {
        return getString('pipeline.bucketNameHelperText')
      }
    },
    [modifiedPrevStepData]
  )

  const itemRenderer = useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects || loadingBuckets} />
    ),
    [loadingProjects, loadingBuckets]
  )

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik<GoogleCloudStorageInitialValuesType>
        initialValues={getInitialValues()}
        formName="googleCloudStorageArtifact"
        validationSchema={getValidationSchema()}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="project"
                  label={getString('projectLabel')}
                  placeholder={getString('common.selectProject')}
                  selectItems={projectOptions}
                  useValue
                  helperText={getProjectHelperText(formik)}
                  multiTypeInputProps={{
                    allowableTypes,
                    expressions,
                    onChange: selected => {
                      if (formik.values.project !== (selected as unknown as any)?.value) {
                        resetFieldValue(formik, 'bucket')
                      }
                    },
                    selectProps: {
                      items: projectOptions,
                      noResults: (
                        <Text lineClamp={1} width={400} height={32} padding="small">
                          {getRBACErrorMessage(fetchProjectsError as RBACError) || getString('noProjects')}
                        </Text>
                      ),
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                      ) {
                        return
                      }
                      if (!loadingProjects) {
                        fetchProjects()
                      }
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.project) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      options={projectOptions}
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.project as string}
                      type="String"
                      variableName="project"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('project', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="bucket"
                  label={getString('pipelineSteps.bucketLabel')}
                  placeholder={getString('pipeline.artifacts.googleCloudStorage.bucketPlaceholder')}
                  selectItems={bucketOptions}
                  disabled={isReadonly}
                  useValue
                  helperText={getBucketHelperText(formik)}
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      noResults: (
                        <Text lineClamp={1} width={400} height={32} padding="small">
                          {getRBACErrorMessage(fetchBucketsError as RBACError) || getString('pipeline.noBucketsFound')}
                        </Text>
                      ),
                      itemRenderer: itemRenderer,
                      items: bucketOptions,
                      allowCreatingNewItems: true
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                      ) {
                        return
                      }
                      if (!loadingBuckets) {
                        fetchBuckets(formik.values.project)
                      }
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values?.bucket) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      options={bucketOptions}
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.bucket as string}
                      type="String"
                      variableName="bucket"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('bucket', value)}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  key={'artifactPath'}
                  name="artifactPath"
                  label={getString('pipeline.artifactPathLabel')}
                  placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values?.artifactPath) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.artifactPath as string}
                      type={getString('string')}
                      variableName="artifactPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('artifactPath', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>
            </div>
            {!hideHeaderAndNavBtns && (
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(modifiedPrevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            )}
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
