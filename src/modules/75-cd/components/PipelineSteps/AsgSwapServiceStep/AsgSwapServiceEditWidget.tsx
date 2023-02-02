import React from 'react'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { Formik, FormInput } from '@harness/uicore'
import cx from 'classnames'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { AsgSwapServiceData, AsgSwapServiceProps } from './AsgSwapServiceStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AsgSwapServiceWidget = (
  props: AsgSwapServiceProps,
  formikRef: StepFormikFowardRef<AsgSwapServiceData>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<AsgSwapServiceData>
        onSubmit={(values: AsgSwapServiceData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        validate={(values: AsgSwapServiceData) => {
          /* istanbul ignore next */
          onChange?.(values)
        }}
        formName="AsgSwapService"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<AsgSwapServiceData>) => {
          setFormikRef(formikRef, formik)
          return (
            <>
              {stepViewType === StepViewType.Template ? null : (
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
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{
                    expressions,
                    enableConfigureOptions: true,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>
              <div className={stepCss.divider} />
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.downsizeOldAsg"
                  label={getString('cd.downsizeOldAsg')}
                  disabled={readonly}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}
