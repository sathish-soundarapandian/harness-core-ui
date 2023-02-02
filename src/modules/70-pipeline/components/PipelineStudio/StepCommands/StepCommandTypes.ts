/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type {
  StepElementConfig,
  StepGroupElementConfig,
  StepWhenCondition,
  FailureStrategyConfig,
  StageElementConfig
} from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { TemplateStepNode, TemplateLinkConfig, EntityGitDetails, PolicyConfig } from 'services/pipeline-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export enum AdvancedPanels {
  PreRequisites = 'preRequisites',
  FailureStrategy = 'failureStrategy',
  DelegateSelectors = 'delegateSelectors',
  ConditionalExecution = 'conditionalExecution',
  LoopingStrategy = 'loopingStrategy',
  CommandFlags = 'commandFlags',
  PolicyEnforcement = 'policyEnforcement'
}

export enum StepCommandsViews {
  Pipeline = 'pipeline',
  Template = 'template'
}

export interface StepCommandsProps {
  showHelpPanel?: () => void
  helpPanelVisible?: boolean
  step: StepOrStepGroupOrTemplateStepData
  onChange?: (step: Partial<Values>) => void
  onUpdate: (step: Partial<Values>) => void
  onUseTemplate?: (selectedTemplate: TemplateSummaryResponse) => void
  onRemoveTemplate?: () => Promise<void>
  stepsFactory: AbstractStepFactory
  isStepGroup: boolean
  isReadonly: boolean
  isNewStep?: boolean
  hasStepGroupAncestor?: boolean
  hiddenPanels?: AdvancedPanels[]
  withoutTabs?: boolean
  selectedStage?: StageElementWrapper<StageElementConfig>
  stepViewType?: StepViewType
  className?: string
  viewType?: StepCommandsViews
  allowableTypes: AllowedTypes
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  isSaveAsTemplateEnabled?: boolean
}

export enum TabTypes {
  StepConfiguration = 'STEP_CONFIGURATION',
  Advanced = 'ADVANCED'
}

export interface StepGroupWithStageElementConfig extends StepGroupElementConfig {
  stageType?: string
}

export type StepOrStepGroupOrTemplateStepData =
  | StepElementConfig
  | StepGroupElementConfig
  | TemplateStepNode
  | StepGroupWithStageElementConfig

export type Values = StepOrStepGroupOrTemplateStepData & {
  tab?: TabTypes
  shouldKeepOpen?: boolean
  delegateSelectors?: string[]
  when?: StepWhenCondition
  failureStrategies?: FailureStrategyConfig[]
  template?: TemplateLinkConfig
  strategy?: any
  commandFlags?: any
  policySets?: PolicyConfig['policySets'] | typeof RUNTIME_INPUT_VALUE
  stageType?: string
}
