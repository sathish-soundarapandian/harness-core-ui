/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type {
  WhenConditionStatus} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils';
import {
  PipelineOrStageStatus,
  statusToStatusMapping
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { StringsMap } from 'stringTypes'
import type { ConditionalExecutionNodeRunInfo, ExpressionBlock } from '@pipeline/utils/types'
import ConditionalExecutionTooltipPreExecution from './ConditionalExecutionTooltip'

const statusToStringIdMapping: any = {
  OnPipelineSuccess: 'pipeline.conditionalExecution.statusOption.success',
  OnStageSuccess: 'pipeline.conditionalExecution.statusOption.success',
  OnPipelineFailure: 'pipeline.conditionalExecution.statusOption.failure',
  OnStageFailure: 'pipeline.conditionalExecution.statusOption.failure',
  Always: 'pipeline.conditionalExecution.statusOption.all'
}

export interface ConditionalExecutionToolTipWrapperProps {
  mode: Modes
  data: ConditionalExecutionNodeRunInfo
}

const processConditionData = (
  whenCondition: string
): {
  status: WhenConditionStatus
  statusStringId: keyof StringsMap
  condition: string | undefined
} => {
  const whenConditionInfo: string[] = whenCondition.split(' && ')
  const statusInfo: string = whenConditionInfo.shift()!.replace(/[^a-zA-Z]/g, '')
  return {
    status: statusToStatusMapping[statusInfo],
    statusStringId: statusToStringIdMapping[statusInfo],
    condition: whenConditionInfo.length > 0 ? whenConditionInfo.join(' && ').slice(1, -1) : undefined
  }
}

export interface ResolvedVariableInterface {
  fullExpression: string
  trimmedExpression: string
  expressionValue: string
}

const processResolvedVariables = (expressions?: ExpressionBlock[]): ResolvedVariableInterface[] => {
  const resolvedVariables: ResolvedVariableInterface[] = []
  expressions?.forEach(expression => {
    const expressionStr: string | undefined = expression.expression
    if (!!expressionStr && !statusToStatusMapping[expressionStr]) {
      resolvedVariables.push({
        fullExpression: expressionStr,
        trimmedExpression: expressionStr.split('.').pop() || '',
        expressionValue: expression.expressionValue || ''
      })
    }
  })
  return resolvedVariables
}

export default function ConditionalExecutionTooltipWrapper(
  props: ConditionalExecutionToolTipWrapperProps
): React.ReactElement {
  const {
    mode,
    data: { whenCondition, expressions }
  } = props
  const { status, condition } = processConditionData(whenCondition!)
  const resolvedVariables = processResolvedVariables(expressions)

  if (status === PipelineOrStageStatus.SUCCESS && !condition?.trim()) {
    return <></>
  }

  return (
    <ConditionalExecutionTooltipPreExecution
      mode={mode}
      status={status}
      condition={condition}
      resolvedVariables={resolvedVariables}
    />
  )
}
