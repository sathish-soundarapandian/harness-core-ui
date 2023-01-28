/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion, AccordionHandle, RUNTIME_INPUT_VALUE, Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { debounce, defaultTo, isEmpty, noop } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values,
  TabTypes
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { LoopingStrategy } from '@pipeline/components/PipelineStudio/LoopingStrategy/LoopingStrategy'
import { getIsFailureStrategyDisabled } from '@pipeline/utils/CIUtils'
import type { StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { PmsAbstractStepNode, PolicyConfig, TemplateStepNode } from 'services/pipeline-ng'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import type { AllFailureStrategyConfig } from './FailureStrategyPanel/utils'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import type { StepType } from '../PipelineStepInterface'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import CommandFlagsPanel from './CommandFlagsPanel/CommandFlagsPanel'
import MultiTypePolicySetSelector from '../Common/PolicySets/MultiTypePolicySetSelector/MultiTypePolicySetSelector'
import css from './AdvancedSteps.module.scss'

export type FormValues = Pick<Values, 'delegateSelectors' | 'when' | 'strategy' | 'commandFlags'> & {
  failureStrategies?: AllFailureStrategyConfig[]
  policySets?: PolicyConfig['policySets'] | typeof RUNTIME_INPUT_VALUE
}

export interface AdvancedStepsProps extends Omit<StepCommandsProps, 'onUseTemplate' | 'onRemoveTemplate'> {
  stepType?: StepType
  stageType?: StageType
  deploymentType?: string
}

type Step = StepElementConfig | StepGroupElementConfig

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { step, onChange, onUpdate } = props
  const { getString } = useStrings()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((data: FormValues): void => {
      onChange?.({ ...data, tab: TabTypes.Advanced })
    }, 300),
    [onUpdate]
  )

  const failureStrategies =
    ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.failureStrategies ||
    (step as Step)?.failureStrategies

  const delegateSelectors =
    ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.spec?.delegateSelectors ||
    (step as StepElementConfig)?.spec?.delegateSelectors ||
    (step as StepGroupElementConfig)?.delegateSelectors

  const policySets =
    ((step as TemplateStepNode)?.template?.templateInputs as PmsAbstractStepNode)?.enforce?.policySets ||
    (step as PmsAbstractStepNode)?.enforce?.policySets

  const when = ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.when || (step as Step)?.when

  const strategy = (step as any)?.strategy

  return (
    <Formik<FormValues>
      initialValues={{
        failureStrategies: defaultTo(failureStrategies, []) as AllFailureStrategyConfig[],
        delegateSelectors: defaultTo(delegateSelectors, []),
        commandFlags: defaultTo((step as StepElementConfig)?.spec?.commandFlags, []),
        policySets: defaultTo(policySets, []),
        when,
        strategy
      }}
      onSubmit={noop}
      validate={debouncedUpdate}
      formName="pipelineAdvancedSteps"
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString)
      })}
    >
      {(formikProps: FormikProps<FormValues>) => {
        setFormikRef(formikRef, formikProps)

        return <AdvancedTabForm {...props} formikProps={formikProps} />
      }}
    </Formik>
  )
}

export interface AdvancedTabFormProps extends Omit<AdvancedStepsProps, 'onChange'> {
  formikProps: FormikProps<FormValues>
}

export function AdvancedTabForm(props: AdvancedTabFormProps): React.ReactElement {
  const {
    formikProps,
    hiddenPanels = [],
    hasStepGroupAncestor,
    isStepGroup,
    stepsFactory,
    isReadonly,
    stageType,
    stepType,
    step,
    deploymentType
  } = props
  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)
  const { getString } = useStrings()
  const isFailureStrategyDisabled = getIsFailureStrategyDisabled({ stageType, stepType })
  const { NG_K8_COMMAND_FLAGS } = useFeatureFlags()

  React.useEffect(() => {
    if (formikProps.isSubmitting) {
      if (!isEmpty(formikProps.errors?.failureStrategies) && accordionRef.current) {
        accordionRef.current.open(AdvancedPanels.FailureStrategy)
      }

      if (!isEmpty(formikProps.errors?.when) && accordionRef.current) {
        accordionRef.current.open(AdvancedPanels.ConditionalExecution)
      }

      if (!isEmpty(formikProps.errors?.delegateSelectors) && accordionRef.current) {
        accordionRef.current.open(AdvancedPanels.DelegateSelectors)
      }
      if (!isEmpty(formikProps.errors?.commandFlags) && accordionRef.current) {
        accordionRef.current.open(AdvancedPanels.CommandFlags)
      }

      if (!isEmpty(formikProps.errors?.policySets) && accordionRef.current) {
        accordionRef.current.open(AdvancedPanels.PolicyEnforcement)
      }
    }
  }, [formikProps.isSubmitting, formikProps.errors])

  return (
    <FormikForm className={css.form}>
      <div>
        <Accordion
          ref={accordionRef}
          allowMultiOpen
          activeId={
            hiddenPanels.indexOf(AdvancedPanels.DelegateSelectors) === -1 &&
            stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible
              ? AdvancedPanels.DelegateSelectors
              : hiddenPanels.indexOf(AdvancedPanels.ConditionalExecution) === -1
              ? AdvancedPanels.ConditionalExecution
              : hiddenPanels.indexOf(AdvancedPanels.FailureStrategy) === -1
              ? AdvancedPanels.FailureStrategy
              : ''
          }
        >
          {!hiddenPanels.includes(AdvancedPanels.DelegateSelectors) &&
          stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible ? (
            <Accordion.Panel
              id={AdvancedPanels.DelegateSelectors}
              summary={getString('delegate.DelegateSelector')}
              details={<DelegateSelectorPanel isReadonly={isReadonly} formikProps={formikProps} />}
            />
          ) : null}
          {hiddenPanels.includes(AdvancedPanels.ConditionalExecution) ? null : (
            <Accordion.Panel
              id={AdvancedPanels.ConditionalExecution}
              summary={getString('pipeline.conditionalExecution.title')}
              details={
                <ConditionalExecutionPanel
                  formikProps={formikProps}
                  mode={isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                  isReadonly={isReadonly}
                />
              }
            />
          )}
          {hiddenPanels.includes(AdvancedPanels.FailureStrategy) ? null : (
            <Accordion.Panel
              id={AdvancedPanels.FailureStrategy}
              summary={getString('pipeline.failureStrategies.title')}
              details={
                <FailureStrategyPanel
                  mode={hasStepGroupAncestor || isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                  stageType={stageType}
                  formikProps={formikProps}
                  isReadonly={isReadonly || isFailureStrategyDisabled}
                />
              }
            />
          )}
          {hiddenPanels.includes(AdvancedPanels.LoopingStrategy) ? null : (
            <Accordion.Panel
              id={AdvancedPanels.LoopingStrategy}
              summary={getString('pipeline.loopingStrategy.title')}
              details={
                <LoopingStrategy
                  strategy={formikProps.values.strategy}
                  isReadonly={isReadonly}
                  onUpdateStrategy={strategy => {
                    formikProps.setValues({ ...formikProps.values, strategy })
                  }}
                  step={step}
                />
              }
            />
          )}
          {!hiddenPanels.includes(AdvancedPanels.CommandFlags) &&
          stepsFactory.getStep(stepType)?.hasCommandFlagSelectionVisible &&
          NG_K8_COMMAND_FLAGS ? (
            <Accordion.Panel
              id={AdvancedPanels.CommandFlags}
              summary={getString('pipeline.stepDescription.AdvancedCommandFlags')}
              details={<CommandFlagsPanel formik={formikProps} step={step} deploymentType={deploymentType} />}
            />
          ) : null}
          {!hiddenPanels.includes(AdvancedPanels.PolicyEnforcement) ? (
            <Accordion.Panel
              id={AdvancedPanels.PolicyEnforcement}
              summary={getString('pipeline.policyEnforcement.title')}
              details={
                <Container>
                  <Text color={Color.GREY_700} font={{ size: 'small' }} margin={{ bottom: 'medium' }}>
                    {getString('pipeline.policyEnforcement.description')}
                  </Text>
                  <MultiTypePolicySetSelector<FormValues['policySets']>
                    name={'policySets'}
                    label={getString('common.policy.policysets')}
                    disabled={isReadonly}
                  />
                </Container>
              }
            />
          ) : null}
        </Accordion>
      </div>
    </FormikForm>
  )
}

export const AdvancedStepsWithRef = React.forwardRef(AdvancedSteps)
