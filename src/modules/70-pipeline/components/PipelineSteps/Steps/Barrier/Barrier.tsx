import React, { useEffect, useState } from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineInfoConfig, StepElementConfig } from 'services/cd-ng'

import { useGetPipeline, VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import css from './Barrier.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type BarrierData = StepElementConfig

export interface BarrierVariableStepProps {
  initialValues: BarrierData
  stageIdentifier: string
  onUpdate?(data: BarrierData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: BarrierData
}

interface BarrierProps {
  initialValues: BarrierData
  onUpdate?: (data: BarrierData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: BarrierData
    path?: string
    readonly?: boolean
  }
}

const processBarrierFormData = (values: BarrierData): BarrierData => {
  return {
    ...values,
    spec: {
      ...values.spec,
      barrierRef:
        getMultiTypeFromValue(values.spec?.barrierRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec?.barrierRef as SelectOption)?.value?.toString()
          : values.spec?.barrierRef
    }
  }
}

function BarrierWidget(props: BarrierProps, formikRef: StepFormikFowardRef<BarrierData>): React.ReactElement {
  const {
    state: { pipeline }
  } = React.useContext(PipelineContext)
  const { initialValues, onUpdate, isNewStep = true } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  let barriers: SelectOption[] = []
  if (pipeline?.flowControl?.barriers?.length) {
    barriers = pipeline?.flowControl?.barriers?.map(barrier => ({
      label: barrier.name,
      value: barrier.identifier
    }))
  }

  const processForFormValues = (values: BarrierData): BarrierData => {
    return {
      ...values,
      spec: {
        ...values.spec,
        barrierRef:
          getMultiTypeFromValue(values.spec?.barrierRef as SelectOption) === MultiTypeInputType.FIXED
            ? barriers?.find(opt => opt.value === values.spec?.barrierRef)
            : values.spec?.barrierRef
      }
    }
  }

  const [initialValuesFormik, setInitialValuesFormik] = useState<BarrierData>(processForFormValues(initialValues))

  useEffect(() => {
    if (initialValues.spec?.barrierRef) {
      const updatedValues = processForFormValues(initialValues)
      setInitialValuesFormik(updatedValues)
    }
  }, [initialValues.spec?.barrierRef])

  return (
    <>
      <Formik<BarrierData>
        onSubmit={(values: BarrierData) => {
          onUpdate?.(processBarrierFormData(values))
        }}
        formName="barrierStep"
        initialValues={{ ...initialValuesFormik }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            barrierRef: Yup.string().required(getString('pipeline.barrierStep.barrierReferenceRequired'))
          })
        })}
      >
        {(formik: FormikProps<BarrierData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
              </div>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.MultiTypeInput
                  label={getString('pipeline.barrierStep.barrierReference')}
                  name="spec.barrierRef"
                  placeholder={getString('pipeline.barrierStep.barrierReferencePlaceholder')}
                  selectItems={barriers}
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                  }}
                />
                {getMultiTypeFromValue(formik?.values?.spec?.barrierRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik?.values?.spec?.barrierRef as string}
                    type={getString('string')}
                    variableName="spec.barrierRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik?.setFieldValue('spec.barrierRef', value)}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={css.width25}
                  multiTypeDurationProps={{
                    enableConfigureOptions: false,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                  }}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="step.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('timeout', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const BarrierInputStep: React.FC<BarrierProps> = ({ inputSetData }) => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [pipeline, setPipeline] = React.useState<{ pipeline: PipelineInfoConfig } | undefined>()
  const { data: pipelineResponse, loading } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }
  })
  React.useEffect(() => {
    if (pipelineResponse?.data?.yamlPipeline) {
      setPipeline(parse(pipelineResponse?.data?.yamlPipeline))
    }
  }, [pipelineResponse?.data?.yamlPipeline])
  const { getString } = useStrings()
  let barriers: SelectOption[] = []
  if (pipeline?.pipeline?.flowControl?.barriers?.length) {
    barriers = pipeline.pipeline?.flowControl?.barriers?.map(barrier => ({
      label: barrier.name,
      value: barrier.identifier
    }))
  }

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.barrierRef) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          selectProps={{
            addClearBtn: true,
            allowCreatingNewItems: true
          }}
          disabled={loading}
          className={css.width50}
          items={barriers}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}.spec.barrierRef`}
          key="barrierRef"
          label={getString('pipeline.barrierStep.barrierReference')}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={inputSetData?.readonly}
          className={css.width50}
        />
      )}
    </>
  )
}

const BarrierVariableStep: React.FC<BarrierVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const BarrierWidgetWithRef = React.forwardRef(BarrierWidget)
export class BarrierStep extends PipelineStep<BarrierData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  renderStep(props: StepProps<BarrierData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <BarrierInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <BarrierVariableStep
          {...(customStepProps as BarrierVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <BarrierWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
  validateInputSet(
    data: BarrierData,
    template: BarrierData,
    getString?: UseStringsReturn['getString']
  ): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    if (isEmpty(data?.timeout) && getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  processFormData(values: BarrierData): BarrierData {
    return processBarrierFormData(values)
  }

  protected type = StepType.Barrier
  protected stepName = 'Synchronization Barrier'
  protected stepIcon: IconName = 'barrier-open'

  protected defaultValues: BarrierData = {
    identifier: '',
    timeout: '10m'
  }
}
