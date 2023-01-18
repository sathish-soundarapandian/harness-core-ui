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
  ButtonVariation,
  SelectWithSubmenuOption
} from '@harness/uicore'
import { cloneDeep, get, isArray, isEmpty, set } from 'lodash-es'
import { FieldArray } from 'formik'
import { Spinner } from '@blueprintjs/core'
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

  const [jobDetails, setJobDetails] = useState<SelectWithSubmenuOption[]>([])
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
      setJobDetails((prevState: SelectWithSubmenuOption[]) => {
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
          hasSubmenuItems: job.folder
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

  const getJobDetailsValue = (): SelectWithSubmenuOption | undefined => {
    const jobName = get(formik, `values.${prefix}spec.jobName`)
    if (jobName?.split('/').length > 1) {
      const parentJobName = jobName?.split('/')[0]
      const parentJob = jobDetails?.find(job => job.label === parentJobName)
      if (parentJob?.submenuItems?.length) {
        const targetChildJob = parentJob.submenuItems?.find(job => job.label === jobName)
        return targetChildJob as SelectWithSubmenuOption
      }
    }
    return jobDetails.find(job => job.label === get(formik, `values.${prefix}spec.jobName`)) as SelectWithSubmenuOption
  }

  const jobParameters = get(formik.values, `${prefix}spec.jobParameter`)

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
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.spec?.connectorRef
            }}
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
                width: 391,
                expressions,
                allowableTypes,
                selectWithSubmenuProps: {
                  items: jobDetails,
                  allowCreatingNewItems: true,
                  onChange: primaryValue => {
                    formik.setFieldValue(
                      `${prefix}spec.jobName`,
                      getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED
                        ? primaryValue.label
                        : primaryValue
                    )
                    if (
                      getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED &&
                      primaryValue?.label?.length
                    ) {
                      refetchJobParameters({
                        pathParams: { jobName: encodeURIComponent(primaryValue.label) },
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRef.toString()
                        }
                      })
                    }
                  },
                  onSubmenuOpen: (item?: SelectWithSubmenuOption) => {
                    lastOpenedJob.current = item?.label
                    const parentJob = jobDetails?.find(job => job.label === item?.label)
                    if (!parentJob?.submenuItems?.length) {
                      return refetchJobs({
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRef?.toString(),
                          parentJobName: item?.label
                        }
                      })
                    }
                    return Promise.resolve()
                  }
                }
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
            />
          </div>
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
