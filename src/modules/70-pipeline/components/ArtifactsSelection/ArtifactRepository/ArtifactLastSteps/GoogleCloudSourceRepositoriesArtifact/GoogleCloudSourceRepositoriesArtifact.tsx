/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, get, merge, set } from 'lodash-es'
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
import type { StringsMap } from 'framework/strings/StringsContext'
import { ConnectorConfigDTO, GoogleCloudSourceArtifactConfig, useGetProjects } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type {
  GoogleCloudSourceRepositoriesArtifactProps,
  GoogleCloudSourceRepositoriesInitialValuesType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import {
  ArtifactIdentifierValidation,
  ENABLED_ARTIFACT_TYPES,
  ModalViewFor
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  defaultArtifactInitialValues,
  getConnectorIdValue,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export enum GitRepoName {
  Account = 'Account',
  Repo = 'Repo'
}

interface FetchType {
  label: string
  value: GoogleCloudSourceArtifactConfig['fetchType']
}

export const getFetchTypeList = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): FetchType[] => [
  { label: getString('gitFetchTypes.fromBranch'), value: 'Branch' },
  { label: getString('common.googleCloudSourceFetchType.specificCommitId'), value: 'Commit' },
  { label: getString('common.googleCloudSourceFetchType.specificTag'), value: 'Tag' }
]

export function GoogleCloudSourceRepositories(
  props: StepProps<ConnectorConfigDTO> & GoogleCloudSourceRepositoriesArtifactProps
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
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getConnectorRefQueryData()
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

  // Validation
  const schemaObject = {
    project: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('projectLabel') })),
    repository: Yup.mixed().required(
      getString('common.validation.fieldIsRequired', {
        name: getString('pipeline.artifacts.googleCloudSourceRepositories.cloudSourceRepository')
      })
    ),
    branch: Yup.string().when('fetchType', {
      is: 'Branch',
      then: Yup.string()
        .trim()
        .required(
          getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.deploy.inputSet.branch') })
        )
    }),
    commitId: Yup.string().when('fetchType', {
      is: 'Commit',
      then: Yup.string()
        .trim()
        .required(
          getString('common.validation.fieldIsRequired', {
            name: getString('common.commitId')
          })
        )
    }),
    tag: Yup.string().when('fetchType', {
      is: 'Tag',
      then: Yup.string()
        .trim()
        .required(
          getString('common.validation.fieldIsRequired', {
            name: getString('tagLabel')
          })
        )
    }),
    sourceDirectory: Yup.string().required(
      getString('common.validation.fieldIsRequired', {
        name: getString('pipeline.artifacts.googleCloudSourceRepositories.sourceDirectory')
      })
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

  // Initial Values
  const getInitialValues = React.useCallback((): GoogleCloudSourceRepositoriesInitialValuesType => {
    // Initia specValues
    const specValues = get(initialValues, 'spec', null)
    // if specValues is nil or selected type is not matching with initialValues.type then assume NEW
    if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
      return defaultArtifactInitialValues(defaultTo(selectedArtifact, ENABLED_ARTIFACT_TYPES.GoogleCloudSource))
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
  const submitFormData = (
    formData: GoogleCloudSourceRepositoriesInitialValuesType & { connectorId?: string }
  ): void => {
    // Initial data
    const artifactObj = {
      spec: {
        connectorRef: formData.connectorId,
        project: formData.project,
        repository: formData.repository,
        sourceDirectory: formData.sourceDirectory,
        fetchType: formData.fetchType
      }
    }

    if (formData.fetchType === 'Branch') {
      set(artifactObj, 'spec.branch', formData.branch)
    } else if (formData.fetchType === 'Commit') {
      set(artifactObj, 'spec.commitId', formData.commitId)
    } else if (formData.fetchType === 'Tag') {
      set(artifactObj, 'spec.tag', formData.tag)
    }

    if (isIdentifierAllowed) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    // Submit the final object
    handleSubmit(artifactObj)
  }

  const handleValidate = (
    formData: GoogleCloudSourceRepositoriesInitialValuesType & { connectorId?: string }
  ): void => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }

  const getProjectHelperText = React.useCallback(
    (formik: FormikProps<GoogleCloudSourceRepositoriesInitialValuesType>) => {
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

  const itemRenderer = useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects} />
    ),
    [loadingProjects]
  )

  const renderField = (
    formikFormRef: FormikProps<GoogleCloudSourceRepositoriesInitialValuesType>,
    fieldName: string,
    fieldLabel: string,
    fieldPlaceholder: string
  ): JSX.Element => {
    return (
      <div
        className={cx(css.halfWidth, {
          [css.runtimeInput]: getMultiTypeFromValue(get(formikFormRef.values, fieldName)) === MultiTypeInputType.RUNTIME
        })}
      >
        <FormInput.MultiTextInput
          multiTextInputProps={{ expressions, allowableTypes }}
          label={fieldLabel}
          placeholder={fieldPlaceholder}
          name={fieldName}
        />
        {getMultiTypeFromValue(get(formikFormRef.values, fieldName)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={get(formikFormRef.values, fieldName)}
            type="String"
            variableName={fieldName}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formikFormRef.setFieldValue(fieldName, value)}
            isReadonly={isReadonly}
          />
        )}
      </div>
    )
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik<GoogleCloudSourceRepositoriesInitialValuesType>
        initialValues={getInitialValues()}
        formName="googleCloudSourceArtifact"
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
                <FormInput.MultiTextInput
                  name="repository"
                  label={getString('pipeline.artifacts.googleCloudSourceRepositories.cloudSourceRepository')}
                  placeholder={getString(
                    'pipeline.artifacts.googleCloudSourceRepositories.cloudSourceRepositoryPlaceholder'
                  )}
                  disabled={isReadonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.repository as string}
                      type="String"
                      variableName="repository"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('repository', value)}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <Layout.Horizontal spacing="huge" className={css.imagePathContainer}>
                <div className={css.halfWidth}>
                  <FormInput.Select
                    name="fetchType"
                    label={getString('pipeline.artifacts.googleCloudSourceRepositories.fetchType')}
                    items={getFetchTypeList(getString)}
                  />
                </div>

                {formik.values?.fetchType === 'Branch' &&
                  renderField(
                    formik,
                    'branch',
                    getString('pipelineSteps.deploy.inputSet.branch'),
                    getString('pipeline.manifestType.branchPlaceholder')
                  )}

                {formik.values?.fetchType === 'Commit' &&
                  renderField(
                    formik,
                    'commitId',
                    getString('common.commitId'),
                    getString('pipeline.artifacts.googleCloudSourceRepositories.commitIdPlaceholder')
                  )}

                {formik.values?.fetchType === 'Tag' &&
                  renderField(
                    formik,
                    'tag',
                    getString('tagLabel'),
                    getString('pipeline.artifacts.googleCloudSourceRepositories.tagPlaceholder')
                  )}
              </Layout.Horizontal>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  name="sourceDirectory"
                  label={getString('pipeline.artifacts.googleCloudSourceRepositories.sourceDirectory')}
                  placeholder={getString('pipeline.artifacts.googleCloudSourceRepositories.sourceDirectoryPlaceholder')}
                  disabled={isReadonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.sourceDirectory) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.sourceDirectory as string}
                      type={'String'}
                      variableName="sourceDirectory"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('sourceDirectory', value)
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
