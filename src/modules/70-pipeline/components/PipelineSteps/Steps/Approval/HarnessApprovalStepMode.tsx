/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { produce } from 'immer'
import { isEmpty, compact, isArray } from 'lodash-es'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import {
  Accordion,
  Button,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  Container
} from '@wings-software/uicore'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { String, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { FormMultiTypeUserGroupInput } from '@common/components/UserGroupsInput/FormMultitypeUserGroupInput'
import { regexPositiveNumbers } from '@common/utils/StringUtils'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type {
  ApproverInputsSubmitCallInterface,
  HarnessApprovalData,
  HarnessApprovalFormContentProps,
  HarnessApprovalStepModeProps
} from './types'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HarnessApproval.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: HarnessApprovalFormContentProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: isApprovalStepFieldDisabled(readonly)
            }}
          />
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          className={stepCss.sm}
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
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

      <div className={stepCss.stepSubSectionHeading}>Approval Message</div>
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeTextAreaField
          name="spec.approvalMessage"
          label={getString('message')}
          className={css.approvalMessage}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
          placeholder="Please add relevant information for this step"
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.approvalMessage) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.approvalMessage as string}
            type="String"
            variableName="spec.approvalMessage"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.approvalMessage', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <FormInput.CheckBox
        name="spec.includePipelineExecutionHistory"
        label={getString('pipeline.approvalStep.includePipelineExecutionHistory')}
        disabled={isApprovalStepFieldDisabled(readonly)}
      />

      <div className={stepCss.stepSubSectionHeading}>Approvers</div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeUserGroupInput
          name="spec.approvers.userGroups"
          label={getString('common.userGroups')}
          formik={formik}
          tooltipProps={{ dataTooltipId: 'harnessApproval_spec.approvers.userGroups' }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          expressions={expressions}
          allowableTypes={allowableTypes}
        />
        {getMultiTypeFromValue(formik.values.spec.approvers.userGroups) === MultiTypeInputType.RUNTIME && (
          <Container margin={{ top: 'medium' }}>
            <ConfigureOptions
              value={formik.values.spec.approvers.userGroups as string}
              type="String"
              variableName="spec.approvers.userGroups"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.approvers.userGroups', value)}
              isReadonly={readonly}
            />
          </Container>
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name="spec.approvers.minimumCount"
          label={getString('pipeline.approvalStep.minimumCount')}
          multiTextInputProps={{
            expressions,
            textProps: {
              type: 'number'
            },
            allowableTypes
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.approvers?.minimumCount as string) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.approvers?.minimumCount as string}
            type="Number"
            variableName="spec.approvers.minimumCount"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.approvers.minimumCount', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <FormInput.CheckBox
        name="spec.approvers.disallowPipelineExecutor"
        label={getString('pipeline.approvalStep.disallowPipelineExecutor')}
        disabled={isApprovalStepFieldDisabled(readonly)}
      />

      <div className={stepCss.noLookDivider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div className={stepCss.formGroup}>
              <FieldArray
                name="spec.approverInputs"
                validateOnChange={false}
                render={({ push, remove }) => {
                  return (
                    <div>
                      <div className={stepCss.stepSubSectionHeading} data-tooltip-id="approverInputs">
                        <>Approver Inputs</>
                        <HarnessDocTooltip tooltipId="approverInputs" useStandAlone={true} />
                      </div>
                      {isEmpty(formik.values.spec.approverInputs) ? null : (
                        <>
                          <div className={css.headerRow}>
                            <String className={css.label} stringID="variableNameLabel" />
                            <String className={css.label} stringID="common.configureOptions.defaultValue" />
                          </div>
                          {(formik.values.spec.approverInputs as ApproverInputsSubmitCallInterface[]).map(
                            (_unused: ApproverInputsSubmitCallInterface, i: number) => (
                              <div className={css.headerRow} key={i}>
                                <FormInput.Text
                                  name={`spec.approverInputs[${i}].name`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  placeholder={getString('name')}
                                />
                                <FormInput.MultiTextInput
                                  name={`spec.approverInputs[${i}].defaultValue`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  label=""
                                  placeholder={getString('valueLabel')}
                                  multiTextInputProps={{
                                    allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.RUNTIME),
                                    expressions
                                  }}
                                />
                                <Button
                                  minimal
                                  icon="main-trash"
                                  data-testid={`remove-approverInputs-${i}`}
                                  disabled={isApprovalStepFieldDisabled(readonly)}
                                  onClick={() => remove(i)}
                                />
                              </div>
                            )
                          )}
                        </>
                      )}
                      <Button
                        icon="plus"
                        minimal
                        intent="primary"
                        data-testid="add-approverInput"
                        disabled={isApprovalStepFieldDisabled(readonly)}
                        onClick={() => push({ name: '', defaultValue: '' })}
                      >
                        {getString('pipeline.approvalStep.addApproverInputs')}
                      </Button>
                    </div>
                  )
                }}
              />
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

/*
functional component as this component doesn't need a state of it's own.
everything is governed from the parent
*/
function HarnessApprovalStepMode(
  props: HarnessApprovalStepModeProps,
  formikRef: StepFormikFowardRef<HarnessApprovalData>
) {
  const { onUpdate, isNewStep = true, readonly, stepViewType, onChange, allowableTypes } = props
  const { getString } = useStrings()

  const handleOnSubmit = (values: HarnessApprovalData) => {
    onUpdate?.(
      produce(values, draft => {
        const userGroupValues = draft.spec.approvers?.userGroups

        if (isArray(userGroupValues) && userGroupValues.length > 0) {
          draft.spec.approvers.userGroups = compact(userGroupValues as string[])
        }
      })
    )
  }

  return (
    <Formik<HarnessApprovalData>
      onSubmit={handleOnSubmit}
      initialValues={props.initialValues}
      formName="harnessApproval"
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          approvalMessage: Yup.string().trim().required(getString('pipeline.approvalStep.validation.approvalMessage')),
          approvers: Yup.object().shape({
            userGroups: Yup.mixed()
              .required(getString('pipeline.approvalStep.validation.userGroups'))
              .test({
                test(value: string | string[]) {
                  if (Array.isArray(value) && isEmpty(compact(value))) {
                    return this.createError({
                      message: getString('pipeline.approvalStep.validation.userGroups')
                    })
                  }

                  return true
                }
              }),
            minimumCount: Yup.string()
              .required(getString('pipeline.approvalStep.validation.minimumCountRequired'))
              .test({
                test(value: string) {
                  if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && !value.match(regexPositiveNumbers)) {
                    return this.createError({
                      message: getString('pipeline.approvalStep.validation.minimumCountOne')
                    })
                  }
                  return true
                }
              })
          })
        })
      })}
    >
      {(formik: FormikProps<HarnessApprovalData>) => {
        /*
        this is required - so that validatios work while switching basic to advanced forms.
        i.e. if the current form is invalid, we should not allow the switch to advanced tab
        */
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              isNewStep={isNewStep}
              readonly={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const HarnessApprovalStepModeWithRef = React.forwardRef(HarnessApprovalStepMode)
export default HarnessApprovalStepModeWithRef
