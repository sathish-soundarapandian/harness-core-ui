/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, NestedAccordionPanel, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'

import type { StepElementConfig, StepGroupElementConfig, ExecutionWrapperConfig } from 'services/cd-ng'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { useStrings } from 'framework/strings'
import type { StepGroupRenderData, StepRenderData, AddStepsParams } from './ExecutionCard'
import type { PipelineVariablesData } from '../types'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'

export interface StepCardProps {
  step: StepElementConfig | TemplateStepNode
  originalStep: StepElementConfig | TemplateStepNode
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig, path: string): void
  stepPath: string
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory // REQUIRED (pass to addUpdateGraph)
}

export function StepCard(props: StepCardProps): React.ReactElement {
  const {
    step,
    originalStep,
    metadataMap,
    stageIdentifier,
    onUpdateStep,
    stepPath,
    readonly,
    path,
    allowableTypes,
    stepsFactory
  } = props

  if ((originalStep as TemplateStepNode)?.template) {
    return <></>
  }
  return (
    <React.Fragment>
      <VariablesListTable
        className={css.variablePaddingL3}
        data={step}
        originalData={originalStep}
        metadataMap={metadataMap}
      />
      <StepWidget<StepElementConfig | TemplateStepNode>
        factory={stepsFactory}
        initialValues={originalStep}
        allowableTypes={allowableTypes}
        type={(originalStep as StepElementConfig).type as StepType}
        stepViewType={StepViewType.InputVariable}
        onUpdate={(data: StepElementConfig) => onUpdateStep(data, stepPath)}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: step,
          path
        }}
      />
    </React.Fragment>
  )
}

export function StepCardPanel(props: StepCardProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <NestedAccordionPanel
      noAutoScroll
      collapseProps={{
        keepChildrenMounted: true
      }}
      isDefaultOpen
      addDomId
      id={`${props.stepPath}.${props.originalStep.identifier}`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {defaultTo(props.originalStep.name, getString('step'))}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.accordianSummaryL2}
      details={<StepCard {...props} />}
    />
  )
}

export interface StepGroupCardProps {
  steps: Array<{
    step: StepElementConfig | TemplateStepNode | StepGroupElementConfig
    originalStep: StepElementConfig | TemplateStepNode | StepGroupElementConfig
    path: string
  }>
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig | TemplateStepNode, path: string): void
  stepGroupIdentifier: string
  stepGroupName: string
  stepGroupOriginalName: string
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
}

export function StepGroupCard(props: StepGroupCardProps): React.ReactElement {
  const {
    steps,
    metadataMap,
    onUpdateStep,
    stageIdentifier,
    stepGroupName,
    stepGroupOriginalName,
    readonly,
    allowableTypes,
    stepsFactory
  } = props
  return (
    <React.Fragment>
      <VariablesListTable
        data={{ name: stepGroupName }}
        originalData={{ name: stepGroupOriginalName }}
        metadataMap={metadataMap}
        className={css.variablePaddingL1}
      />
      {steps.map((row: any) => {
        if (row.type === 'StepGroupRenderData') {
          return (
            <StepGroupCardPanel
              key={row.path}
              steps={row.steps}
              stepGroupIdentifier={row.identifier}
              stepGroupName={row.name}
              path={row.path}
              allowableTypes={allowableTypes}
              stepGroupOriginalName={row.originalName}
              metadataMap={metadataMap}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              onUpdateStep={onUpdateStep}
              stepsFactory={stepsFactory}
            />
          )
        }
        const { step, originalStep, path } = row
        return (
          <StepCardPanel
            key={path}
            step={step}
            originalStep={originalStep}
            metadataMap={metadataMap}
            stepPath={path}
            readonly={readonly}
            allowableTypes={allowableTypes}
            stageIdentifier={stageIdentifier}
            onUpdateStep={onUpdateStep}
            stepsFactory={stepsFactory}
          />
        )
      })}
    </React.Fragment>
  )
}

export function StepGroupCardPanel(props: StepGroupCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      collapseProps={{
        keepChildrenMounted: true
      }}
      panelClassName={css.accordianSummaryL1}
      id={`${props.path}.StepGroup.${props.stepGroupIdentifier}`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {props.stepGroupOriginalName}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.accordianSummaryL1}
      details={<StepGroupCard {...props} />}
    />
  )
}

interface StepGroupTemplateVariables extends Omit<StepGroupCardProps, 'steps'> {
  templateSteps: any
  originalSteps: ExecutionWrapperConfig[]
  path: string
}

export function StepGroupTemplateCard(props: StepGroupTemplateVariables): React.ReactElement {
  const { metadataMap, stageIdentifier, onUpdateStep, readonly, path, allowableTypes, stepsFactory } = props

  const allSteps = React.useMemo(() => {
    function addToCards({
      steps,
      originalSteps,
      parentPath = /* istanbul ignore next */ ''
    }: AddStepsParams): Array<StepRenderData | StepGroupRenderData> {
      if (!steps || !Array.isArray(steps)) return []
      return steps.reduce<Array<StepRenderData | StepGroupRenderData>>((cards, { step, stepGroup, parallel }, i) => {
        if (step) {
          cards.push({
            type: 'StepRenderData',
            step,
            originalStep: originalSteps?.[i]?.step || /* istanbul ignore next */ {
              timeout: '10m',
              name: '',
              type: '',
              identifier: ''
            },
            path: parentPath
          })
        } else if (stepGroup) {
          cards.push({
            type: 'StepGroupRenderData',
            steps: [
              ...(addToCards({
                steps: stepGroup.steps,
                originalSteps: originalSteps?.[i]?.stepGroup?.steps,
                parentPath: `${parentPath}.steps`
              }) as StepRenderData[])
            ],
            name: stepGroup.name || '',
            originalName: originalSteps?.[i]?.stepGroup?.name || /* istanbul ignore next */ '',
            identifier: originalSteps?.[i]?.stepGroup?.identifier || /* istanbul ignore next */ '',
            path: `${parentPath}.stepGroup`
          })
        } /* istanbul ignore else */ else if (parallel) {
          cards.push(
            ...addToCards({
              steps: parallel,
              originalSteps: originalSteps?.[i]?.parallel,
              parentPath: `${parentPath}.parallel`
            })
          )
        }

        return cards
      }, [])
    }

    return [
      ...addToCards({
        steps: props?.templateSteps?.steps,
        originalSteps: props?.originalSteps,
        parentPath: path
      })
    ]
  }, [props?.templateSteps, props?.originalSteps, path])

  return (
    <React.Fragment>
      {allSteps.map((row, index) => {
        if (row.type === 'StepRenderData' && row.step && row.originalStep) {
          const { step, originalStep, path: pathStep } = row
          return (
            <StepCardPanel
              key={index}
              step={step}
              originalStep={originalStep}
              metadataMap={metadataMap}
              stageIdentifier={stageIdentifier}
              stepPath={pathStep}
              readonly={readonly}
              allowableTypes={allowableTypes}
              onUpdateStep={onUpdateStep}
              stepsFactory={stepsFactory}
            />
          )
        }

        /* istanbul ignore else */
        if (row.type === 'StepGroupRenderData') {
          return (
            <StepGroupCardPanel
              key={row.path}
              steps={row.steps}
              stepGroupIdentifier={row.identifier}
              stepGroupName={row.name}
              allowableTypes={allowableTypes}
              stepGroupOriginalName={row.originalName}
              metadataMap={metadataMap}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              onUpdateStep={onUpdateStep}
              stepsFactory={stepsFactory}
            />
          )
        }

        return null
      })}
    </React.Fragment>
  )
}
