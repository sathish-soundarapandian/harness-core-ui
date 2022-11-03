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
} from '@wings-software/uicore'
import { cloneDeep, get, isArray, isEmpty, set } from 'lodash-es'
import { FieldArray } from 'formik'
import { PopoverInteractionKind, Spinner } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { JobDetails, useGetJobDetailsForJenkins, useGetJobParametersForJenkins } from 'services/cd-ng'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { MultiSelectWithSubmenuTypeInputField } from '@common/components/MultiSelectWithSubmenuTypeInput/MultiSelectWithSubmenuTypeInput'
import type { jobParameterInterface, SubmenuSelectOption } from './types'
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

  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const getJobItems = (jobs: JobDetails[]): SubmenuSelectOption[] => {
    return jobs?.map(job => {
      return {
        label: job.jobName || '',
        value: job.url || '',
        submenuItems: [],
        hasSubItems: job.folder
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
    if (!isArray(get(formik, `values.${prefix}spec.jobParameter`))) {
      formik.setFieldValue(
        `${prefix}spec.jobParameter`,
        isArray(template?.spec?.jobParameter) ? template?.spec?.jobParameter : []
      )
    }
  }, [])

  useEffect(() => {
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const parentJob = clonedJobDetails.find(obj => obj.label === lastOpenedJob.current)
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
          hasSubItems: job.folder
        }
      })
      setJobDetails(jobs || [])
    }
  }, [jobsResponse])

  useEffect(() => {
    const jobName = get(formik, `values.${prefix}spec.jobName`)
    if (jobName?.split('/').length > 1 && jobDetails.length) {
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

  const getJobDetailsValue = (): SubmenuSelectOption | undefined => {
    const jobName = get(formik, `values.${prefix}spec.jobName`)
    if (jobName?.split('/').length > 1) {
      const parentJobName = jobName?.split('/')[0]
      const parentJob = jobDetails?.find(job => job.label === parentJobName)
      if (parentJob?.submenuItems?.length) {
        const targetChildJob = parentJob.submenuItems?.find(job => job.label === jobName)
        return targetChildJob as SubmenuSelectOption
      }
    }
    return jobDetails.find(job => job.label === get(formik, `values.${prefix}spec.jobName`)) as SubmenuSelectOption
  }

  return (
    <>
      <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
          <div className={cx(css.formGroup, css.sm)}>
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
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
          <FormMultiTypeConnectorField
            name={`${prefix}spec.connectorRef`}
            label={getString('connectors.jenkins.jenkinsConnectorLabel')}
            selected={(initialValues?.spec?.connectorRef as string) || ''}
            placeholder={getString('connectors.selectConnector')}
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
              if (type === MultiTypeInputType.FIXED && !isEmpty(value)) {
                setConnectorRef((value as any)?.record?.name)
              }
              resetForm(formik, 'connectorRef', prefix)
            }}
            type={'Jenkins'}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        ) : null}

        {getMultiTypeFromValue(template?.spec?.jobName) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(css.formGroup, css.lg)}>
            <MultiSelectWithSubmenuTypeInputField
              label={'Job Name'}
              name={`${prefix}spec.jobName`}
              value={getJobDetailsValue()}
              selectItems={jobDetails}
              placeholder={
                connectorRef && getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
                  ? fetchingJobs
                    ? 'Fetching jobs...'
                    : fetchingJobsError?.message
                    ? fetchingJobsError?.message
                    : getString('select')
                  : getString('select')
              }
              selectWithSubmenuTypeInputProps={{
                expressions,
                allowableTypes,
                selectWithSubmenuProps: {
                  loading: fetchingJobs,
                  items: jobDetails,
                  interactionKind: PopoverInteractionKind.CLICK,
                  allowCreatingNewItems: true,
                  onChange: (primaryValue, secondaryValue, type) => {
                    const newJobName =
                      type === MultiTypeInputType.FIXED && primaryValue && secondaryValue
                        ? secondaryValue
                        : primaryValue || ''

                    formik.setFieldValue(
                      `${prefix}spec.jobName`,
                      type === MultiTypeInputType.FIXED ? newJobName.label : newJobName
                    )
                    refetchJobParameters({
                      pathParams: { jobName: encodeURIComponent(newJobName.label) },
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRef.toString()
                      }
                    })
                  },
                  onOpening: (item: SelectOption) => {
                    lastOpenedJob.current = item.label
                    refetchJobs({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRef?.toString(),
                        parentJobName: item.label
                      }
                    })
                  }
                }
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
            />
          </div>
        ) : null}

        {isArray(template?.spec?.jobParameter) ||
        getMultiTypeFromValue(template?.spec?.jobParameter) === MultiTypeInputType.RUNTIME ? (
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
