/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
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
import { get, isArray, isEmpty } from 'lodash-es'
import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { jobParameterInterface } from './types'
import { resetForm } from './helper'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import stepCss from './BambooStep.module.scss'

export const jobParameterInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function BambooStepInputSet(formContentProps: any): JSX.Element {
  const { initialValues, allowableTypes, template, path, readonly, formik, stepViewType } = formContentProps
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  // const [connectorRef, setConnectorRef] = React.useState(
  //   get(formik, `values.${prefix}spec.connectorRef`) || get(inputSetData?.allValues, 'spec.connectorRef', '')
  // )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  // const commonParams = {
  //   accountIdentifier: accountId,
  //   projectIdentifier,
  //   orgIdentifier,
  //   repoIdentifier,
  //   branch
  // }

  const jobParameters = get(formik.values, `${prefix}spec.planParameter`)

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
            label={getString('connectors.bamboo.bamboo')}
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
            onChange={_valueType => {
              // if (type === MultiTypeInputType.FIXED && !isEmpty(value)) {
              //   setConnectorRef((value as any)?.record?.name)
              // }
              resetForm(formik, 'connectorRef', prefix)
            }}
            type={'Bamboo'}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.spec?.connectorRef
            }}
          />
        ) : null}
        {/* 
        {getMultiTypeFromValue(template?.spec?.planName) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(css.formGroup, css.lg)}>
            <MultiTypeFieldSelector
              label={'Plan Name'}
              name={`${prefix}spec.planName`}
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
        ) : null} */}

        {(isArray(template?.spec?.planParameter) ||
          getMultiTypeFromValue(template?.spec?.planParameter) === MultiTypeInputType.RUNTIME) &&
        Array.isArray(jobParameters) ? (
          <div className={css.formGroup}>
            <MultiTypeFieldSelector
              name={`${prefix}spec.planParameter`}
              label={getString('pipeline.bambooStep.planParameter')}
              defaultValueToReset={[]}
              disableTypeSelection
              formik={formik}
            >
              <FieldArray
                name={`${prefix}spec.planParameter`}
                render={({ push, remove }) => {
                  return (
                    <div className={stepCss.panel}>
                      <div className={stepCss.jobParameter}>
                        <span className={css.label}>Name</span>
                        <span className={css.label}>Type</span>
                        <span className={css.label}>Value</span>
                      </div>

                      {(get(formik, `values.${prefix}spec.planParameter`) || [])?.map(
                        (type: jobParameterInterface, i: number) => {
                          const jobParameterPath = `${prefix}spec.planParameter[${i}]`
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
                                data-testid={`remove-planParameter-${i}`}
                                onClick={() => remove(i)}
                                disabled={readonly}
                              />
                            </div>
                          )
                        }
                      )}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-planParameter"
                        disabled={readonly}
                        onClick={() => push({ name: '', type: 'String', value: '' })}
                        className={stepCss.addButton}
                      >
                        {getString('pipeline.bambooStep.addPlanParameters')}
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

export default BambooStepInputSet
