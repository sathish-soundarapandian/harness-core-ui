/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SyntheticEvent, useState } from 'react'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { Button, ButtonSize, ButtonVariation, Container, useConfirmationDialog } from '@harness/uicore'
import { cloneDeep, defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import { parse } from '@common/utils/YamlHelperMethods'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type {
  ExecutionElementConfig,
  StepElementConfig,
  StepGroupElementConfig,
  StageElementConfig
} from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepActions } from '@common/constants/TrackingConstants'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type {
  BuildStageElementConfig,
  DeploymentStageElementConfig,
  StageElementWrapper
} from '@pipeline/utils/pipelineTypes'
import type { DependencyElement } from 'services/ci'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { PipelineGovernanceView } from '@governance/PipelineGovernanceView'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import { createTemplate } from '@pipeline/utils/templateUtils'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type { StringsMap } from 'stringTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerData, DrawerSizes, DrawerTypes, PipelineViewData } from '../PipelineContext/PipelineActions'
import { StepCommandsWithRef as StepCommands, StepFormikRef } from '../StepCommands/StepCommands'
import {
  StepCommandsViews,
  StepOrStepGroupOrTemplateStepData,
  TabTypes,
  Values
} from '../StepCommands/StepCommandTypes'
import { StepPalette } from '../StepPalette/StepPalette'
import { addService, addStepOrGroup, generateRandomString, getStepFromId } from '../ExecutionGraph/ExecutionGraphUtil'
import PipelineVariables, { PipelineVariablesRef } from '../PipelineVariables/PipelineVariables'
import { PipelineNotifications, PipelineNotificationsRef } from '../PipelineNotifications/PipelineNotifications'
import { PipelineTemplates } from '../PipelineTemplates/PipelineTemplates'
import { ExecutionStrategy, ExecutionStrategyRefInterface } from '../ExecutionStrategy/ExecutionStrategy'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import { FlowControlWithRef as FlowControl, FlowControlRef } from '../FlowControl/FlowControl'
import { AdvancedOptions } from '../AdvancedOptions/AdvancedOptions'
import { RightDrawerTitle } from './RightDrawerTitle'
import { getFlattenedStages } from '../StageBuilder/StageBuilderUtil'
import { getFlattenedSteps } from '../CommonUtils/CommonUtils'
import css from './RightDrawer.module.scss'

export const FullscreenDrawers: DrawerTypes[] = [
  DrawerTypes.PipelineVariables,
  DrawerTypes.PipelineNotifications,
  DrawerTypes.FlowControl,
  DrawerTypes.AdvancedOptions,
  DrawerTypes.PolicySets
]

type TrackEvent = (eventName: string, properties: Record<string, string>) => void

const checkDuplicateStep = (
  formikRef: React.MutableRefObject<StepFormikRef | null>,
  data: DrawerData['data'],
  getString: UseStringsReturn['getString']
): boolean => {
  const values = formikRef.current?.getValues() as Values
  if (values && data?.stepConfig?.stepsMap && formikRef.current?.setFieldError) {
    const stepsMap = data.stepConfig.stepsMap
    let duplicate = false
    stepsMap.forEach((_step, key) => {
      if (key === values.identifier && values.identifier !== data?.stepConfig?.node?.identifier) {
        duplicate = true
      }
    })
    if (duplicate) {
      setTimeout(() => {
        formikRef.current?.setFieldError('identifier', getString('pipelineSteps.duplicateStep'))
      }, 300)
      return true
    }
  }
  return false
}

export const updateStepWithinStage = (
  execution: ExecutionElementConfig,
  processingNodeIdentifier: string,
  processedNode: StepElementConfig | TemplateStepNode,
  isRollback: boolean
): void => {
  // Finds the step in the stage, and updates with the processed node
  execution?.[isRollback ? 'rollbackSteps' : 'steps']?.forEach(stepWithinStage => {
    if (stepWithinStage.stepGroup) {
      // If stage has a step group, loop over the step group steps and update the matching identifier with node
      if (stepWithinStage.stepGroup?.identifier === processingNodeIdentifier) {
        stepWithinStage.stepGroup = processedNode as any
      } else {
        // For current Step Group, go through all steps and find out if all steps are of Command type
        // If yes, and new step is also of Command type then add repeat looping strategy to Step Group
        const allSteps = stepWithinStage.stepGroup.steps
        const allFlattenedSteps = getFlattenedSteps(allSteps)
        if (!isEmpty(allFlattenedSteps)) {
          const commandSteps = allFlattenedSteps.filter(
            (currStep: StepElementConfig) => currStep.type === StepType.Command
          )
          if (
            (commandSteps.length === allFlattenedSteps.length &&
              (processedNode as StepElementConfig)?.type === StepType.Command &&
              !isEmpty(stepWithinStage.stepGroup.strategy) &&
              !stepWithinStage.stepGroup.strategy?.repeat) ||
            (commandSteps.length === allFlattenedSteps.length &&
              (processedNode as StepElementConfig)?.type === StepType.Command &&
              isEmpty(stepWithinStage.stepGroup.strategy))
          ) {
            stepWithinStage.stepGroup['strategy'] = {
              repeat: {
                items: '<+stage.output.hosts>' as any, // used any because BE needs string variable while they can not change type
                maxConcurrency: 1,
                start: 0,
                end: 1,
                unit: 'Count'
              }
            }
          }
        }
        updateStepWithinStage(stepWithinStage.stepGroup, processingNodeIdentifier, processedNode, false)
      }
    } else if (stepWithinStage.parallel) {
      // If stage has a parallel steps, loop over and update the matching identifier with node
      stepWithinStage.parallel.forEach(parallelStep => {
        if (parallelStep?.stepGroup?.identifier === processingNodeIdentifier) {
          parallelStep.stepGroup = processedNode as any
        } else if (parallelStep.step?.identifier === processingNodeIdentifier) {
          parallelStep.step = processedNode as any
        } else if (parallelStep?.stepGroup) {
          updateStepWithinStage(parallelStep?.stepGroup, processingNodeIdentifier, processedNode, false)
        }
      })
    } else if (stepWithinStage.step?.identifier === processingNodeIdentifier) {
      // Else simply find the matching step ad update the node
      stepWithinStage.step = processedNode as any
    }
  })
}

const addReplace = (item: Partial<Values>, node: any): void => {
  if (item.name && item.tab !== TabTypes.Advanced) node.name = item.name
  if (item.identifier && item.tab !== TabTypes.Advanced) node.identifier = item.identifier
  if ((item as StepElementConfig).description && item.tab !== TabTypes.Advanced)
    node.description = (item as StepElementConfig).description
  if (item.when && item.tab === TabTypes.Advanced) node.when = item.when
  if ((item as StepElementConfig).timeout && item.tab !== TabTypes.Advanced)
    node.timeout = (item as StepElementConfig).timeout
  // For ECS
  if ((item as ECSRollingDeployStepInitialValues).sameAsAlreadyRunningInstances && item.tab !== TabTypes.Advanced) {
    node.sameAsAlreadyRunningInstances = (item as ECSRollingDeployStepInitialValues).sameAsAlreadyRunningInstances
  }
  if ((item as ECSRollingDeployStepInitialValues).forceNewDeployment && item.tab !== TabTypes.Advanced) {
    node.forceNewDeployment = (item as ECSRollingDeployStepInitialValues).forceNewDeployment
  }
}

const processNodeImpl = (
  item: Partial<Values>,
  data: any,
  trackEvent: TrackEvent
): StepElementConfig & TemplateStepNode & StepGroupElementConfig => {
  return produce(data.stepConfig.node as StepElementConfig & TemplateStepNode & StepGroupElementConfig, node => {
    // Add/replace values only if they are presented
    addReplace(item, node)

    // default strategies can be present without having the need to click on Advanced Tab. For eg. in CV step.
    if (Array.isArray(item.failureStrategies)) {
      node.failureStrategies = item.failureStrategies
      const telemetryData = item.failureStrategies.map(strategy => ({
        onError: strategy.onFailure?.errors?.join(', '),
        action: strategy.onFailure?.action?.type
      }))
      telemetryData.length && trackEvent(StepActions.AddEditFailureStrategy, { data: JSON.stringify(telemetryData) })
    }
    if (!data.stepConfig?.isStepGroup && item.delegateSelectors && item.tab === TabTypes.Advanced) {
      set(node, 'spec.delegateSelectors', item.delegateSelectors)
    } else if (data.stepConfig?.isStepGroup && item.delegateSelectors && item.tab === TabTypes.Advanced) {
      set(node, 'delegateSelectors', item.delegateSelectors)
    }
    if ((item as StepElementConfig)?.spec?.commandOptions && item.tab !== TabTypes.Advanced) {
      set(node, 'spec.commandOptions', (item as StepElementConfig)?.spec?.commandOptions)
    }

    // Looping strategies which are found in Advanced tab of steps
    // Step group which has all of its steps as Command steps will have repeat looping strategy as default strategy
    if (isEmpty(item.strategy)) {
      delete (node as any).strategy
    } else {
      set(node, 'strategy', item.strategy)
    }

    // Delete values if they were already added and now removed
    if (node.timeout && !(item as StepElementConfig).timeout && item.tab !== TabTypes.Advanced) delete node.timeout
    if (node.description && !(item as StepElementConfig).description && item.tab !== TabTypes.Advanced)
      delete node.description
    if (
      (node as ECSRollingDeployStepInitialValues).sameAsAlreadyRunningInstances &&
      !(item as ECSRollingDeployStepInitialValues).sameAsAlreadyRunningInstances &&
      item.tab !== TabTypes.Advanced
    ) {
      delete (node as ECSRollingDeployStepInitialValues).sameAsAlreadyRunningInstances
    }
    if (
      (node as ECSRollingDeployStepInitialValues).forceNewDeployment &&
      !(item as ECSRollingDeployStepInitialValues).forceNewDeployment &&
      item.tab !== TabTypes.Advanced
    ) {
      delete (node as ECSRollingDeployStepInitialValues).forceNewDeployment
    }
    if (node.failureStrategies && !item.failureStrategies && item.tab === TabTypes.Advanced)
      delete node.failureStrategies
    if (
      !data.stepConfig?.isStepGroup &&
      node.spec?.delegateSelectors &&
      (!item.delegateSelectors || item.delegateSelectors?.length === 0) &&
      item.tab === TabTypes.Advanced
    ) {
      delete node.spec.delegateSelectors
    }
    if (
      data.stepConfig?.isStepGroup &&
      node.delegateSelectors &&
      (!item.delegateSelectors || item.delegateSelectors?.length === 0) &&
      item.tab === TabTypes.Advanced
    ) {
      delete node.delegateSelectors
    }
    if (
      node.spec?.commandOptions &&
      (!(item as StepElementConfig)?.spec?.commandOptions ||
        (item as StepElementConfig)?.spec?.commandOptions?.length === 0) &&
      item.tab !== TabTypes.Advanced
    ) {
      delete (item as StepElementConfig)?.spec?.commandOptions
      delete node.spec.commandOptions
    }

    if (item.template) {
      node.template = item.template
    }
    if ((item as StepElementConfig).spec && item.tab !== TabTypes.Advanced) {
      node.spec = { ...(item as StepElementConfig).spec }
    }
  })
}

const updateWithNodeIdentifier = async (
  selectedStage: StageElementWrapper<StageElementConfig> | undefined,
  drawerType: DrawerTypes,
  processNode: StepElementConfig & TemplateStepNode,
  updatePipelineView: (data: PipelineViewData) => void,
  updateStage: (stage: StageElementConfig) => Promise<void>,
  data: any,
  pipelineView: PipelineViewData,
  isRollback: boolean
): Promise<void> => {
  const provisioner = (selectedStage?.stage as DeploymentStageElementConfig)?.spec?.infrastructure
    ?.infrastructureDefinition?.provisioner
  if (drawerType === DrawerTypes.StepConfig && selectedStage?.stage?.spec?.execution) {
    const processingNodeIdentifier = data?.stepConfig?.node?.identifier
    const stageData = produce(selectedStage, draft => {
      if (draft.stage?.spec?.execution) {
        updateStepWithinStage(draft.stage.spec.execution, processingNodeIdentifier, processNode, isRollback)
      }
    })
    // update view data before updating pipeline because its async
    updatePipelineView(
      produce(pipelineView, draft => {
        set(draft, 'drawerData.data.stepConfig.node', processNode)
      })
    )

    if (stageData.stage) {
      await updateStage(stageData.stage)
    }

    data?.stepConfig?.onUpdate?.(processNode)
  } else if (drawerType === DrawerTypes.ProvisionerStepConfig && provisioner) {
    const processingNodeIdentifier = data?.stepConfig?.node?.identifier
    const stageData = produce(selectedStage, draft => {
      const provisionerInternal = (draft?.stage as DeploymentStageElementConfig)?.spec?.infrastructure
        ?.infrastructureDefinition?.provisioner
      if (provisionerInternal) {
        updateStepWithinStage(provisionerInternal, processingNodeIdentifier, processNode, isRollback)
      }
    })
    // update view data before updating pipeline because its async
    updatePipelineView(
      produce(pipelineView, draft => {
        set(draft, 'drawerData.data.stepConfig.node', processNode)
      })
    )
    if (stageData?.stage) {
      await updateStage(stageData.stage)
    }
    data?.stepConfig?.onUpdate?.(processNode)
  }
}

const onSubmitStep = async (
  item: Partial<Values>,
  drawerType: DrawerTypes,
  data: any,
  trackEvent: TrackEvent,
  selectedStage: StageElementWrapper<StageElementConfig> | undefined,
  updatePipelineView: (data: PipelineViewData) => void,
  updateStage: (stage: StageElementConfig) => Promise<void>,
  pipelineView: PipelineViewData,
  isRollback: boolean
): Promise<void> => {
  if (data?.stepConfig?.node) {
    const processNode = processNodeImpl(item, data, trackEvent)

    if (data?.stepConfig?.node?.identifier) {
      updateWithNodeIdentifier(
        selectedStage,
        drawerType,
        processNode,
        updatePipelineView,
        updateStage,
        data,
        pipelineView,
        isRollback
      )
    }
  }
}

const applyChanges = async (
  formikRef: React.MutableRefObject<StepFormikRef<unknown> | null>,
  data: any,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  updatePipelineView: (data: PipelineViewData) => void,
  pipelineView: PipelineViewData,
  setSelectedStepId: (selectedStepId: string | undefined) => void,
  trackEvent: TrackEvent,
  isRollback: boolean,
  selectedStage: StageElementWrapper<StageElementConfig> | undefined,
  updateStage: (stage: StageElementConfig) => Promise<void>
): Promise<void> => {
  if (checkDuplicateStep(formikRef, data, getString)) {
    return
  }
  await formikRef?.current?.submitForm()
  if (!isEmpty(formikRef.current?.getErrors())) {
    return
  } else {
    onSubmitStep(
      formikRef.current?.getValues() as Partial<Values>,
      pipelineView.drawerData.type,
      data,
      trackEvent,
      selectedStage,
      updatePipelineView,
      updateStage,
      produce(pipelineView, draft => {
        if (draft) {
          set(draft, 'isDrawerOpened', false)
          set(draft, 'drawerData', {
            type: DrawerTypes.AddStep
          })
        }
      }),
      isRollback
    )

    setSelectedStepId(undefined)
    if (data?.stepConfig?.isStepGroup) {
      trackEvent(StepActions.AddEditStepGroup, {
        name: defaultTo((formikRef?.current?.getValues?.() as Values).name, '')
      })
    } else {
      trackEvent(StepActions.AddEditStep, {
        name: defaultTo(data?.stepConfig?.node?.name, ''),
        type: defaultTo((data?.stepConfig?.node as StepElementConfig)?.type, '')
      })
    }
  }
}

export interface CloseDrawerArgs {
  e?: SyntheticEvent<Element, Event> | undefined
  formikRef: React.MutableRefObject<StepFormikRef | null>
  data: any
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  openConfirmBEUpdateError: () => void
  updatePipelineView: (data: PipelineViewData) => void
  pipelineView: PipelineViewData
  setSelectedStepId: (selectedStepId: string | undefined) => void
  type: DrawerTypes
  onSearchInputChange?: (value: string) => void
  executionStrategyRef: React.MutableRefObject<ExecutionStrategyRefInterface | null>
  variablesRef: React.MutableRefObject<PipelineVariablesRef | null>
  flowControlRef: React.MutableRefObject<FlowControlRef | null>
  notificationsRef: React.MutableRefObject<PipelineNotificationsRef | null>
}

const closeDrawer = (args: CloseDrawerArgs): void => {
  const {
    e,
    formikRef,
    data,
    getString,
    openConfirmBEUpdateError,
    updatePipelineView,
    setSelectedStepId,
    pipelineView,
    type,
    onSearchInputChange,
    executionStrategyRef,
    variablesRef,
    flowControlRef,
    notificationsRef
  } = args
  e?.persist()
  if (checkDuplicateStep(formikRef, data, getString)) {
    return
  }
  if (formikRef.current?.isDirty?.()) {
    openConfirmBEUpdateError()
    return
  }

  if (type === DrawerTypes.FlowControl) {
    flowControlRef.current?.onRequestClose()
    return
  }
  if (type === DrawerTypes.ExecutionStrategy) {
    executionStrategyRef.current?.cancelExecutionStrategySelection()
    return
  }

  if (type === DrawerTypes.PipelineVariables) {
    onSearchInputChange?.('')
    variablesRef.current?.onRequestClose()
    return
  }

  if (type === DrawerTypes.PipelineNotifications) {
    notificationsRef.current?.onRequestClose()
    return
  }

  updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  setSelectedStepId(undefined)
}

export function RightDrawer(): React.ReactElement {
  const {
    state: {
      templateTypes,
      pipelineView: { drawerData, isDrawerOpened, isSplitViewOpen, isRollbackToggled },
      pipelineView,
      selectionState: { selectedStageId, selectedStepId },
      gitDetails,
      storeMetadata,
      pipeline,
      isIntermittentLoading
    },
    allowableTypes,
    updatePipeline,
    isReadonly,
    updateStage,
    updatePipelineView,
    getStageFromPipeline,
    stepsFactory,
    setSelectedStepId
  } = usePipelineContext()
  const { getTemplate } = useTemplateSelector()
  const [helpPanelVisible, setHelpPanel] = useState(false)
  const { type, data, ...restDrawerProps } = drawerData
  const { trackEvent } = useTelemetry()

  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageId, ''))
  const stageType = selectedStage?.stage?.type

  let stepData = (data?.stepConfig?.node as StepElementConfig)?.type
    ? stepsFactory.getStepData(defaultTo((data?.stepConfig?.node as StepElementConfig)?.type, ''))
    : null
  const templateStepTemplate = (data?.stepConfig?.node as TemplateStepNode)?.template
  const formikRef = React.useRef<StepFormikRef | null>(null)
  const flowControlRef = React.useRef<FlowControlRef | null>(null)
  const variablesRef = React.useRef<PipelineVariablesRef | null>(null)
  const notificationsRef = React.useRef<PipelineNotificationsRef | null>(null)
  const executionStrategyRef = React.useRef<ExecutionStrategyRefInterface | null>(null)
  const { getString } = useStrings()
  const isFullScreenDrawer = FullscreenDrawers.includes(type)
  let title: React.ReactNode | null = null
  if (data?.stepConfig?.isStepGroup) {
    stepData = stepsFactory.getStepData(StepType.StepGroup)
  }

  const discardChanges = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: {
        type: DrawerTypes.AddStep
      }
    })
    setSelectedStepId(undefined)
  }

  if (stepData || templateStepTemplate) {
    const stepType = stepData ? stepData?.type : get(templateTypes, templateStepTemplate.templateRef)
    const toolTipType = type ? `_${type}` : ''
    title = (
      <RightDrawerTitle
        helpPanelVisible={helpPanelVisible}
        stepType={stepType}
        toolTipType={toolTipType}
        stepData={stepData}
        disabled={isIntermittentLoading}
        discardChanges={discardChanges}
        applyChanges={() =>
          applyChanges(
            formikRef,
            data,
            getString,
            updatePipelineView,
            pipelineView,
            setSelectedStepId,
            trackEvent,
            !!isRollbackToggled,
            selectedStage,
            updateStage
          )
        }
      ></RightDrawerTitle>
    )
  } else {
    title = null
  }

  React.useEffect(() => {
    if (selectedStepId && selectedStage && !pipelineView.isDrawerOpened && isSplitViewOpen) {
      let step
      let drawerType = DrawerTypes.StepConfig
      // 1. search for step in execution
      const execStep = getStepFromId(
        selectedStage?.stage?.spec?.execution,
        selectedStepId,
        false,
        false,
        Boolean(pipelineView.isRollbackToggled)
      )
      step = execStep.node
      if (!step) {
        drawerType = DrawerTypes.ConfigureService
        // 2. search for step in serviceDependencies
        const depStep = ((selectedStage?.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any)?.find(
          (item: DependencyElement) => item.identifier === selectedStepId
        )
        step = depStep
      }

      // 3. if we find step open right drawer
      if (step) {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: drawerType,
            data: {
              stepConfig: {
                node: step as any,
                stepsMap: data?.paletteData?.stepsMap || data?.stepConfig?.stepsMap || new Map(),
                onUpdate: data?.paletteData?.onUpdate,
                isStepGroup: false,
                addOrEdit: 'edit',
                hiddenAdvancedPanels: data?.paletteData?.hiddenAdvancedPanels
              }
            }
          }
        })
      } else {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: false,
          drawerData: {
            type: DrawerTypes.AddStep
          }
        })
      }
    }
  }, [selectedStepId, selectedStage, isSplitViewOpen])

  const onServiceDependencySubmit = async (item: Partial<Values>): Promise<void> => {
    const { stage: pipelineStage } = (selectedStageId && cloneDeep(getStageFromPipeline(selectedStageId))) || {}
    if (data?.stepConfig?.addOrEdit === 'add' && pipelineStage) {
      const newServiceData: DependencyElement = {
        identifier: defaultTo(item.identifier, ''),
        name: item.name,
        type: StepType.Dependency,
        ...((item as StepElementConfig).description && { description: (item as StepElementConfig).description }),
        spec: (item as StepElementConfig).spec
      }
      if (!((pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any)?.length) {
        set(pipelineStage, 'stage.spec.serviceDependencies', [])
      }
      addService(
        defaultTo((pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any, []),
        newServiceData
      )
      if (pipelineStage.stage) {
        await updateStage(pipelineStage.stage)
      }
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypes.ConfigureService }
      })
      data.stepConfig?.onUpdate?.(newServiceData)
    } else if (data?.stepConfig?.addOrEdit === 'edit' && pipelineStage) {
      const node = data?.stepConfig?.node as DependencyElement
      if (node) {
        const serviceDependency = (
          (pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies as any
        )?.find(
          // NOTE: "node.identifier" is used as item.identifier may contain changed identifier
          (dep: DependencyElement) => dep.identifier === node.identifier
        )

        if (serviceDependency) {
          if (item.identifier) serviceDependency.identifier = item.identifier
          if (item.name) serviceDependency.name = item.name
          if ((item as StepElementConfig).description)
            serviceDependency.description = (item as StepElementConfig).description
          if ((item as StepElementConfig).spec) serviceDependency.spec = (item as StepElementConfig).spec
        }

        // Delete values if they were already added and now removed
        if (node.description && !(item as StepElementConfig).description) delete node.description

        if (pipelineStage.stage) {
          await updateStage(pipelineStage.stage)
        }
      }
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypes.ConfigureService }
      })
    }
  }

  const customButtonContainer = (
    <Container className={css.customButtons}>
      <Button
        text={getString('pipeline.discard')}
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.MEDIUM}
        onClick={() => {
          discardChanges()
          closeConfirmBEUpdateError()
        }}
      />
      <Button
        text={getString('cancel')}
        variation={ButtonVariation.TERTIARY}
        size={ButtonSize.MEDIUM}
        onClick={() => closeConfirmBEUpdateError()}
      />
    </Container>
  )

  const { openDialog: openConfirmBEUpdateError, closeDialog: closeConfirmBEUpdateError } = useConfirmationDialog({
    contentText: getString('pipeline.stepConfigContent'),
    titleText: getString('pipeline.closeStepConfig'),
    confirmButtonText: getString('applyChanges'),
    customButtons: customButtonContainer,
    intent: Intent.WARNING,
    showCloseButton: false,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        applyChanges(
          formikRef,
          data,
          getString,
          updatePipelineView,
          pipelineView,
          setSelectedStepId,
          trackEvent,
          !!isRollbackToggled,
          selectedStage,
          updateStage
        )
      }
    },
    className: css.dialogWrapper
  })

  const { onSearchInputChange } = usePipelineVariables()

  const onStepSelection = async (item: StepData): Promise<void> => {
    const paletteData = data?.paletteData
    if (paletteData?.entity) {
      const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(defaultTo(selectedStageId, '')))
      const newStepData = {
        step: {
          type: item.type,
          name: item.name,
          identifier: generateRandomString(item.name),
          spec: {}
        }
      }
      if (pipelineStage && !pipelineStage.stage?.spec) {
        set(pipelineStage, 'stage.spec', {})
      }
      if (pipelineStage && isNil(pipelineStage.stage?.spec?.execution)) {
        if (paletteData.isRollback) {
          set(pipelineStage, 'stage.spec.execution', { rollbackSteps: [] })
        } else {
          set(pipelineStage, 'stage.spec.execution', { steps: [] })
        }
      }
      data?.paletteData?.onUpdate?.(newStepData.step)
      addStepOrGroup(
        paletteData.entity,
        pipelineStage?.stage?.spec?.execution as any,
        newStepData,
        paletteData.isParallelNodeClicked,
        paletteData.isRollback
      )

      if (pipelineStage?.stage) {
        await updateStage(pipelineStage?.stage)
      }
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: {
          type: DrawerTypes.StepConfig,
          data: {
            stepConfig: {
              node: newStepData.step,
              stepsMap: paletteData.stepsMap,
              onUpdate: data?.paletteData?.onUpdate,
              isStepGroup: false,
              addOrEdit: 'edit',
              hiddenAdvancedPanels: data?.paletteData?.hiddenAdvancedPanels
            }
          }
        }
      })

      return
    }
    updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  }

  const updateNode = async (
    processNode: StepElementConfig | TemplateStepNode,
    drawerType: DrawerTypes,
    isRollback: boolean
  ): Promise<void> => {
    const newPipelineView = produce(pipelineView, draft => {
      set(draft, 'drawerData.data.stepConfig.node', processNode)
    })
    updatePipelineView(newPipelineView)
    const processingNodeIdentifier = defaultTo(drawerData.data?.stepConfig?.node?.identifier, '')
    const stageData = produce(selectedStage, draft => {
      if (drawerType === DrawerTypes.StepConfig && draft?.stage?.spec?.execution) {
        updateStepWithinStage(draft.stage.spec.execution, processingNodeIdentifier, processNode, isRollback)
      } else if (drawerType === DrawerTypes.ProvisionerStepConfig) {
        const provisionerInternal = (draft?.stage as DeploymentStageElementConfig)?.spec?.infrastructure
          ?.infrastructureDefinition?.provisioner
        if (provisionerInternal) {
          updateStepWithinStage(provisionerInternal, processingNodeIdentifier, processNode, isRollback)
        }
      }
    })

    if (stageData?.stage) {
      await updateStage(stageData.stage)
    }
    drawerData.data?.stepConfig?.onUpdate?.(processNode)
  }

  const addOrUpdateTemplate = async (
    selectedTemplate: TemplateSummaryResponse,
    drawerType: DrawerTypes,
    isRollback: boolean
  ): Promise<void> => {
    try {
      const stepType =
        (data?.stepConfig?.node as StepElementConfig)?.type ||
        get(templateTypes, (data?.stepConfig?.node as TemplateStepNode).template.templateRef)

      const { template, isCopied } = await getTemplate({
        templateType: 'Step',
        filterProperties: {
          childTypes: [stepType]
        },
        selectedTemplate,
        gitDetails,
        storeMetadata
      })
      const node = drawerData.data?.stepConfig?.node as StepOrStepGroupOrTemplateStepData
      const processNode = isCopied
        ? produce(
            defaultTo(parse<any>(defaultTo(template?.yaml, '')).template.spec, {}) as StepElementConfig,
            draft => {
              draft.name = defaultTo(node?.name, '')
              draft.identifier = defaultTo(node?.identifier, '')
            }
          )
        : createTemplate<TemplateStepNode>(node as unknown as TemplateStepNode, template)
      await updateNode(processNode, drawerType, isRollback)
    } catch (_) {
      // Do nothing.. user cancelled template selection
    }
  }

  const removeTemplate = async (drawerType: DrawerTypes, isRollback: boolean): Promise<void> => {
    const node = drawerData.data?.stepConfig?.node as TemplateStepNode
    const processNode = produce({} as StepElementConfig, draft => {
      draft.name = node.name
      draft.identifier = node.identifier
      draft.type = get(templateTypes, node.template.templateRef)
    })
    await updateNode(processNode, drawerType, isRollback)
  }

  const onDiscard = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: {
        type: DrawerTypes.AddStep
      }
    })
  }

  const showHelpPanel = () => {
    setHelpPanel(!helpPanelVisible)
  }

  const handleClose = (e?: React.SyntheticEvent<Element, Event>): void => {
    setHelpPanel(false)
    closeDrawer({
      e,
      formikRef,
      data,
      getString,
      openConfirmBEUpdateError,
      updatePipelineView,
      pipelineView,
      setSelectedStepId,
      type,
      onSearchInputChange,
      executionStrategyRef,
      variablesRef,
      flowControlRef,
      notificationsRef
    })
  }

  return (
    <Drawer
      onClose={handleClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={type !== DrawerTypes.ExecutionStrategy}
      canOutsideClickClose={type !== DrawerTypes.ExecutionStrategy}
      enforceFocus={false}
      hasBackdrop={true}
      size={helpPanelVisible ? 1050 : DrawerSizes[type]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={title}
      data-type={type}
      className={cx(css.main, css.almostFullScreen, css.fullScreen, { [css.showRighDrawer]: isFullScreenDrawer })}
      {...restDrawerProps}
      // {...(type === DrawerTypes.FlowControl ? { style: { right: 60, top: 64 }, hasBackdrop: false } : {})}
      isCloseButtonShown={false}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={isFullScreenDrawer ? css.almostFullScreenPortal : 'pipeline-studio-right-drawer'}
    >
      <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={handleClose} />

      {type === DrawerTypes.StepConfig && data?.stepConfig?.node && (
        <StepCommands
          showHelpPanel={showHelpPanel}
          helpPanelVisible={helpPanelVisible}
          step={data.stepConfig.node as StepElementConfig | StepGroupElementConfig}
          isReadonly={isReadonly}
          ref={formikRef}
          checkDuplicateStep={checkDuplicateStep.bind(null, formikRef, data, getString)}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onUpdate={value =>
            onSubmitStep(
              value,
              DrawerTypes.StepConfig,
              data,
              trackEvent,
              selectedStage,
              updatePipelineView,
              updateStage,
              pipelineView,
              Boolean(isRollbackToggled)
            )
          }
          viewType={StepCommandsViews.Pipeline}
          allowableTypes={allowableTypes}
          onUseTemplate={(selectedTemplate: TemplateSummaryResponse) =>
            addOrUpdateTemplate(selectedTemplate, type, Boolean(isRollbackToggled))
          }
          onRemoveTemplate={() => removeTemplate(type, Boolean(isRollbackToggled))}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          selectedStage={selectedStage}
          gitDetails={gitDetails}
          storeMetadata={storeMetadata}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(
            stageType,
            selectedStage?.stage,
            undefined,
            getFlattenedStages(pipeline).stages
          )}
          stageType={stageType as StageType}
          onSelect={onStepSelection}
        />
      )}
      {/* TODO */}
      {type === DrawerTypes.PipelineVariables && (
        <PipelineVariables ref={variablesRef} pipeline={pipeline} storeMetadata={storeMetadata} />
      )}
      {type === DrawerTypes.Templates && <PipelineTemplates />}
      {type === DrawerTypes.ExecutionStrategy && (
        <ExecutionStrategy selectedStage={defaultTo(selectedStage, {})} ref={executionStrategyRef} />
      )}

      {type === DrawerTypes.FlowControl && <FlowControl ref={flowControlRef} onDiscard={onDiscard} />}
      {type === DrawerTypes.PipelineNotifications && <PipelineNotifications ref={notificationsRef} />}
      {type === DrawerTypes.AdvancedOptions && (
        <AdvancedOptions
          pipeline={cloneDeep(pipeline)}
          onApplyChanges={async updatedPipeline => {
            await updatePipeline(updatedPipeline)
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: {
                type: DrawerTypes.AddStep
              }
            })
          }}
          onDiscard={onDiscard}
        />
      )}
      {type === DrawerTypes.PolicySets && <PipelineGovernanceView pipelineName={pipeline.name} />}
      {type === DrawerTypes.ConfigureService && selectedStageId && data?.stepConfig && data?.stepConfig.node && (
        <StepCommands
          showHelpPanel={showHelpPanel}
          helpPanelVisible={helpPanelVisible}
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node as StepElementConfig}
          isReadonly={isReadonly}
          ref={formikRef}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          onUpdate={onServiceDependencySubmit}
          isStepGroup={false}
          allowableTypes={allowableTypes}
          withoutTabs
          selectedStage={selectedStage}
          storeMetadata={storeMetadata}
        />
      )}

      {type === DrawerTypes.AddProvisionerStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(
            stageType,
            undefined,
            'Provisioner',
            getFlattenedStages(pipeline).stages
          )}
          stageType={stageType as StageType}
          isProvisioner={true}
          onSelect={async (item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId))
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name),
                  spec: {}
                }
              }

              data?.paletteData?.onUpdate?.(newStepData.step)

              if (
                pipelineStage &&
                !get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner')
              ) {
                set(pipelineStage, 'stage.spec.infrastructure.infrastructureDefinition.provisioner', {
                  steps: [],
                  rollbackSteps: []
                })
              }

              const provisioner = get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner')
              // set empty arrays
              if (!paletteData.isRollback && !provisioner.steps) provisioner.steps = []
              if (paletteData.isRollback && !provisioner.rollbackSteps) provisioner.rollbackSteps = []

              addStepOrGroup(
                paletteData.entity,
                provisioner,
                newStepData,
                paletteData.isParallelNodeClicked,
                paletteData.isRollback
              )

              if (pipelineStage?.stage) {
                await updateStage(pipelineStage?.stage)
              }

              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: true,
                drawerData: {
                  type: DrawerTypes.ProvisionerStepConfig,
                  data: {
                    stepConfig: {
                      node: newStepData.step,
                      stepsMap: paletteData.stepsMap,
                      onUpdate: data?.paletteData?.onUpdate,
                      isStepGroup: false,
                      addOrEdit: 'edit',
                      hiddenAdvancedPanels: data.paletteData?.hiddenAdvancedPanels
                    }
                  }
                }
              })

              return
            }
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
          }}
        />
      )}
      {type === DrawerTypes.ProvisionerStepConfig && data?.stepConfig?.node && (
        <StepCommands
          showHelpPanel={showHelpPanel}
          helpPanelVisible={helpPanelVisible}
          step={data.stepConfig.node as StepElementConfig}
          ref={formikRef}
          isReadonly={isReadonly}
          allowableTypes={allowableTypes}
          checkDuplicateStep={checkDuplicateStep.bind(null, formikRef, data, getString)}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onUpdate={value =>
            onSubmitStep(
              value,
              DrawerTypes.ProvisionerStepConfig,
              data,
              trackEvent,
              selectedStage,
              updatePipelineView,
              updateStage,
              pipelineView,
              Boolean(isRollbackToggled)
            )
          }
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          selectedStage={selectedStage}
          onUseTemplate={(selectedTemplate: TemplateSummaryResponse) =>
            addOrUpdateTemplate(selectedTemplate, type, Boolean(isRollbackToggled))
          }
          onRemoveTemplate={() => removeTemplate(type, Boolean(isRollbackToggled))}
          storeMetadata={storeMetadata}
        />
      )}
    </Drawer>
  )
}
