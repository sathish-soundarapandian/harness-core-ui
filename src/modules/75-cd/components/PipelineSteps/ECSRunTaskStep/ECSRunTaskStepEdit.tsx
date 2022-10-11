/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormInput,
  Layout,
  Text
} from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ECSRunTaskStepInitialValues } from './ECSRunTaskStep'
import { TaskDefinitionModal } from './TaskDefinitionModal'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ECSRunTaskStepEdit.module.scss'

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
                formik.setFieldValue('spec.runTaskRequestDefinition', {})
              } else {
                formik.setFieldValue('spec.taskDefinition', {})
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
        onSubmit={(values: ECSRunTaskStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="ecsBlueGreenCreateServiceStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<ECSRunTaskStepInitialValues>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <>
              <NameTimeoutField
                values={{ name: values.name, timeout: values.timeout }}
                setFieldValue={setFieldValue}
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />
              <div className={css.ecsRunTaskDefinitionTitle}>
                {getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinition')}
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
              </Container>
              <div className={css.ecsRunTaskRequestDefinitionTitle}>
                {getString('cd.steps.ecsRunTaskStep.ecsRunTaskRequestDefinition')}
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
            </>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSRunTaskStepEditRef = React.forwardRef(ECSRunTaskStepEdit)
