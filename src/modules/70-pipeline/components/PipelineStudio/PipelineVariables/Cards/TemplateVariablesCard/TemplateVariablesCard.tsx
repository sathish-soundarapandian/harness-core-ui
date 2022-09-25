/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, AllowedTypes, NestedAccordionPanel } from '@wings-software/uicore'
import cx from 'classnames'
import type { NGVariable } from 'services/pipeline-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type {
  CustomVariableEditableExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { AllNGVariables } from '@pipeline/utils/types'
import VariableAccordionSummary from '@pipeline/components/PipelineStudio/PipelineVariables/VariableAccordionSummary'
import type { PipelineVariablesData } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import css from '../../PipelineVariables.module.scss'

export interface TemplateVariablesCardProps {
  variableVariables: NGVariable[]
  variables: NGVariable[]
  stepsFactory: AbstractStepFactory
  metadataMap: PipelineVariablesData['metadataMap']
  updateVariables(variables: NGVariable[]): void
  readonly?: boolean
  allowableTypes: AllowedTypes
}

export default function TemplateVariablesCard(props: TemplateVariablesCardProps): React.ReactElement {
  const { variableVariables, variables, metadataMap, stepsFactory, updateVariables, readonly, allowableTypes } = props

  return (
    <Card className={css.variableCard} id="Pipeline-panel">
      <NestedAccordionPanel
        noAutoScroll
        isDefaultOpen
        key={`template.variables`}
        id={`template.variables`}
        addDomId
        collapseProps={{
          keepChildrenMounted: true
        }}
        summary={<VariableAccordionSummary>Template Variables</VariableAccordionSummary>}
        details={
          <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
            factory={stepsFactory}
            initialValues={{ variables: (variables || []) as AllNGVariables[], canAddVariable: true }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            readonly={readonly}
            allowableTypes={allowableTypes}
            onUpdate={({ variables: updatedVariables }: CustomVariablesData) => {
              updateVariables(updatedVariables)
            }}
            customStepProps={{
              formName: 'addEditTemplateCustomVariableForm',
              variableNamePrefix: 'template.variables.',
              domId: 'Template.Variables-panel',
              className: cx(css.customVariables, css.customVarPadL1, css.addVariableL1),
              // heading: <b>{getString('customVariables.title')}</b>,
              path: 'template.variables',
              hideExecutionTimeField: true,
              yamlProperties: (variableVariables as AllNGVariables[])?.map(
                variable => metadataMap[variable.value || '']?.yamlProperties || {}
              )
            }}
          />
        }
      />
    </Card>
  )
}
