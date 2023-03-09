/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  FormInput,
  SelectOption,
  Button,
  ButtonVariation
} from '@harness/uicore'
import { cloneDeep, get, isArray, isEmpty, memoize, set } from 'lodash-es'
import { FieldArray } from 'formik'
import { IconName, Spinner } from '@blueprintjs/core'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { JobDetails, useGetJobDetailsForJenkins, useGetJobParametersForJenkins } from 'services/cd-ng'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { ConnectorRefType, getScopedConnectorValue } from '@pipeline/utils/stepUtils'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import type { jobParameterInterface } from './types'
import { resetForm } from './helper'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import stepCss from './JenkinsStep.module.scss'

export const jobParameterInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function JenkinsStepInputSet(formContentProps: any): JSX.Element {
  const { initialValues, allowableTypes, template, path, readonly, formik, inputSetData, stepViewType } =
    formContentProps
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()
  const lastOpenedJob = useRef<any>(null)
  const { expressions } = useVariablesExpression()
  const [connectorRef, setConnectorRef] = React.useState(
    get(formik, `values.${prefix}spec.connectorRef`) || get(inputSetData?.allValues, 'spec.connectorRef', '')
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const [jobDetails, setJobDetails] = useState<SelectWithBiLevelOption[]>([])
  const [showChildJobField, setShowChildJobField] = useState<boolean>(false)
  const [childJob, setChildJob] = useState<SelectWithBiLevelOption>({} as SelectWithBiLevelOption)
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
  const {
    refetch: refetchJobs,
    data: jobsResponse,
    loading: fetchingJobs,
    error: fetchingJobsError
  } = useGetJobDetailsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchJobParameters,
    data: jobParameterResponse,
    loading: fetchingJobParameters
  } = useGetJobParametersForJenkins({
    lazy:
      isArray(template?.spec?.jobParameter) ||
      getMultiTypeFromValue(template?.spec?.jobParameter) === MultiTypeInputType.RUNTIME,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRef.toString()
    },
    jobName: encodeURIComponent(get(inputSetData?.allValues, 'spec.jobName', ''))
  })

  useEffect(() => {
    if (jobParameterResponse?.data) {
      const parameterData: jobParameterInterface[] =
        jobParameterResponse?.data?.map(item => {
          return {
            name: item.name,
            value: item.defaultValue,
            type: 'String'
          } as jobParameterInterface
        }) || []
      const clonedFormik = cloneDeep(formik.values)
      set(clonedFormik, `${prefix}spec.jobParameter`, parameterData)
      formik.setValues({
        ...clonedFormik
      })
    }
  }, [jobParameterResponse])

  useEffect(() => {
    if (!isArray(get(formik, `values.${prefix}spec.jobParameter`)) && template?.spec?.jobParameter) {
      formik.setFieldValue(
        `${prefix}spec.jobParameter`,
        isArray(template?.spec?.jobParameter) ? template?.spec?.jobParameter : []
      )
    }
  }, [])

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
      setJobDetails(jobs || [])
    }
  }, [jobsResponse])

  useEffect(() => {
    const jobName = get(formik, `values.${prefix}spec.jobName.label`) || get(formik, `values.${prefix}spec.jobName`)
    if (jobName?.split('/').length > 1 && jobDetails.length) {
      setShowChildJobField(true)
      const parentJobName = jobName?.split('/')[0]
      lastOpenedJob.current = parentJobName
      const parentJob = jobDetails?.find(job => job.label === parentJobName)
      if (!parentJob?.submenuItems?.length) {
        refetchJobs({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRef?.toString(),
            parentJobName
          }
        })
      } else {
        const targetChildJob = parentJob.submenuItems?.find(job => job.label === jobName)
        setChildJob(targetChildJob as SelectWithBiLevelOption)
      }
    }
  }, [jobDetails])

  useEffect(() => {
    if (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED) {
      refetchJobs({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRef.toString()
        }
      })
    }
  }, [connectorRef])

  const jobParameters = get(formik.values, `${prefix}spec.jobParameter`)

  const childJobDetails = () => {
    if (showChildJobField && lastOpenedJob.current) {
      const childJobs: SelectWithBiLevelOption[] =
        jobDetails.find(item => item.label === lastOpenedJob.current)?.submenuItems || []
      return childJobs
    }
    return []
  }

  const getJobnameValue = () => {
    const jobName = get(formik, `values.${prefix}spec.jobName`)
    if (showChildJobField) {
      const parentJob = jobDetails.find(job => job.label === lastOpenedJob?.current)
      if (parentJob) return parentJob
    }
    const jobDetail = jobDetails.find(job => job.label === jobName)
    if (jobDetail) return jobDetail
    return {
      label: jobName,
      value: jobName,
      submenuItems: [],
      hasSubmenuItems: false
    } as SelectWithBiLevelOption
  }

  const jobNameRenderer = memoize((item: SelectWithBiLevelOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={fetchingJobs}
      icon={item?.hasSubmenuItems ? 'folder-open' : ('file' as IconName)}
    />
  ))

  return (
    <>
      <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
          <TimeoutFieldInputSetView
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
            className={cx(css.formGroup, css.sm)}
          />
        )}
        {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
          <FormMultiTypeConnectorField
            name={`${prefix}spec.connectorRef`}
            label={getString('connectors.jenkins.jenkinsConnectorLabel')}
            selected={(initialValues?.spec?.connectorRef as string) || ''}
            placeholder={getString('common.entityPlaceholderText')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            width={385}
            setRefValue
            multiTypeProps={{
              allowableTypes,
              expressions
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            onChange={(value, _valueType, type) => {
              const connectorRefValue = getScopedConnectorValue(value as unknown as ConnectorRefType)
              if (type === MultiTypeInputType.FIXED && !isEmpty(connectorRefValue)) {
                setConnectorRef(connectorRefValue)
              }
              setChildJob({} as SelectWithBiLevelOption)
              setShowChildJobField(false)
              resetForm(formik, 'connectorRef', prefix)
            }}
            type={'Jenkins'}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.spec?.connectorRef
            }}
          />
        ) : null}

        {getMultiTypeFromValue(template?.spec?.jobName) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormInput.MultiTypeBiLevelInput
                label={'Job Name'}
                name={`${prefix}spec.jobName`}
                value={getJobnameValue()}
                placeholder={
                  connectorRef && getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
                    ? fetchingJobs
                      ? getString('common.loadingFieldOptions', { fieldName: getString('pipeline.jenkinsStep.job') })
                      : fetchingJobsError?.message
                      ? fetchingJobsError?.message
                      : getString('select')
                    : getString('select')
                }
                multiTypeInputProps={{
                  width: 400,
                  onChange: (primaryValue: any) => {
                    if (primaryValue?.hasSubmenuItems) {
                      setShowChildJobField(true)
                      lastOpenedJob.current = primaryValue?.label
                      const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                      if (!parentJob?.submenuItems?.length) {
                        refetchJobs({
                          queryParams: {
                            ...commonParams,
                            connectorRef: connectorRef?.toString(),
                            parentJobName: primaryValue?.label
                          }
                        })
                      }
                    } else {
                      setChildJob({} as SelectWithBiLevelOption)
                      setShowChildJobField(false)
                      if (
                        getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED &&
                        primaryValue?.label?.length
                      ) {
                        refetchJobParameters({
                          pathParams: { jobName: encodeURIComponent(encodeURIComponent(primaryValue.label)) },
                          queryParams: {
                            ...commonParams,
                            connectorRef: connectorRef?.toString()
                          }
                        })
                      }
                    }
                    formik.setFieldValue(
                      `${prefix}spec.jobName`,
                      getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED
                        ? primaryValue.label
                        : primaryValue
                    )
                  },

                  onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.jobName', type),
                  expressions,
                  selectProps: {
                    allowCreatingNewItems: true,
                    items: jobDetails,
                    addClearBtn: !readonly,
                    itemRenderer: jobNameRenderer
                  },
                  allowableTypes
                }}
                selectItems={jobDetails || []}
              />
            </div>
            {showChildJobField && (
              <div className={cx(css.formGroup, css.lg)}>
                <FormInput.MultiTypeBiLevelInput
                  label={`${lastOpenedJob.current || getString('connectors.jenkins.child')} ${getString(
                    'connectors.jenkins.jobs'
                  )}`}
                  name={`${prefix}spec.jobName`}
                  value={childJob}
                  placeholder={
                    connectorRef && getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
                      ? fetchingJobs
                        ? getString('common.loadingFieldOptions', { fieldName: getString('pipeline.jenkinsStep.job') })
                        : fetchingJobsError?.message
                        ? fetchingJobsError?.message
                        : getString('select')
                      : getString('select')
                  }
                  multiTypeInputProps={{
                    width: 400,
                    onChange: (primaryValue: any) => {
                      if (primaryValue?.hasSubmenuItems) {
                        lastOpenedJob.current = primaryValue?.label
                        const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                        if (!parentJob?.submenuItems?.length) {
                          return refetchJobs({
                            queryParams: {
                              ...commonParams,
                              connectorRef: connectorRef?.toString(),
                              parentJobName: primaryValue?.label
                            }
                          })
                        }
                      } else {
                        if (
                          getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED &&
                          primaryValue?.label?.length
                        ) {
                          refetchJobParameters({
                            pathParams: { jobName: encodeURIComponent(encodeURIComponent(primaryValue.label)) },
                            queryParams: {
                              ...commonParams,
                              connectorRef: connectorRef?.toString()
                            }
                          })
                        }
                      }
                      setChildJob(primaryValue)
                      formik.setFieldValue(
                        `${prefix}spec.jobName`,
                        getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED
                          ? primaryValue.label
                          : primaryValue
                      )
                    },

                    onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.jobName', type),
                    expressions,
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
          </>
        ) : null}

        {(isArray(template?.spec?.jobParameter) ||
          getMultiTypeFromValue(template?.spec?.jobParameter) === MultiTypeInputType.RUNTIME) &&
        Array.isArray(jobParameters) ? (
          <div className={css.formGroup}>
            <MultiTypeFieldSelector
              name={`${prefix}spec.jobParameter`}
              label={getString('pipeline.jenkinsStep.jobParameter')}
              defaultValueToReset={[]}
              disableTypeSelection
              formik={formik}
            >
              <FieldArray
                name={`${prefix}spec.jobParameter`}
                render={({ push, remove }) => {
                  return (
                    <div className={stepCss.panel}>
                      <div className={stepCss.jobParameter}>
                        <span className={css.label}>Name</span>
                        <span className={css.label}>Type</span>
                        <span className={css.label}>Value</span>
                      </div>
                      {fetchingJobParameters ? (
                        <Spinner />
                      ) : (
                        (get(formik, `values.${prefix}spec.jobParameter`) || [])?.map(
                          (type: jobParameterInterface, i: number) => {
                            const jobParameterPath = `${prefix}spec.jobParameter[${i}]`
                            return (
                              <div className={stepCss.jobParameter} key={type.id}>
                                <FormInput.Text
                                  name={`${jobParameterPath}.name`}
                                  placeholder={getString('name')}
                                  disabled={readonly}
                                />
                                <FormInput.Select
                                  items={jobParameterInputType}
                                  name={`${jobParameterPath}.type`}
                                  placeholder={getString('typeLabel')}
                                  disabled={readonly}
                                />
                                <FormInput.MultiTextInput
                                  name={`${jobParameterPath}.value`}
                                  multiTextInputProps={{
                                    allowableTypes,
                                    expressions,
                                    disabled: readonly
                                  }}
                                  label=""
                                  disabled={readonly}
                                  placeholder={getString('valueLabel')}
                                />
                                <Button
                                  variation={ButtonVariation.ICON}
                                  icon="main-trash"
                                  data-testid={`remove-environmentVar-${i}`}
                                  onClick={() => remove(i)}
                                  disabled={readonly}
                                />
                              </div>
                            )
                          }
                        )
                      )}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-environmentVar"
                        disabled={readonly}
                        onClick={() => push({ name: '', type: 'String', value: '' })}
                        className={stepCss.addButton}
                      >
                        {getString('pipeline.jenkinsStep.addJobParameters')}
                      </Button>
                    </div>
                  )
                }}
              />
            </MultiTypeFieldSelector>
          </div>
        ) : null}
      </FormikForm>
    </>
  )
}

export default JenkinsStepInputSet
