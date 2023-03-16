/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import cx from 'classnames'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  SelectOption,
  ButtonVariation,
  FormikForm,
  getMultiTypeFromValue,
  FormError
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { ConnectorConfigDTO, useGetGcsBuckets, useGetProjects } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import {
  getConnectorIdValue,
  RegistryHostNames,
  resetFieldValue,
  shouldFetchFieldOptions
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { GoolgeCloudStorageRegistrySpec } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useMutateAsGet } from '@common/hooks'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { isFixedNonEmptyValue } from '@pipeline/utils/stageHelpers'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))
export function GoogleCloudStorage({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<GoolgeCloudStorageRegistrySpec>): React.ReactElement {
  const connectorRefValue = getConnectorIdValue(prevStepData)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsData?.data, loadingProjects, fetchProjectsError])

  const canFetchProjects = useCallback((): boolean => {
    return !!(lastProjectsQueryData.connectorRef !== connectorRefValue && shouldFetchFieldOptions(prevStepData, []))
  }, [lastProjectsQueryData, prevStepData, connectorRefValue])

  const fetchProjects = useCallback((): void => {
    if (canFetchProjects()) {
      const connectorRef = connectorRefValue
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
  }, [canFetchProjects, refetchProjects, accountId, connectorRefValue, orgIdentifier, projectIdentifier])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketsData, fetchBucketsError, loadingBuckets])

  const canFetchBuckets = useCallback(
    (project: string): boolean => {
      const connectorRef = connectorRefValue
      return !!(
        (lastBucketsQueryData.connectorRef !== connectorRef || lastBucketsQueryData.project !== project) &&
        shouldFetchFieldOptions(prevStepData, [])
      )
    },
    [prevStepData, lastBucketsQueryData, connectorRefValue]
  )

  const fetchBuckets = useCallback(
    (project = ''): void => {
      if (canFetchBuckets(project)) {
        const connectorRef = connectorRefValue
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
    [canFetchBuckets, refetchBuckets, accountId, orgIdentifier, projectIdentifier, connectorRefValue]
  )

  // Validation
  const validationSchema = Yup.object().shape({
    project: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('projectLabel') })),
    bucket: Yup.mixed().required(
      getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.bucketLabel') })
    )
  })

  const getProjectHelperText = React.useCallback(
    (formik: FormikProps<GoolgeCloudStorageRegistrySpec>) => {
      if (fetchProjectsError) {
        return <FormError name={`project`} errorMessage={getRBACErrorMessage(fetchProjectsError as RBACError)} />
      }
      const prevStepConnectorRef = getConnectorIdValue(prevStepData)
      if (
        getMultiTypeFromValue(get(formik?.values, `project`)) === MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(prevStepConnectorRef) === MultiTypeInputType.RUNTIME ||
          prevStepConnectorRef?.length === 0)
      ) {
        return getString('pipeline.projectHelperText')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prevStepData, fetchProjectsError]
  )

  const getBucketHelperText = React.useCallback(
    (formik: FormikProps<GoolgeCloudStorageRegistrySpec>) => {
      if (fetchBucketsError) {
        return <FormError name={`bucket`} errorMessage={getRBACErrorMessage(fetchBucketsError as RBACError)} />
      }
      const prevStepConnectorRef = getConnectorIdValue(prevStepData)
      if (
        getMultiTypeFromValue(get(formik?.values, `bucket`)) === MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(prevStepConnectorRef) === MultiTypeInputType.RUNTIME ||
          prevStepConnectorRef?.length === 0)
      ) {
        return getString('pipeline.bucketNameHelperText')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prevStepData, fetchBucketsError]
  )

  const itemRenderer = useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects || loadingBuckets} />
    ),
    [loadingProjects, loadingBuckets]
  )

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik<GoolgeCloudStorageRegistrySpec>
        initialValues={initialValues}
        formName="googleCloudStorageArtifact"
        validationSchema={validationSchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: getConnectorIdValue(prevStepData)
          })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm)}>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="project"
                  label={getString('projectLabel')}
                  placeholder={getString('common.selectProject')}
                  selectItems={projectOptions}
                  useValue
                  helperText={getProjectHelperText(formik)}
                  multiTypeInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED],
                    onChange: selected => {
                      if (formik.values.project !== (selected as unknown as any)?.value) {
                        resetFieldValue(formik, 'bucket')
                      }
                    },
                    selectProps: {
                      items: projectOptions,
                      noResults: (
                        <Text lineClamp={1} width={384} margin="small">
                          {getString('noProjects')}
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
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="bucket"
                  label={getString('pipelineSteps.bucketLabel')}
                  placeholder={getString('common.artifacts.googleCloudStorage.bucketPlaceholder')}
                  selectItems={bucketOptions}
                  useValue
                  helperText={getBucketHelperText(formik)}
                  multiTypeInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED],
                    selectProps: {
                      noResults: (
                        <Text lineClamp={1} width={384} margin="small">
                          {getString('pipeline.noBucketsFound')}
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
              </div>
            </div>
            <Layout.Horizontal spacing="medium">
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
