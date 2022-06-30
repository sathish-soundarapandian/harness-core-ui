/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  Accordion,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup'
import { FieldArray } from 'formik'
import cx from 'classnames'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { cloneDeep, isEqual } from 'lodash-es'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { JobDetails, useGetJobDetailsForJenkins } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { JenkinsStepProps } from './JenkinsStep'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JenkinsFormContentInterface, JenkinsStepData, jobParameterInterface, SubmenuSelectOption } from './types'
import { resetForm, scriptInputType, variableSchema, useGetJobParametersForJenkins } from './helper'
import OptionalConfiguration from './OptionalConfiguration'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JenkinsStep.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: JenkinsFormContentInterface): React.ReactElement {
  const { getString } = useStrings()
  const lastOpenedJob = useRef<any>(null)
  const { expressions } = useVariablesExpression()
  const { values: formValues } = formik
  // const parentJobY = useRef<any>(null)
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const { refetch: refetchJobs, data: jobsResponse } = useGetJobDetailsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const { refetch: refetchJobParameters } = useGetJobParametersForJenkins({
    lazy: true,
    jobName: ''
  })

  // useEffect(() => {
  //   if (jobParameterResponse?.data) {
  //     const parameterData: jobParameterInterface[] =
  //       jobParameterResponse?.data?.map(item => {
  //         return {
  //           name: item.name,
  //           value: item.defaultValue,
  //           type: 'String',
  //           id: uuid()
  //         } as jobParameterInterface
  //       }) || []
  //     formik.setValues({
  //       ...formik.values,
  //       spec: {
  //         ...formik.values.spec,
  //         jobParameter: parameterData
  //       }
  //     })
  //   }
  // }, [jobParameterResponse])

  useEffect(() => {
    if (typeof formik.values.spec.jobName === 'string' && jobsResponse?.data?.jobDetails?.length) {
      const targetJob = jobsResponse?.data?.jobDetails?.find(job => job.url === formik.values?.spec?.jobName)
      if (targetJob) {
        const jobObj = {
          label: targetJob?.jobName || '',
          value: targetJob?.url || '',
          submenuItems: [],
          hasSubItems: targetJob?.folder
        }
        formik.setValues({
          ...formik.values,
          spec: {
            ...formik.values.spec,
            jobName: jobObj as any
          }
        })
      }
    }
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
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
          hasSubItems: job.folder
        }
      })
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

  // useEffect(() => {
  //   if (lastOpenedJob.current && parentJobY.current) {
  //     const jobListMenu = document.getElementsByClassName('bp3-menu')[0]
  //     jobListMenu?.scrollTo(0, parentJobY.current)
  //   }
  // }, [jobDetails])

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

  useEffect(() => {
    refetchJobs({
      queryParams: {
        ...commonParams,
        connectorRef: connectorRefFixedValue?.toString()
      }
    })
  }, [formik.values.spec.connectorRef])

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

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: readonly
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={readonly}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: false,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('connectors.jenkins.jenkinsConnectorLabel')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Jenkins"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          onChange={(value: any, _unused) => {
            // setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(
                formik,
                'connectorRef',
                '',
                getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.RUNTIME ? false : true
              )
            }
            lastOpenedJob.current = null
          }}
          disabled={readonly}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg, css.jobDetails)}>
        <FormInput.SelectWithSubmenuTypeInput
          label={'Job Name'}
          name={'spec.jobName'}
          placeholder={formik.values.spec.jobName || 'Select a job'}
          selectItems={jobDetails}
          selectWithSubmenuTypeInputProps={{
            selectWithSubmenuProps: {
              items: jobDetails,
              value:
                formik.values.spec.connectorRef === MultiTypeInputType.RUNTIME
                  ? (MultiTypeInputType.RUNTIME as any)
                  : jobDetails.find(job => job.label === formik.values.spec.jobName),
              interactionKind: PopoverInteractionKind.CLICK,
              allowCreatingNewItems: true,
              onChange: (primaryValue, secondaryValue, type) => {
                const newJobName = secondaryValue ? secondaryValue : primaryValue
                if (!primaryValue) {
                  return
                }
                formik.setValues({
                  ...formik.values,
                  spec: {
                    ...formik.values.spec,
                    jobName: type === MultiTypeInputType.RUNTIME ? primaryValue : (newJobName as any)
                  }
                })
                if (type !== MultiTypeInputType.FIXED) {
                  formik.setValues({
                    ...formik.values,
                    spec: {
                      ...formik.values.spec,
                      jobName: type === MultiTypeInputType.RUNTIME ? primaryValue : (newJobName as any),
                      jobParameter: []
                    }
                  })
                }
                if (type !== MultiTypeInputType.RUNTIME) {
                  refetchJobParameters({
                    pathParams: { jobName: encodeURIComponent(newJobName.label) },
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefFixedValue?.toString()
                    }
                  })
                }
                resetForm(formik, 'jobName', '')
              },
              onOpening: (item: SelectOption) => {
                lastOpenedJob.current = item.value
                // TODO: To scroll the jobDetails component to its original height
                // const indexOfParent = jobDetails.findIndex(obj => obj.value === item.value)
                // const parentNode = document.getElementsByClassName('Select--menuItem')?.[indexOfParent]
                // if (parentNode) {
                //   parentJobY.current = parentNode.getBoundingClientRect()?.y
                // }
                refetchJobs({
                  queryParams: {
                    ...commonParams,
                    connectorRef: connectorRefFixedValue?.toString(),
                    parentJobName: item.label
                  }
                })
              }
            }
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.jobName"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.jobName', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.jobParameter"
          label={getString('pipeline.jenkinsStep.jobParameter')}
          isOptional
          allowedTypes={allowableTypes}
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[]}
          disableTypeSelection={readonly}
        >
          <FieldArray
            name="spec.jobParameter"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.jobParameter}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formValues.spec.jobParameter?.map(({ id }: jobParameterInterface, i: number) => {
                    return (
                      <div className={css.jobParameter} key={id}>
                        <FormInput.Text
                          name={`spec.jobParameter.[${i}].name`}
                          placeholder={getString('name')}
                          disabled={readonly}
                        />
                        <FormInput.Select
                          items={scriptInputType}
                          name={`spec.jobParameter.[${i}].type`}
                          placeholder={getString('typeLabel')}
                          disabled={readonly}
                        />
                        <FormInput.MultiTextInput
                          name={`spec.jobParameter.[${i}].value`}
                          placeholder={getString('valueLabel')}
                          multiTextInputProps={{
                            allowableTypes,
                            expressions,
                            disabled: readonly
                          }}
                          label=""
                          disabled={readonly}
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
                  })}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-environmentVar"
                    disabled={readonly}
                    onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                    className={css.addButton}
                  >
                    {getString('addInputVar')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
        {getMultiTypeFromValue(formik.values?.spec?.jobParameter as any) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values?.spec?.jobParameter as any}
            type="String"
            variableName="spec.jobParameter"
            className={css.minConfigBtn}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              formik.setValues({
                ...formik.values,
                spec: {
                  ...formik.values.spec,
                  jobParameter: value as any
                }
              })
            }}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.noLookDivider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={<OptionalConfiguration readonly={readonly} allowableTypes={allowableTypes} />}
        />
      </Accordion>
    </React.Fragment>
  )
}

export function JenkinsStepBase(
  { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange }: JenkinsStepProps,
  formikRef: StepFormikFowardRef<JenkinsStepData>
): React.ReactElement {
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(getString('common.validation.connectorRef')),
      jobName: Yup.string().required(getString('pipeline.jenkinsStep.validations.jobName')),
      jobParameter: variableSchema(getString)
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik
      initialValues={initialValues}
      formName="JenkinsStep"
      validate={valuesToValidate => {
        onChange?.(valuesToValidate)
      }}
      onSubmit={(_values: JenkinsStepData) => {
        onUpdate?.(_values)
      }}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<JenkinsStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const JenkinsStepBaseWithRef = React.forwardRef(JenkinsStepBase)
