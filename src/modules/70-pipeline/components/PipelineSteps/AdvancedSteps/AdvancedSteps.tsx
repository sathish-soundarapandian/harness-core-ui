/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import type { FormikProps } from 'formik'
import {
  Formik,
  FormikForm,
  Accordion,
  AccordionHandle,
  RUNTIME_INPUT_VALUE,
  Container,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { debounce, defaultTo, get, isEmpty, noop, set, unset } from 'lodash-es'

import produce from 'immer'
import { useStrings, String as LocaleString } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { LoopingStrategyPanel } from '@pipeline/components/PipelineStudio/LoopingStrategy/LoopingStrategyPanel'
import { getIsFailureStrategyDisabled } from '@pipeline/utils/CIUtils'
import type { StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { PolicyConfig, TemplateStepNode } from 'services/pipeline-ng'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import type { AllFailureStrategyConfig } from './FailureStrategyPanel/utils'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import { StepType } from '../PipelineStepInterface'
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
  const { step, onChange } = props
  const { getString } = useStrings()

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const debouncedOnChange = useMemo(
    () =>
      debounce((data: FormValues): void => {
        onChangeRef.current?.(data)
      }, 300),
    []
  )

  const failureStrategies =
    ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.failureStrategies ||
    (step as Step)?.failureStrategies

  const delegateSelectors =
    ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.spec?.delegateSelectors ||
    (step as StepElementConfig)?.spec?.delegateSelectors ||
    (step as StepGroupElementConfig)?.delegateSelectors

  const policySets =
    ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.enforce?.policySets ||
    (step as StepElementConfig)?.enforce?.policySets

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
      validate={debouncedOnChange}
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
  const { expressions } = useVariablesExpression()
  const failureStrategyValues = get(formikProps.values, 'failureStrategies')
  const loopingStrategyValues = get(formikProps.values, 'strategy')
  const whenValues = get(formikProps.values, 'when')

  const getActiveId = React.useCallback(
    (factory: AbstractStepFactory): string => {
      if (
        !hiddenPanels.includes(AdvancedPanels.DelegateSelectors) &&
        factory.getStep(stepType)?.hasDelegateSelectionVisible
      ) {
        return AdvancedPanels.DelegateSelectors
      }

      if (!hiddenPanels.includes(AdvancedPanels.ConditionalExecution)) {
        return AdvancedPanels.ConditionalExecution
      }

      if (!hiddenPanels.includes(AdvancedPanels.FailureStrategy)) {
        return AdvancedPanels.FailureStrategy
      }

      return ''
    },
    [hiddenPanels, stepType]
  )

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
        <Accordion ref={accordionRef} allowMultiOpen activeId={getActiveId(stepsFactory)}>
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
              summary={
                <div className={css.titleWrapper}>
                  <LocaleString stringID="pipeline.conditionalExecution.title" />
                  <div onClick={e => e.stopPropagation()}>
                    <MultiTypeSelectorButton
                      type={getMultiTypeFromValue(whenValues as unknown as string)}
                      allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                      onChange={type => {
                        formikProps.setValues(
                          produce(formikProps.values, draft => {
                            if (isMultiTypeRuntime(type)) {
                              set(draft, 'when', RUNTIME_INPUT_VALUE)
                            } else {
                              unset(draft, 'when')
                            }
                          })
                        )
                      }}
                    />
                  </div>
                </div>
              }
              details={
                <ConditionalExecutionPanel
                  mode={isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                  isReadonly={isReadonly}
                  path="when"
                />
              }
            />
          )}
          {hiddenPanels.includes(AdvancedPanels.FailureStrategy) ? null : (
            <Accordion.Panel
              id={AdvancedPanels.FailureStrategy}
              summary={
                <div className={css.titleWrapper}>
                  <LocaleString stringID="pipeline.failureStrategies.title" />
                  <div onClick={e => e.stopPropagation()}>
                    <MultiTypeSelectorButton
                      type={getMultiTypeFromValue(failureStrategyValues as unknown as string)}
                      allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                      onChange={type => {
                        formikProps.setValues(
                          produce(formikProps.values, draft => {
                            if (isMultiTypeRuntime(type)) {
                              set(draft, 'failureStrategies', RUNTIME_INPUT_VALUE)
                            } else {
                              unset(draft, 'failureStrategies')
                            }
                          })
                        )
                      }}
                    />
                  </div>
                </div>
              }
              details={
                <FailureStrategyPanel
                  mode={hasStepGroupAncestor || isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                  stageType={stageType}
                  isReadonly={isReadonly || isFailureStrategyDisabled}
                  path="failureStrategies"
                />
              }
            />
          )}
          {hiddenPanels.includes(AdvancedPanels.LoopingStrategy) ? null : (
            <Accordion.Panel
              id={AdvancedPanels.LoopingStrategy}
              summary={
                <div className={css.titleWrapper}>
                  <LocaleString stringID="pipeline.loopingStrategy.title" />
                  <div onClick={e => e.stopPropagation()}>
                    <MultiTypeSelectorButton
                      type={getMultiTypeFromValue(loopingStrategyValues as unknown as string)}
                      allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                      onChange={type => {
                        formikProps.setValues(
                          produce(formikProps.values, draft => {
                            if (isMultiTypeRuntime(type)) {
                              set(draft, 'strategy', RUNTIME_INPUT_VALUE)
                            } else {
                              unset(draft, 'strategy')
                            }
                          })
                        )
                      }}
                    />
                  </div>
                </div>
              }
              details={
                <LoopingStrategyPanel
                  path="strategy"
                  isReadonly={isReadonly}
                  onUpdateStrategy={strategy => {
                    formikProps.setValues(
                      produce(formikProps.values, (draft: any) => {
                        if (isEmpty(strategy)) {
                          unset(draft, 'strategy')
                        } else {
                          set(draft, 'strategy', strategy)
                        }
                      })
                    )
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
          {!hiddenPanels.includes(AdvancedPanels.PolicyEnforcement) && stepType !== StepType.StepGroup ? (
            <Accordion.Panel
              id={AdvancedPanels.PolicyEnforcement}
              summary={getString('pipeline.policyEnforcement.title')}
              details={
                <Container>
                  <Text color={Color.GREY_700} font={{ size: 'small' }} margin={{ bottom: 'medium' }}>
                    {getString('pipeline.policyEnforcement.description')}
                  </Text>
                  <MultiTypePolicySetSelector<FormValues>
                    name={'policySets'}
                    label={getString('common.policy.policysets')}
                    disabled={isReadonly}
                    expressions={expressions}
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
