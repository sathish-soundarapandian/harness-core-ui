/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  MultiSelectOption,
  FormikForm,
  SelectWithSubmenuOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, defaultTo, isEqual, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  JobDetails,
  useGetArtifactPathForJenkins,
  useGetJobDetailsForJenkins
} from 'services/cd-ng'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { JenkinsRegistrySpec } from 'services/pipeline-ng'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

function FormComponent(
  props: StepProps<ConnectorConfigDTO> &
    ImagePathProps<JenkinsRegistrySpec> & { formik: FormikProps<JenkinsRegistrySpec> }
): React.ReactElement {
  const { prevStepData, initialValues, previousStep, formik } = props
  const { getString } = useStrings()
  const lastOpenedJob = useRef<any>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SelectWithSubmenuOption[]>([])
  const selectedJobName = useRef<string | null>(null)
  const [artifactPath, setFilePath] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getConnectorIdValue(prevStepData)
  const jobNameValue = formik.values?.jobName
  const artifactPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingArtifacts} />
  ))

  const {
    refetch: refetchJobs,
    data: jobsResponse,
    loading: fetchingJobs,
    error: fetchingJobsError
  } = useGetJobDetailsForJenkins({
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    }
  })

  const {
    refetch: refetchartifactPaths,
    data: artifactPathsResponse,
    loading: fetchingArtifacts,
    error: errorFetchingPath
  } = useGetArtifactPathForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    },
    jobName: encodeURIComponent(encodeURIComponent((jobNameValue as any)?.label || ''))
  })

  useEffect(() => {
    if (artifactPathsResponse?.data) {
      const artifactPathResponseFormatted: MultiSelectOption[] = artifactPathsResponse?.data?.map(
        (artifactPathVal: string) => {
          return {
            label: artifactPathVal,
            value: artifactPathVal
          } as MultiSelectOption
        }
      )
      setFilePath(artifactPathResponseFormatted)
    }
  }, [artifactPathsResponse])

  const getJobItems = (jobs: JobDetails[]): SelectWithSubmenuOption[] => {
    return jobs?.map(job => {
      return {
        label: job.jobName || '',
        value: job.url || '',
        submenuItems: [],
        hasSubmenuItems: job.folder
      }
    })
  }

  useEffect(() => {
    if (typeof formik.values?.jobName === 'string' && jobDetails?.length) {
      const targetJob = jobsResponse?.data?.jobDetails?.find(job => job.jobName === initialValues.jobName)
      if (targetJob) {
        const jobObj = {
          label: targetJob?.jobName || '',
          value: targetJob?.url || '',
          submenuItems: [],
          hasSubmenuItems: targetJob?.folder
        }
        formik.setValues({
          ...formik.values,
          jobName: jobObj as any
        })
      } else {
        if (formik.values.jobName?.split('/').length > 1) {
          const parentJobName = formik.values.jobName?.split('/')[0]
          lastOpenedJob.current = parentJobName
          const parentJob = jobDetails?.find(job => job.label === parentJobName)
          if (parentJob?.submenuItems?.length) {
            const targetChildJob = parentJob.submenuItems?.find(job => job.label === formik.values?.jobName)
            formik.setValues({
              ...formik.values,
              jobName: targetChildJob as any
            })
          } else {
            refetchJobs({
              queryParams: {
                ...commonParams,
                connectorRef: connectorRefValue?.toString(),
                parentJobName
              }
            })
          }
        }
      }
    }
  }, [jobDetails])

  useEffect(() => {
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SelectWithSubmenuOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const parentJob = clonedJobDetails.find(obj => obj.value === lastOpenedJob.current)
        if (parentJob) {
          parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
        }
        return clonedJobDetails
      })
    } else {
      const jobs = jobsResponse?.data?.jobDetails?.map(job => {
        return {
          label: job.jobName || '',
          value: job.url || '',
          submenuItems: [],
          hasSubmenuItems: job.folder
        }
      })
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

  const jobnamePlaceholder =
    connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
      ? fetchingJobs
        ? getString('loading')
        : fetchingJobsError?.message
        ? fetchingJobsError?.message
        : getString('select')
      : getString('select')

  return (
    <FormikForm>
      <div className={cx(css.connectorForm)}>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.SelectWithSubmenuTypeInput
            label={getString('connectors.jenkins.jobNameLabel')}
            name={'jobName'}
            placeholder={jobnamePlaceholder}
            selectItems={jobDetails}
            selectWithSubmenuTypeInputProps={{
              width: 500,
              allowableTypes: [MultiTypeInputType.FIXED],
              selectWithSubmenuProps: {
                items: jobDetails,
                allowCreatingNewItems: true,
                onChange: primaryValue => {
                  selectedJobName.current =
                    getMultiTypeFromValue(primaryValue) === MultiTypeInputType.RUNTIME
                      ? (primaryValue as unknown as string)
                      : primaryValue.label
                },
                onSubmenuOpen: (item?: SelectWithSubmenuOption) => {
                  lastOpenedJob.current = item?.value
                  const parentJob = jobDetails?.find(job => job.label === item?.label)
                  if (!parentJob?.submenuItems?.length) {
                    return refetchJobs({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRefValue?.toString(),
                        parentJobName: item?.label
                      }
                    })
                  }
                  return Promise.resolve()
                }
              }
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.artifactPathLabel')}
            name="artifactPath"
            useValue
            isOptional
            placeholder={fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')}
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('artifactPath', type),
              width: 500,
              selectProps: {
                allowCreatingNewItems: true,
                items: defaultTo(artifactPath, []),
                itemRenderer: artifactPathItemRenderer,
                noResults: (
                  <NoTagResults
                    tagError={errorFetchingPath}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={
                      fetchingArtifacts
                        ? getString('loading')
                        : jobNameValue
                        ? getString('common.filters.noResultsFound')
                        : `${getString('pipeline.artifactsSelection.validation.jobConnectorRequired')} artifactPath`
                    }
                  />
                )
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  !jobNameValue
                ) {
                  return
                }
                refetchartifactPaths()
              },
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
            selectItems={artifactPath || []}
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
  )
}

export function JenkinsArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<JenkinsRegistrySpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  const submitFormData = (formData: JenkinsRegistrySpec, connectorId?: string): void => {
    handleSubmit({
      connectorRef: connectorId,
      artifactPath: formData.artifactPath,
      jobName: (formData.jobName as unknown as SelectOption).label
    })
  }

  const primarySchema = Yup.object().shape({
    jobName: Yup.lazy(value =>
      typeof value === 'object'
        ? Yup.object().required(getString('pipeline.jenkinsStep.validations.jobName')) // typeError is necessary here, otherwise we get a bad-looking yup error
        : Yup.string().required(getString('pipeline.jenkinsStep.validations.jobName'))
    ),
    artifactPath: Yup.string()
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="jenkinsTrigger"
        validationSchema={primarySchema}
        onSubmit={formData => {
          submitFormData(
            {
              ...formData
            },
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
