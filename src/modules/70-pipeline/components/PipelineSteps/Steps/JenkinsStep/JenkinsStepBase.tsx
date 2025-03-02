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
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectWithSubmenuOption
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { FieldArray } from 'formik'
import cx from 'classnames'
import { IconName, Spinner } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { cloneDeep, isArray, isEqual, memoize } from 'lodash-es'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { IItemRendererProps } from '@blueprintjs/select'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { JobDetails, useGetJobDetailsForJenkins, useGetJobParametersForJenkins } from 'services/cd-ng'
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
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@connectors/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import type { JenkinsStepProps } from './JenkinsStep'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JenkinsFormContentInterface, JenkinsStepData, jobParameterInterface } from './types'
import { getJenkinsJobParentChildName, resetForm, scriptInputType, getJobValue } from './helper'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JenkinsStep.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  showChildJobField,
  setShowChildJobField,
  lastOpenedJob
}: JenkinsFormContentInterface): React.ReactElement {
  const { getString } = useStrings()
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const { expressions } = useVariablesExpression()
  const { values: formValues } = formik
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SelectWithBiLevelOption[]>([])
  const [jobDetailsType, setJobDetailsType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(formValues.spec.jobName)
  )
  const [childJobDetails, setChildJobDetails] = useState<SelectWithBiLevelOption[]>([])
  const [childJob, setChildJob] = useState<SelectWithBiLevelOption>(
    (formValues.spec.childJobName !== undefined
      ? getJobValue(formValues.spec.childJobName)
      : {}) as SelectWithBiLevelOption
  )
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
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
    refetch: refetchChildJobs,
    data: childJobsResponse,
    loading: fetchingChildJobs,
    error: fetchingChildJobsError
  } = useGetJobDetailsForJenkins({
    lazy: formValues.spec.childJobName === undefined,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefFixedValue?.toString(),
      parentJobName:
        typeof formValues.spec.jobName === 'string' ? formValues.spec.jobName : formValues.spec.jobName?.label
    }
  })

  const {
    refetch: refetchJobParameters,
    data: jobParameterResponse,
    loading: fetchingJobParameters
  } = useGetJobParametersForJenkins({
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
      formik.setValues({
        ...formik.values,
        spec: {
          ...formik.values.spec,
          jobParameter: parameterData
        }
      })
    }
  }, [jobParameterResponse])

  useEffect(() => {
    if (typeof formik.values.spec.jobName === 'string' && jobDetails?.length) {
      const targetJob = jobDetails?.find(job => job.label === formik.values?.spec?.jobName)
      if (targetJob) {
        formik.setValues({
          ...formik.values,
          spec: {
            ...formik.values.spec,
            jobName: targetJob
          }
        })
      } else {
        if (
          formik.values.spec.jobName?.split('/').length > 1 &&
          jobDetails?.length &&
          getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.FIXED
        ) {
          setShowChildJobField(true)
          const parentJobName = formik.values.spec.jobName?.split('/')[0]
          lastOpenedJob.current = parentJobName
          const parentJob = jobDetails?.find(job => job.label === parentJobName)
          if (parentJob?.submenuItems?.length) {
            const targetChildJob = parentJob.submenuItems?.find(job => job.label === formik.values?.spec?.jobName)
            setChildJob(targetChildJob as SelectWithBiLevelOption)
            formik.setValues({
              ...formik.values,
              spec: {
                ...formik.values.spec,
                jobName: targetChildJob as SelectWithBiLevelOption
              }
            })
          } else {
            refetchJobs({
              queryParams: {
                ...commonParams,
                connectorRef: connectorRefFixedValue?.toString(),
                parentJobName
              }
            })
          }
        } else if (
          getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.FIXED &&
          formik.values?.spec?.jobName?.length > 0
        ) {
          formik.setValues({
            ...formik.values,
            spec: {
              ...formik.values.spec,
              jobName: {
                label: formik.values?.spec?.jobName,
                value: formik.values?.spec?.jobName,
                submenuItems: [],
                hasSubmenuItems: false
              } as SelectWithBiLevelOption
            }
          })
          setJobDetails([
            ...jobDetails,
            { label: formik.values?.spec?.jobName, value: formik.values?.spec?.jobName, submenuItems: [] }
          ])
        }
      }
    }
  }, [jobDetails])

  useEffect(() => {
    if (lastOpenedJob.current) {
      if (
        jobsResponse?.data?.jobDetails?.find(jobInstance => jobInstance.jobName === formik.values.spec.jobName) ||
        typeof formik.values.spec.jobName !== 'string' ||
        getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.RUNTIME ||
        formik.values.spec.jobName === ''
      ) {
        setJobDetails((prevState: SelectWithBiLevelOption[]) => {
          const clonedJobDetails = prevState.length
            ? cloneDeep(prevState)
            : getJobItems(jobsResponse?.data?.jobDetails || [])
          const probableParentName = jobsResponse?.data?.jobDetails?.[0]?.jobName?.split('/')?.[0]
          const parentJob = clonedJobDetails.find(obj => obj.label === probableParentName)
          if (parentJob) {
            parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
          }
          return clonedJobDetails
        })
      }
    } else {
      const jobs = getJobItems(jobsResponse?.data?.jobDetails || [])
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

  useEffect(() => {
    if (childJobsResponse?.data) {
      setChildJobDetails(getJobItems(childJobsResponse?.data?.jobDetails || []))
    }
  }, [childJobsResponse])

  useEffect(() => {
    if (
      getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED &&
      connectorRefFixedValue?.length &&
      !fetchingJobs
    ) {
      refetchJobs({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue?.toString()
        }
      })
    }
  }, [formik.values.spec.connectorRef])

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

  const jobNameRenderer = memoize((item: SelectWithBiLevelOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={fetchingJobs}
      icon={item?.hasSubmenuItems ? 'folder-open' : ('file' as IconName)}
    />
  ))

  const childJobNameRenderer = memoize((item: SelectWithBiLevelOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={fetchingChildJobs}
      icon={item?.hasSubmenuItems ? 'folder-open' : ('file' as IconName)}
    />
  ))

  const getJobNameValue = (): SelectWithBiLevelOption | string => {
    if (showChildJobField) {
      const parentJob = jobDetails.find(job => job.label === lastOpenedJob?.current)
      if (parentJob) return parentJob
    }

    if (formValues?.spec?.jobName && jobDetailsType === MultiTypeInputType.FIXED) {
      return getJobValue(formValues?.spec?.jobName)
    }

    return formValues?.spec?.jobName
  }

  const jobNamePlaceholder =
    connectorRefFixedValue && getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED
      ? fetchingJobs
        ? getString('common.loadingFieldOptions', { fieldName: getString('pipeline.jenkinsStep.job') })
        : fetchingJobsError?.message
        ? fetchingJobsError?.message
        : getString('select')
      : getString('select')

  const childJobNamePlaceholder =
    connectorRefFixedValue && getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED
      ? fetchingChildJobs
        ? getString('common.loadingFieldOptions', {
            fieldName: `${lastOpenedJob.current || getString('connectors.jenkins.child')} ${getString(
              'pipeline.jenkinsStep.job'
            )}`
          })
        : fetchingChildJobsError?.message
        ? fetchingChildJobsError?.message
        : getString('select')
      : getString('select')

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
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
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
            if (value?.record?.identifier !== connectorRefFixedValue) {
              setChildJob({} as SelectWithBiLevelOption)
              setShowChildJobField(false)
              resetForm(
                formik,
                'connectorRef',
                '',
                !(getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.RUNTIME)
              )
              setJobDetails([])
            }
            lastOpenedJob.current = null
          }}
          setRefValue
          disabled={readonly}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 6 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: Connectors.JENKINS,
              label: getString('connectors.jenkins.jenkinsConnectorLabel'),
              disabled: readonly,
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg, css.jobDetails)}>
        <FormInput.MultiTypeBiLevelInput
          label={getString('connectors.jenkins.jobNameLabel')}
          name={'spec.jobName'}
          value={getJobNameValue()}
          placeholder={jobNamePlaceholder}
          multiTypeInputProps={{
            onChange: (primaryValue: any) => {
              if (primaryValue?.hasSubmenuItems) {
                setShowChildJobField(true)
                lastOpenedJob.current = primaryValue?.label
                const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                if (!parentJob?.submenuItems?.length) {
                  setChildJobDetails([])
                  setChildJob({} as SelectWithBiLevelOption)
                  refetchChildJobs({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefFixedValue?.toString(),
                      parentJobName: primaryValue?.label
                    }
                  })
                }
              } else {
                setShowChildJobField(false)
                if (getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED && primaryValue?.label?.length) {
                  refetchJobParameters({
                    pathParams: { jobName: encodeURIComponent(encodeURIComponent(primaryValue.label)) },
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefFixedValue?.toString()
                    }
                  })
                }
              }
              setChildJob({} as SelectWithBiLevelOption)
              formik.setValues({
                ...formik.values,
                spec: {
                  ...formik.values.spec,
                  jobName: (primaryValue as SelectWithBiLevelOption)?.label ?? primaryValue,
                  ...(showChildJobField && { childJobName: undefined }),
                  jobParameter:
                    getMultiTypeFromValue(primaryValue) === MultiTypeInputType.RUNTIME ? RUNTIME_INPUT_VALUE : []
                }
              })
            },
            onTypeChange: (type: MultiTypeInputType) => setJobDetailsType(type),
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
        {getMultiTypeFromValue(formik.values.spec.jobName) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: -4 }}
            value={formik.values.spec.jobName as string}
            type="String"
            variableName="spec.jobName"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.jobName', value)
              setShowChildJobField(false)
            }}
            isReadonly={readonly}
          />
        )}
      </div>
      {showChildJobField && (
        <div className={cx(stepCss.formGroup, stepCss.lg, css.jobDetails)}>
          <FormInput.MultiTypeBiLevelInput
            label={`${lastOpenedJob.current || getString('connectors.jenkins.child')} ${getString(
              'connectors.jenkins.jobs'
            )}`}
            name={'spec.childJobName'}
            value={childJob}
            placeholder={childJobNamePlaceholder}
            multiTypeInputProps={{
              onChange: (primaryValue: any) => {
                if (getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED && primaryValue?.label?.length) {
                  refetchJobParameters({
                    pathParams: { jobName: encodeURIComponent(encodeURIComponent(primaryValue.label)) },
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefFixedValue?.toString()
                    }
                  })
                }
                setChildJob(primaryValue)
                formik.setValues({
                  ...formik.values,
                  spec: {
                    ...formik.values.spec,
                    childJobName: primaryValue as SelectWithSubmenuOption,
                    jobParameter:
                      getMultiTypeFromValue(primaryValue) === MultiTypeInputType.RUNTIME ? RUNTIME_INPUT_VALUE : []
                  }
                })
              },
              onTypeChange: (type: MultiTypeInputType) => setJobDetailsType(type),
              expressions,
              selectProps: {
                allowCreatingNewItems: false,
                items: childJobDetails,
                addClearBtn: false,
                itemRenderer: childJobNameRenderer
              },
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
            selectItems={childJobDetails}
          />
        </div>
      )}

      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.jobParameter"
          key={getMultiTypeFromValue(formik.values.spec.jobParameter as string)}
          label={getString('pipeline.jenkinsStep.jobParameter')}
          isOptional
          optionalLabel={getString('titleOptional')}
          defaultValueToReset={[]}
          disableTypeSelection={false}
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
                  {fetchingJobParameters ? (
                    <Spinner />
                  ) : (
                    isArray(formValues.spec.jobParameter) &&
                    formValues.spec.jobParameter?.map((type: jobParameterInterface, i: number) => {
                      return (
                        <div className={css.jobParameter} key={type.id}>
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
                              defaultValueToReset: '',
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
                    })
                  )}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-environmentVar"
                    disabled={readonly}
                    onClick={() => push({ name: '', type: 'String', value: '' })}
                    className={css.addButton}
                  >
                    {getString('pipeline.jenkinsStep.addJobParameters')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
        {getMultiTypeFromValue(formik.values?.spec?.jobParameter as string) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values?.spec?.jobParameter as string}
            type="String"
            variableName="spec.jobParameter"
            className={css.minConfigBtn}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setValues({
                ...formik.values,
                spec: {
                  ...formik.values.spec,
                  jobParameter: value
                }
              })
            }}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup)}>
        <FormInput.CheckBox
          name="spec.unstableStatusAsSuccess"
          label={getString('pipeline.jenkinsStep.unstableStatusAsSuccess')}
          disabled={readonly}
        />
      </div>
      <div className={cx(stepCss.formGroup)}>
        <FormInput.CheckBox
          name="spec.useConnectorUrlForJobExecution"
          label={getString('pipeline.jenkinsStep.useConnectorUrlForJobExecution')}
          disabled={readonly}
        />
      </div>
    </React.Fragment>
  )
}

function JenkinsStepBase(
  { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange }: JenkinsStepProps,
  formikRef: StepFormikFowardRef<JenkinsStepData>
): React.ReactElement {
  const { getString } = useStrings()
  const { jobName, childJobName } = getJenkinsJobParentChildName(initialValues.spec.jobName)
  const updatedInitialValues = {
    ...initialValues,
    spec: {
      ...initialValues.spec,
      jobName,
      childJobName
    }
  }
  const [showChildJobField, setShowChildJobField] = useState<boolean>(childJobName !== undefined ? true : false)
  const lastOpenedJob = useRef<any>(childJobName !== undefined ? jobName : null)
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('common.validation.connectorRef')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('common.validation.connectorRef'))
      ),
      jobName: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.jenkinsStep.validations.jobName')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.jenkinsStep.validations.jobName'))
      ),
      childJobName: Yup.string().when('jobName', {
        is: () => showChildJobField,
        then: Yup.string()
          .trim()
          .required(
            getString('common.validation.fieldIsRequired', {
              name: `${lastOpenedJob.current || getString('connectors.jenkins.child')} ${getString(
                'connectors.jenkins.jobs'
              )}`
            })
          )
      })
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik
      initialValues={updatedInitialValues}
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
              showChildJobField={showChildJobField}
              setShowChildJobField={setShowChildJobField}
              lastOpenedJob={lastOpenedJob}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const JenkinsStepBaseWithRef = React.forwardRef(JenkinsStepBase)
