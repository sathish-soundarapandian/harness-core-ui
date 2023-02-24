import React from 'react'
import {
  Text,
  HarnessDocTooltip,
  Layout,
  Container,
  MultiTypeInputType,
  getMultiTypeFromValue,
  AllowedTypes,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { useFormikContext } from 'formik'
import { get, set, unset } from 'lodash-es'
import { Color } from '@harness/design-system'
import produce from 'immer'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeExecutionCondition } from '@common/components/MultiTypeExecutionCondition/MultiTypeExecutionCondition'
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import ConditionalExecutionPanel, {
  ConditionalExecutionPanelProps
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanel'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'
import type { StageWhenCondition, StepWhenCondition } from 'services/pipeline-ng'
import type { StepMode } from '@pipeline/utils/stepUtils'

import css from '../PipelineInputSetForm.module.scss'

export interface ConditionalExecutionFormProps<T extends StepMode>
  extends Omit<ConditionalExecutionPanelProps, 'mode'> {
  allowableTypes?: AllowedTypes
  mode: T
  viewType?: StepViewType
  template?: T extends StepMode.STAGE ? StageWhenCondition : StepWhenCondition
}

export function ConditionalExecutionForm<T extends StepMode>(
  props: ConditionalExecutionFormProps<T>
): React.ReactElement {
  const {
    isReadonly,
    path,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    viewType,
    template,
    mode
  } = props
  const formik = useFormikContext()
  const { getString } = useStrings()
  const value = get(formik?.values, path)
  const { expressions } = useVariablesExpression()
  const [multiType, setMultiType] = React.useState<MultiTypeInputType>(getMultiTypeFromValue(value))

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Layout.Horizontal margin={{ bottom: 'medium' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Text
          color={Color.GREY_600}
          margin={{ right: 'medium' }}
          className={css.conditionalExecutionTitle}
          font={{ weight: 'semi-bold' }}
        >
          {getString('pipeline.conditionalExecution.title')}
        </Text>
        {viewType === StepViewType.TemplateUsage ? (
          <MultiTypeSelectorButton
            type={getMultiTypeFromValue(value as any)}
            allowedTypes={allowableTypes}
            onChange={type => {
              formik.setValues(
                produce(formik.values, (draft: any) => {
                  if (isMultiTypeRuntime(type)) {
                    set(draft, path, RUNTIME_INPUT_VALUE)
                  } else {
                    unset(draft, path)
                  }
                })
              )
            }}
          />
        ) : null}
      </Layout.Horizontal>
      <Text width="85%" color={Color.GREY_500} margin={{ bottom: 'small' }} font={{ size: 'small' }}>
        {getString('pipeline.conditionalExecution.conditionLabel')}
        <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
      </Text>
      <Container width="100%">
        {isValueRuntimeInput(template as unknown as string) ? (
          <ConditionalExecutionPanel path={path} isReadonly={isReadonly} mode={mode} />
        ) : null}
        {isValueRuntimeInput(template?.condition) ? (
          <Container width="55%">
            <MultiTypeExecutionCondition
              path={`${path}.condition`}
              allowableTypes={allowableTypes}
              multiType={multiType}
              setMultiType={setMultiType}
              readonly={isReadonly}
              expressions={expressions}
            />
          </Container>
        ) : null}
      </Container>
    </Container>
  )
}
