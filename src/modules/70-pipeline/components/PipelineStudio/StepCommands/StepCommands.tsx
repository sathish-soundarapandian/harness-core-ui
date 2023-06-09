/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Tab, Tabs, Layout } from '@harness/uicore'
import { Expander } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import stableStringify from 'fast-json-stable-stringify'
import { HelpPanel, HelpPanelType, FloatingButton } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { StepWidgetWithFormikRef } from '@pipeline/components/AbstractSteps/StepWidget'
import { AdvancedStepsWithRef } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'
import type { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ServiceDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageConfig, StepElementConfig } from 'services/cd-ng'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { getStepDataFromValues } from '@pipeline/utils/stepUtils'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { StepCommandsProps, StepCommandsViews, StepGroupWithStageElementConfig, Values } from './StepCommandTypes'
import css from './StepCommands.module.scss'

export type StepFormikRef<T = unknown> = {
  isDirty(): FormikProps<T>['dirty'] | undefined
  submitForm: FormikProps<T>['submitForm']
  getErrors(): FormikProps<T>['errors']
  setFieldError(key: string, error: string): void
  getValues(): T
  resetForm: FormikProps<T>['resetForm']
}

export type StepCommandsRef<T = unknown> =
  | ((instance: StepFormikRef<T> | null) => void)
  | React.MutableRefObject<StepFormikRef<T> | null>
  | null

enum StepCommandTabs {
  StepConfiguration = 'StepConfiguration',
  Advanced = 'Advanced'
}

type SaveButtonType = 'Step' | 'StepGroup'

export function StepCommands(
  props: StepCommandsProps & { checkDuplicateStep?: () => boolean },
  ref: StepCommandsRef
): React.ReactElement {
  const {
    step,
    onChange,
    onUpdate,
    onUseTemplate,
    onRemoveTemplate,
    isStepGroup,
    isReadonly,
    stepsFactory,
    hiddenPanels,
    checkDuplicateStep,
    hasStepGroupAncestor,
    withoutTabs,
    isNewStep = true,
    selectedStage,
    stepViewType,
    className = '',
    viewType,
    allowableTypes,
    gitDetails,
    storeMetadata,
    saveAsTemplateButtonProps,
    isSaveAsTemplateEnabled = true
  } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepCommandTabs.StepConfiguration)
  const stepRef = React.useRef<FormikProps<unknown> | null>(null)
  const referenceId = stepsFactory.getStepReferenceId(((step as StepElementConfig).type as StepType) || '')
  const advancedConfRef = React.useRef<FormikProps<unknown> | null>(null)
  const isTemplateStep = !!(step as TemplateStepNode).template
  const { module } = useParams<ModulePathParams>()

  async function handleTabChange(newTab: StepCommandTabs, prevTab: StepCommandTabs): Promise<void> {
    if (prevTab === StepCommandTabs.StepConfiguration && stepRef.current) {
      if (checkDuplicateStep?.()) {
        return Promise.resolve()
      }
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await stepRef.current.submitForm()

      if (isEmpty(stepRef.current.errors)) {
        setActiveTab(newTab)
      }
    } else if (prevTab === StepCommandTabs.Advanced && advancedConfRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await advancedConfRef.current.submitForm()

      if (isEmpty(advancedConfRef.current.errors)) {
        setActiveTab(newTab)
      }
    }
  }

  const stepType: StepType =
    isStepGroup && !isTemplateStep
      ? StepType.StepGroup
      : isTemplateStep
      ? StepType.Template
      : ((step as StepElementConfig).type as StepType)

  const getValues = (
    latestValues: {
      stepValues?: Partial<Values>
      advancedValues?: Partial<Values>
    } = {}
  ): Partial<Values> => {
    const stepObj =
      isStepGroup && !isTemplateStep
        ? (stepsFactory.getStep(StepType.StepGroup) as PipelineStep<any>)
        : stepType === StepType.Template
        ? (stepsFactory.getStep(StepType.Template) as PipelineStep<any>)
        : (stepsFactory.getStep((step as StepElementConfig).type) as PipelineStep<any>)

    const { stepValues, advancedValues } = latestValues
    const values = {
      ...(stepRef.current
        ? defaultTo(stepValues, stepObj?.processFormData(stepRef.current.values) ?? stepRef.current.values)
        : {}),
      ...(!isTemplateStep ? defaultTo(advancedValues, advancedConfRef.current?.values as Partial<Values>) : {})
    }

    return values
  }

  React.useImperativeHandle(ref, () => ({
    setFieldError(fieldName: string, error: string) {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        stepRef.current.setFieldError(fieldName, error)
      }
    },
    isDirty() {
      let isStepFormDirty = false,
        isAdvancedFormDirty = false

      if (stepRef.current) {
        const currentStep = stepsFactory.getStep(stepType) as PipelineStep<any>
        const processFormData = currentStep?.processFormData
        if (processFormData) {
          const processedInitialValues = processFormData(stepRef.current.initialValues)
          const processedValues = processFormData(stepRef.current.values)

          isStepFormDirty = stableStringify(processedInitialValues) !== stableStringify(processedValues)
        } else {
          isStepFormDirty = stepRef.current.dirty
        }
      }

      if (advancedConfRef.current) {
        isAdvancedFormDirty = advancedConfRef.current.dirty
      }

      return isStepFormDirty || isAdvancedFormDirty
    },
    async submitForm() {
      await stepRef.current?.submitForm()
      await advancedConfRef.current?.submitForm()
    },
    getErrors() {
      return {
        ...stepRef.current?.errors,
        ...advancedConfRef.current?.errors
      }
    },
    getValues,
    resetForm() {
      stepRef.current?.resetForm()
      advancedConfRef.current?.resetForm()
    }
  }))

  const getValuesForTemplate = async (): Promise<StepElementConfig | StepGroupWithStageElementConfig> => {
    const stepObj = stepsFactory.getStep(
      isStepGroup ? StepType.StepGroup : (step as StepElementConfig).type
    ) as PipelineStep<any>

    if (!stepRef.current && !advancedConfRef.current) return step as StepElementConfig

    if (stepRef.current) {
      await stepRef.current.validateForm()
      const errors = omit(stepRef.current.errors, 'name')
      if (!isEmpty(errors)) {
        await stepRef.current.submitForm()
        throw errors
      }
    }

    if (advancedConfRef.current) {
      await advancedConfRef.current.validateForm()
      const errors = omit(advancedConfRef.current.errors, 'name')
      if (!isEmpty(errors)) {
        await advancedConfRef.current.submitForm()
        throw errors
      }
    }

    const stepParameterValues = {
      ...(stepRef.current && (stepObj.processFormData?.(stepRef.current.values) ?? stepRef.current.values))
    }
    const advancedConfValues = advancedConfRef.current?.values as Partial<Values>

    let values = getStepDataFromValues(Object.assign(stepParameterValues, advancedConfValues), step, isStepGroup)
    if (isStepGroup) {
      values = omit(values, 'spec')
      ;(values as StepGroupWithStageElementConfig).stageType = selectedStage?.stage?.type
      return values
    }
    return values
  }

  const saveButtonProps = (() => {
    if (isStepGroup) {
      return {
        getData: getValuesForTemplate,
        type: StepType.StepGroup
      }
    }
    return {
      getData: getValuesForTemplate,
      type: 'Step'
    }
  })()

  const getStepWidgetWithFormikRef = (): JSX.Element => {
    return (
      <StepWidgetWithFormikRef
        key={step.identifier}
        factory={stepsFactory}
        initialValues={step}
        readonly={isReadonly}
        isNewStep={isNewStep}
        onChange={values => {
          onChange?.(getValues({ stepValues: values }))
        }}
        onUpdate={values => {
          onUpdate?.(getValues({ stepValues: values }))
        }}
        type={stepType}
        stepViewType={stepViewType}
        ref={stepRef}
        allowableTypes={allowableTypes}
        customStepProps={{
          selectedStage: selectedStage
        }}
      />
    )
  }

  if (withoutTabs) {
    return <div className={cx(css.stepCommand, css.withoutTabs)}>{getStepWidgetWithFormikRef()}</div>
  }

  return (
    <div className={cx(css.stepCommand, className)}>
      {stepType === StepType.Template ? (
        <Layout.Vertical margin={'xlarge'} spacing={'xxlarge'}>
          <TemplateBar
            templateLinkConfig={(step as TemplateStepNode).template}
            onOpenTemplateSelector={onUseTemplate}
            onRemoveTemplate={onRemoveTemplate}
            isReadonly={isReadonly}
            storeMetadata={storeMetadata}
          />
          <Container>{getStepWidgetWithFormikRef()}</Container>
        </Layout.Vertical>
      ) : (
        <div className={props.helpPanelVisible ? css.helpPanelGridVisible : css.helpPanelGridHidden}>
          <Container className={cx(css.stepTabs, { stepTabsAdvanced: activeTab === StepCommandTabs.Advanced })}>
            <Tabs id="step-commands" selectedTabId={activeTab} onChange={handleTabChange} renderAllTabPanels>
              <Tab
                id={StepCommandTabs.StepConfiguration}
                title={isStepGroup ? getString('stepGroupConfiguration') : getString('stepConfiguration')}
                panel={getStepWidgetWithFormikRef()}
              />
              <Tab
                id={StepCommandTabs.Advanced}
                title={getString('advancedTitle')}
                panel={
                  <AdvancedStepsWithRef
                    helpPanelVisible
                    step={step}
                    isReadonly={isReadonly}
                    stepsFactory={stepsFactory}
                    allowableTypes={allowableTypes}
                    onChange={values => {
                      onChange?.(getValues({ advancedValues: values }))
                    }}
                    hiddenPanels={hiddenPanels}
                    isStepGroup={isStepGroup}
                    hasStepGroupAncestor={hasStepGroupAncestor}
                    ref={advancedConfRef}
                    stageType={defaultTo(selectedStage?.stage?.type, StageType.DEPLOY) as StageType}
                    stepType={stepType}
                    deploymentType={defaultTo(
                      (selectedStage?.stage?.spec as DeploymentStageConfig)?.deploymentType,
                      ServiceDeploymentType.Kubernetes
                    )}
                  />
                }
              />
              {isSaveAsTemplateEnabled &&
                viewType === StepCommandsViews.Pipeline &&
                module !== 'cf' &&
                (step as StepElementConfig).type !== StepType.FlagConfiguration && (
                  <>
                    <Expander />
                    <SaveTemplateButton
                      data={saveButtonProps.getData}
                      type={saveButtonProps.type as SaveButtonType}
                      gitDetails={gitDetails}
                      storeMetadata={storeMetadata}
                      {...saveAsTemplateButtonProps}
                    />
                  </>
                )}
            </Tabs>
          </Container>
          {!isEmpty(referenceId) ? (
            <FloatingButton className={css.floatingButton} onClick={props.showHelpPanel} />
          ) : null}
          {props.helpPanelVisible ? (
            <div className={css.helpPanelStyleOpen}>
              <HelpPanel referenceId={referenceId || ''} type={HelpPanelType.CONTENT_ONLY}></HelpPanel>
            </div>
          ) : (
            <div className={css.helpPanelStyleClose}></div>
          )}
        </div>
      )}
    </div>
  )
}

export const StepCommandsWithRef = React.forwardRef(StepCommands)
