/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, FormInput, SelectOption } from '@wings-software/uicore'
import { cloneDeep, get, isArray, isEmpty, set } from 'lodash-es'
import { FieldArray } from 'formik'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { JobDetails, useGetJobDetailsForJenkins, useGetJobParametersForJenkins } from 'services/cd-ng'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { jobParameterInterface, SubmenuSelectOption } from './types'
import { resetForm } from './helper'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import stepCss from './JenkinsStep.module.scss'

export const jobParameterInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function JenkinsStepInputSet(formContentProps: any): JSX.Element {
  const { initialValues, allowableTypes, template, path, readonly, formik, inputSetData } = formContentProps
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
  const { refetch: refetchJobs, data: jobsResponse } = useGetJobDetailsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const { refetch: refetchJobParameters, data: jobParameterResponse } = useGetJobParametersForJenkins({
    lazy: true,
    jobName: ''
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
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
        const parentJob = prevState.find(obj => obj.value === lastOpenedJob.current)
        if (parentJob) {
          parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
        }
        return prevState
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
    if (jobName?.split('/').length > 1) {
      const parentJobName = jobName?.split('/')[0]
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
    refetchJobs({
      queryParams: {
        ...commonParams,
        connectorRef: connectorRef.toString()
      }
    })
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
            <FormMultiTypeDurationField
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                allowableTypes,
                expressions,
                disabled: readonly
              }}
              label={getString('pipelineSteps.timeoutLabel')}
              name={`${prefix}timeout`}
              disabled={readonly}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
          <FormMultiTypeConnectorField
            name={`${prefix}spec.connectorRef`}
            label={getString('pipeline.jiraApprovalStep.connectorRef')}
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
            <FormInput.SelectWithSubmenuTypeInput
              label={'Job Name'}
              name={`${prefix}spec.jobName`}
              value={getJobDetailsValue()}
              selectItems={jobDetails}
              selectWithSubmenuTypeInputProps={{
                expressions,
                allowableTypes,
                selectWithSubmenuProps: {
                  items: jobDetails,
                  interactionKind: PopoverInteractionKind.CLICK,
                  allowCreatingNewItems: true,
                  onChange: (primaryValue, secondaryValue, type) => {
                    const newJobName =
                      type === MultiTypeInputType.FIXED && primaryValue && secondaryValue
                        ? secondaryValue
                        : primaryValue || ''
                    const clonedFormik = cloneDeep(formik.values)
                    set(clonedFormik, `${prefix}spec.jobName`, newJobName.label)
                    if (type !== MultiTypeInputType.FIXED) {
                      set(clonedFormik, `${prefix}spec.jobParameter`, [])
                    }
                    formik.setValues({
                      ...clonedFormik
                    })
                    if (type === MultiTypeInputType.FIXED) {
                      refetchJobParameters({
                        pathParams: { jobName: encodeURIComponent(newJobName.label) },
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRef.toString()
                        }
                      })
                    }
                  },
                  onOpening: (item: SelectOption) => {
                    lastOpenedJob.current = item.value
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
            />
          </div>
        ) : null}

        {(isArray(template?.spec?.jobParameter) && template?.spec?.jobParameter) ||
        (get(formik, `values.${prefix}spec.jobParameter`) &&
          get(formik, `values.${prefix}spec.jobParameter`).length) ? (
          <div className={css.formGroup}>
            <MultiTypeFieldSelector
              name={`${prefix}spec.jobParameter`}
              label={getString('pipeline.scriptInputVariables')}
              defaultValueToReset={[]}
              disableTypeSelection
              formik={formik}
            >
              <FieldArray
                name={`${prefix}spec.jobParameter`}
                render={() => {
                  return (
                    <div className={stepCss.panel}>
                      <div className={stepCss.jobParameter}>
                        <span className={css.label}>Name</span>
                        <span className={css.label}>Type</span>
                        <span className={css.label}>Value</span>
                      </div>
                      {(get(formik, `values.${prefix}spec.jobParameter`) || [])?.map((type: any, i: number) => {
                        return (
                          <div className={stepCss.jobParameter} key={type.value}>
                            <FormInput.Text
                              name={`${prefix}spec.jobParameter[${i}].name`}
                              placeholder={getString('name')}
                              disabled={true}
                            />
                            <FormInput.Select
                              items={jobParameterInputType}
                              name={`${prefix}spec.jobParameter[${i}].type`}
                              placeholder={getString('typeLabel')}
                              disabled={true}
                            />
                            <FormInput.MultiTextInput
                              name={`${prefix}spec.jobParameter[${i}].value`}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: readonly
                              }}
                              label=""
                              disabled={readonly}
                              placeholder={getString('valueLabel')}
                            />
                          </div>
                        )
                      })}
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
