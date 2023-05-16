/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StringKeys} from 'framework/strings';
import { useStrings } from 'framework/strings'
import type {
  WhenConditionStatus
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils';
import {
  ModeEntityNameMap,
  ParentModeEntityNameMap,
  PipelineOrStageStatus
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { ResolvedVariableInterface } from './ConditionalExecutionTooltipWrapper'

export interface ConditionalExecutionTooltipProps {
  mode: Modes
  status?: WhenConditionStatus
  condition?: string
  resolvedVariables?: ResolvedVariableInterface[]
}

const statusMapping: Record<PipelineOrStageStatus, StringKeys> = {
  Success: 'pipeline.conditionalExecution.statusOption.success',
  Failure: 'pipeline.conditionalExecution.statusOption.failure',
  All: 'pipeline.conditionalExecution.statusOption.all'
}

export default function ConditionalExecutionTooltip(props: ConditionalExecutionTooltipProps): React.ReactElement {
  const { mode, status = PipelineOrStageStatus.ALL, condition, resolvedVariables } = props
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      border={{ top: true, width: 0.5, color: Color.GREY_100 }}
      padding={{ right: 'xlarge', top: 'small', bottom: 'small', left: 'small' }}
    >
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name="conditional-execution" color={Color.GREY_600} size={20} />
      </Container>
      <Layout.Vertical
        spacing={'xsmall'}
        style={{ flex: 1 }}
        data-testid="hovercard-service"
        padding={{ top: 'xsmall', bottom: 'xsmall' }}
      >
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {mode === Modes.STAGE && getString('pipeline.conditionalExecution.toolTip.stageTitle')}
          {mode === Modes.STEP && getString('pipeline.conditionalExecution.toolTip.stepTitle')}
        </Text>
        <Text
          padding={{
            top: condition ? 'xsmall' : 'none',
            bottom: condition ? 'xsmall' : 'none'
          }}
          font={{ size: 'xsmall' }}
          style={{ lineHeight: '16px' }}
          color={Color.GREY_900}
        >
          {getString(statusMapping[status], {
            entity: ModeEntityNameMap[mode],
            parentEntity: ParentModeEntityNameMap[mode]
          })}
        </Text>
        {!!condition && (
          <Text
            inline={true}
            color={Color.BLACK}
            font={{ size: 'xsmall', weight: 'semi-bold' }}
            padding={{ left: 'xsmall', right: 'xsmall' }}
            margin={{ left: 'xsmall', right: 'xsmall' }}
            background={Color.GREY_100}
            border={{ radius: 3, color: Color.GREY_100 }}
          >
            {getString('pipeline.and')}
          </Text>
        )}
        <Text
          padding={{
            top: condition ? 'xsmall' : 'none',
            bottom: condition ? 'xsmall' : 'none'
          }}
          font={{ size: 'xsmall' }}
          style={{ lineHeight: '16px' }}
          color={Color.GREY_900}
        >
          {!!condition && getString('pipeline.conditionalExecution.belowExpression')}
        </Text>
        {!!condition && (
          <Container
            padding={'small'}
            color={Color.GREY_900}
            font={{ size: 'small' }}
            style={{ wordBreak: 'break-word', background: '#FAFBFC' }}
            border={{ width: 0.5, color: Color.GREY_100, radius: 4 }}
          >
            {condition}
          </Container>
        )}
        {!!resolvedVariables && resolvedVariables.length > 0 && (
          <Layout.Vertical spacing={'xsmall'} padding={{ top: 'medium' }}>
            <Text padding={{ bottom: 'xsmall' }} font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_500}>
              {getString('pipeline.conditionalExecution.toolTip.resolvedVariables')}
            </Text>
            {resolvedVariables.map(resolvedVariable => {
              return (
                <Text
                  key={resolvedVariable.fullExpression}
                  style={{ wordBreak: 'break-word' }}
                  font={{ size: 'xsmall' }}
                  color={Color.GREY_900}
                  flex={{ justifyContent: 'start' }}
                >
                  {resolvedVariable.fullExpression !== resolvedVariable.trimmedExpression ? (
                    <Text font={{ size: 'xsmall' }} color={Color.GREY_900} tooltip={resolvedVariable.fullExpression}>
                      {resolvedVariable.trimmedExpression}
                    </Text>
                  ) : (
                    resolvedVariable.trimmedExpression
                  )}
                  <div style={{ paddingLeft: 2, paddingRight: 2 }}>{'='}</div>
                  {resolvedVariable.expressionValue}
                </Text>
              )
            })}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
