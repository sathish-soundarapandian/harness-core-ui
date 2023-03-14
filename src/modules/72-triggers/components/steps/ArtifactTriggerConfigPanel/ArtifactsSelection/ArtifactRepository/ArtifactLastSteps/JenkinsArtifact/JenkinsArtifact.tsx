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
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, defaultTo, isEqual, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { FormikProps } from 'formik'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { IconName } from '@blueprintjs/core'
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
  const [jobDetails, setJobDetails] = useState<SelectWithBiLevelOption[]>([])
  const [showChildJobField, setShowChildJobField] = useState<boolean>(false)
  const [childJob, setChildJob] = useState<SelectWithBiLevelOption>({} as SelectWithBiLevelOption)
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

  const jobNameRenderer = memoize((item: SelectWithBiLevelOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={fetchingJobs}
      icon={item?.hasSubmenuItems ? 'folder-open' : ('file' as IconName)}
    />
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

  const getJobItems = (jobs: JobDetails[]): SelectWithBiLevelOption[] => {
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
      const targetJob = jobDetails?.find(job => job.label === initialValues.jobName)
      if (targetJob) {
        formik.setValues({
          ...formik.values,
          jobName: targetJob as any
        })
      } else {
        if (formik.values.jobName?.split('/').length > 1) {
          const parentJobName = formik.values.jobName?.split('/')[0]
          setShowChildJobField(true)
          lastOpenedJob.current = parentJobName
          const parentJob = jobDetails?.find(job => job.label === parentJobName)
          if (parentJob?.submenuItems?.length) {
            const targetChildJob = parentJob.submenuItems?.find(job => job.label === formik.values?.jobName)
            setChildJob(targetChildJob as SelectWithBiLevelOption)
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
        } else if (
          getMultiTypeFromValue(formik.values.jobName) === MultiTypeInputType.FIXED &&
          formik.values?.jobName?.length > 0
        ) {
          formik.setValues({
            ...formik.values,
            jobName: {
              label: formik.values?.jobName,
              value: formik.values?.jobName,
              submenuItems: [],
              hasSubmenuItems: false
            } as any
          })
          setJobDetails([
            ...jobDetails,
            { label: formik.values?.jobName, value: formik.values?.jobName, submenuItems: [] }
          ])
        }
      }
    }
  }, [jobDetails])

  useEffect(() => {
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SelectWithBiLevelOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const probableParentName = jobsResponse?.data?.jobDetails?.[0]?.jobName?.split('/')?.[0]
        const parentJob = clonedJobDetails.find(obj => obj.label === probableParentName)
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

  const childJobDetails = () => {
    if (showChildJobField && lastOpenedJob.current) {
      const childJobs: SelectWithBiLevelOption[] =
        jobDetails.find(item => item.label === lastOpenedJob.current)?.submenuItems || []
      return childJobs
    }
    return []
  }

  const getJobnameValue = () => {
    if (showChildJobField) {
      const parentJob = jobDetails.find(job => job.label === lastOpenedJob?.current)
      if (parentJob) return parentJob
    }
    return formik?.values?.jobName
  }

  return (
    <FormikForm>
      <div className={cx(css.connectorForm)}>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeBiLevelInput
            label={getString('connectors.jenkins.jobNameLabel')}
            name={'jobName'}
            value={getJobnameValue()}
            placeholder={jobnamePlaceholder}
            multiTypeInputProps={{
              onChange: (primaryValue: any) => {
                if (primaryValue?.hasSubmenuItems) {
                  setShowChildJobField(true)
                  lastOpenedJob.current = primaryValue?.label
                  const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                  if (!parentJob?.submenuItems?.length) {
                    refetchJobs({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRefValue?.toString(),
                        parentJobName: primaryValue?.label
                      }
                    })
                  }
                } else {
                  setChildJob({} as SelectWithBiLevelOption)
                  setShowChildJobField(false)
                }
                formik.setValues({
                  ...formik.values,
                  jobName: primaryValue as any
                })
              },

              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('jobName', type),
              selectProps: {
                allowCreatingNewItems: true,
                items: jobDetails,
                addClearBtn: true,
                itemRenderer: jobNameRenderer
              },
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
            selectItems={jobDetails || []}
          />
        </div>
        {showChildJobField && (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTypeBiLevelInput
              label={`${lastOpenedJob.current || getString('connectors.jenkins.child')} ${getString(
                'connectors.jenkins.jobs'
              )}`}
              name={'jobName'}
              value={childJob}
              placeholder={jobnamePlaceholder}
              multiTypeInputProps={{
                onChange: (primaryValue: any) => {
                  if (primaryValue?.hasSubmenuItems) {
                    lastOpenedJob.current = primaryValue?.label
                    const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                    if (!parentJob?.submenuItems?.length) {
                      refetchJobs({
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRefValue?.toString(),
                          parentJobName: primaryValue?.label
                        }
                      })
                    }
                  }
                  setChildJob(primaryValue)
                  formik.setValues({
                    ...formik.values,
                    jobName: primaryValue as any
                  })
                },

                onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('jobName', type),
                selectProps: {
                  allowCreatingNewItems: false,
                  items: childJobDetails(),
                  addClearBtn: false,
                  itemRenderer: jobNameRenderer
                },
                allowableTypes: [MultiTypeInputType.FIXED]
              }}
              selectItems={childJobDetails() || []}
            />
          </div>
        )}
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
