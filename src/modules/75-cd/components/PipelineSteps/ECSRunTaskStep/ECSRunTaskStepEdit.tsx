/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import type { IOptionProps } from '@blueprintjs/core'
import {
  Accordion,
  AllowedTypes,
  Button,
  ButtonVariation,
  Container,
  FormError,
  Formik,
  FormikForm,
  FormInput,
  HarnessDocTooltip,
  Layout,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ECSRunTaskStepInitialValues } from './ECSRunTaskStep'
import { TaskDefinitionModal } from './TaskDefinitionModal'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ECSRunTaskStepEdit.module.scss'

const enum TaskDefinitionType {
  TaskDefinition = 'taskDefinition',
  TaskDefinitionARN = 'taskDefinitionARN'
}
export const taskDefinitionTypes: IOptionProps[] = [
  {
    label: 'ECS Run Task Definition',
    value: TaskDefinitionType.TaskDefinition
  },
  {
    label: 'ECS Run Task Definition ARN',
    value: TaskDefinitionType.TaskDefinitionARN
  }
]

export interface ECSRunTaskStepProps {
  initialValues: ECSRunTaskStepInitialValues
  onUpdate?: (data: ECSRunTaskStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ECSRunTaskStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSRunTaskStepEdit = (
  props: ECSRunTaskStepProps,
  formikRef: StepFormikFowardRef<ECSRunTaskStepInitialValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props

  const [selectedManifest, setSelectedManifest] = useState<ManifestTypes | null>(null)
  const [connectorView, setConnectorView] = useState(false)
  const [showTaskDefinitionModal, setShowTaskDefinitionModal] = useState<boolean>(false)
  const [isRunTaskRequestDefinition, setIsRunTaskRequestDefinition] = useState<boolean>(false)

  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const onAddTaskDefinitionClick = (): void => {
    setSelectedManifest(ManifestDataType.EcsTaskDefinition)
    setShowTaskDefinitionModal(true)
  }

  const onAddRunTaskRequestDefinitionClick = (): void => {
    setIsRunTaskRequestDefinition(true)
    onAddTaskDefinitionClick()
  }

  const onEditTaskDefinitionClick = (): void => {
    setSelectedManifest(ManifestDataType.EcsTaskDefinition)
    setConnectorView(false)
    setShowTaskDefinitionModal(true)
  }

  const onEditRunTaskRequestDefinition = (): void => {
    setIsRunTaskRequestDefinition(true)
    onEditTaskDefinitionClick()
  }

  const onTaskDefinitionModalClose = (): void => {
    setConnectorView(false)
    setSelectedManifest(null)
    setShowTaskDefinitionModal(false)
    setIsRunTaskRequestDefinition(false)
  }

  const modifiedInitialValues: ECSRunTaskStepInitialValues = React.useMemo(() => {
    const calculatedInitialValues: ECSRunTaskStepInitialValues = {
      ...initialValues
    }
    if (initialValues.spec.taskDefinitionArn) {
      calculatedInitialValues.spec.taskDefinitionType = TaskDefinitionType.TaskDefinitionARN
    }
    if (initialValues.spec.taskDefinition || isEmpty(initialValues.spec.taskDefinitionArn)) {
      calculatedInitialValues.spec.taskDefinitionType = TaskDefinitionType.TaskDefinition
    }
    return calculatedInitialValues
  }, [initialValues])

  const onSubmit = (formValues: ECSRunTaskStepInitialValues) => {
    if (formValues.spec.taskDefinitionType === TaskDefinitionType.TaskDefinition) {
      delete formValues.spec.taskDefinitionArn
    } else {
      delete formValues.spec.taskDefinition
    }
    delete formValues.spec.taskDefinitionType
    onUpdate?.(formValues)
  }

  const getTaskDefinitionListItem = (
    taskDefinitionName: string,
    formik: FormikProps<ECSRunTaskStepInitialValues>,
    renderRunTaskRequestDefinition: boolean
  ): React.ReactElement => {
    return (
      <Layout.Horizontal
        spacing="medium"
        padding={{ top: 'small', bottom: 'small' }}
        margin={{ top: 'small' }}
        flex={{ alignItems: 'center' }}
        border={{
          bottom: true,
          top: true
        }}
        background={Color.FORM_BG}
      >
        <Text lineClamp={1} width="100%" font={{ variation: FontVariation.BODY2 }}>
          {taskDefinitionName}
        </Text>
        <Layout.Horizontal>
          <Button
            icon="Edit"
            disabled={readonly}
            variation={ButtonVariation.ICON}
            onClick={renderRunTaskRequestDefinition ? onEditRunTaskRequestDefinition : onEditTaskDefinitionClick}
            data-testid={renderRunTaskRequestDefinition ? `edit-run-task-request-definition` : `edit-task-definition`}
          ></Button>
          <Button
            icon="main-trash"
            disabled={readonly}
            onClick={() => {
              if (renderRunTaskRequestDefinition) {
                formik.setFieldValue('spec.runTaskRequestDefinition', undefined)
              } else {
                formik.setFieldValue('spec.taskDefinition', undefined)
              }
              setSelectedManifest(null)
            }}
            variation={ButtonVariation.ICON}
            data-testid={
              renderRunTaskRequestDefinition ? `delete-run-task-request-definition` : `delete-task-definition`
            }
          ></Button>
        </Layout.Horizontal>
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <Formik<ECSRunTaskStepInitialValues>
        onSubmit={onSubmit}
        formName="ecsRunTaskStepForm"
        initialValues={modifiedInitialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            taskDefinition: Yup.object().when('taskDefinitionType', {
              is: TaskDefinitionType.TaskDefinition,
              then: Yup.object().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinition')
                })
              )
            }),
            taskDefinitionArn: Yup.string().when('taskDefinitionType', {
              is: TaskDefinitionType.TaskDefinitionARN,
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinitionArn')
                })
              )
            }),
            runTaskRequestDefinition: Yup.object().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.steps.ecsRunTaskStep.runTaskRequestDefinition')
              })
            )
          })
        })}
      >
        {(formik: FormikProps<ECSRunTaskStepInitialValues>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <FormikForm>
              <NameTimeoutField
                values={{ name: values.name, timeout: values.timeout }}
                setFieldValue={setFieldValue}
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={css.ecsRunTaskDefinitionSourceArnRadioGroup}>
                <FormInput.RadioGroup
                  label={'Task Definition'}
                  name="spec.taskDefinitionType"
                  radioGroup={{ inline: true }}
                  items={taskDefinitionTypes}
                />
              </div>

              {formik.values.spec.taskDefinitionType === TaskDefinitionType.TaskDefinition && (
                <>
                  <div className={css.ecsRunTaskDefinitionTitle} data-tooltip-id={`ecsRunTaskDefinition`}>
                    {getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinition')}
                    <HarnessDocTooltip tooltipId={`ecsRunTaskDefinition`} useStandAlone={true} />
                  </div>
                  <Container>
                    {!!formik.values.spec?.taskDefinition?.type &&
                      getTaskDefinitionListItem(getString('cd.steps.ecsRunTaskStep.runTaskDefinition'), formik, false)}
                    {!formik.values.spec?.taskDefinition?.type && (
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-task-definition"
                        disabled={readonly}
                        onClick={onAddTaskDefinitionClick}
                        className={stepCss.topMargin5}
                      >
                        {getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')}
                      </Button>
                    )}
                    {!isEmpty(formik.errors.spec?.taskDefinition) && (
                      <FormError
                        name={getString('cd.steps.ecsRunTaskStep.runTaskDefinition')}
                        errorMessage={formik.errors.spec?.taskDefinition}
                      ></FormError>
                    )}
                  </Container>
                </>
              )}

              {formik.values.spec.taskDefinitionType === TaskDefinitionType.TaskDefinitionARN && (
                <Container>
                  <FormInput.MultiTextInput
                    label={getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinitionArn')}
                    name="spec.taskDefinitionArn"
                    placeholder={getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinitionArnPlaceholder')}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                </Container>
              )}

              <div className={css.ecsRunTaskRequestDefinitionTitle} data-tooltip-id={`ecsRunTaskRequestDefinition`}>
                {getString('cd.steps.ecsRunTaskStep.ecsRunTaskRequestDefinition')}
                <HarnessDocTooltip tooltipId={`ecsRunTaskRequestDefinition`} useStandAlone={true} />
              </div>
              <Container>
                {!!formik.values.spec?.runTaskRequestDefinition?.type &&
                  getTaskDefinitionListItem(
                    getString('cd.steps.ecsRunTaskStep.runTaskRequestDefinition'),
                    formik,
                    true
                  )}
                {!formik.values.spec?.runTaskRequestDefinition?.type && (
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-run-task-request-definition"
                    disabled={readonly}
                    onClick={onAddRunTaskRequestDefinitionClick}
                    className={stepCss.topMargin5}
                  >
                    {getString('cd.steps.ecsRunTaskStep.runTaskRequestDefinition')}
                  </Button>
                )}
                {!isEmpty(formik.errors.spec?.runTaskRequestDefinition) && (
                  <FormError
                    name={getString('cd.steps.ecsRunTaskStep.runTaskDefinition')}
                    errorMessage={formik.errors.spec?.runTaskRequestDefinition}
                  ></FormError>
                )}
              </Container>

              {selectedManifest && (
                <TaskDefinitionModal
                  initialValues={
                    isRunTaskRequestDefinition
                      ? formik.values.spec.runTaskRequestDefinition
                      : formik.values.spec?.taskDefinition
                  }
                  allowableTypes={allowableTypes}
                  readonly={false}
                  onTaskDefinitionModalClose={onTaskDefinitionModalClose}
                  connectorView={connectorView}
                  updateManifestList={(manifestObj: ManifestConfigWrapper) => {
                    if (isRunTaskRequestDefinition) {
                      setFieldValue('spec.runTaskRequestDefinition', manifestObj.manifest?.spec.store)
                      setIsRunTaskRequestDefinition(false)
                    } else {
                      setFieldValue('spec.taskDefinition', manifestObj.manifest?.spec.store)
                    }
                    setShowTaskDefinitionModal(false)
                    setSelectedManifest(null)
                  }}
                  setConnectorView={setConnectorView}
                  isOpen={showTaskDefinitionModal}
                  selectedManifest={selectedManifest}
                  availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
                />
              )}

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <FormInput.CheckBox
                      name="spec.skipSteadyStateCheck"
                      label={getString('cd.steps.ecsRunTaskStep.skipSteadyStateCheck')}
                      className={css.waitForSteadyStateCheckbox}
                    />
                  }
                />
              </Accordion>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSRunTaskStepEditRef = React.forwardRef(ECSRunTaskStepEdit)
