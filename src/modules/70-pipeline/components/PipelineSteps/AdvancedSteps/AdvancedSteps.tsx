/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion, AccordionHandle } from '@wings-software/uicore'
import * as Yup from 'yup'
import { debounce, defaultTo, isEmpty } from 'lodash-es'

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
import type { StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { TemplateStepNode } from 'services/pipeline-ng'
import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import type { AllFailureStrategyConfig } from './FailureStrategyPanel/utils'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import type { StepType } from '../PipelineStepInterface'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import css from './AdvancedSteps.module.scss'

export type FormValues = Pick<Values, 'delegateSelectors' | 'when' | 'strategy'> & {
  failureStrategies?: AllFailureStrategyConfig[]
}

export interface AdvancedStepsProps extends Omit<StepCommandsProps, 'onUseTemplate' | 'onRemoveTemplate'> {
  stepType?: StepType
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

  const when = ((step as TemplateStepNode)?.template?.templateInputs as StepElementConfig)?.when || (step as Step)?.when

  const strategy = (step as any)?.strategy

  return (
    <Formik<FormValues>
      initialValues={{
        failureStrategies: defaultTo(failureStrategies, []) as AllFailureStrategyConfig[],
        delegateSelectors: defaultTo(delegateSelectors, []),
        when,
        strategy
      }}
      onSubmit={data => {
        onUpdate({ ...data, tab: TabTypes.Advanced })
      }}
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
    stepType
  } = props

  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)
  const { getString } = useStrings()

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
                  isReadonly={isReadonly}
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
                  stepType={stepType}
                />
              }
            />
          )}
        </Accordion>
      </div>
    </FormikForm>
  )
}

export const AdvancedStepsWithRef = React.forwardRef(AdvancedSteps)
