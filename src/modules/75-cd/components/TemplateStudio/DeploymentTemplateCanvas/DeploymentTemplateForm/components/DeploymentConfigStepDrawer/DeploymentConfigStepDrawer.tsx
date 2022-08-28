/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SyntheticEvent } from 'react'
import { Button, Container } from '@wings-software/uicore'
import { clone, isEmpty, noop, set, map, get, filter } from 'lodash-es'
import produce from 'immer'
import { Drawer, Position } from '@blueprintjs/core'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepData, TemplateStepNode } from 'services/pipeline-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StepPalette } from '@pipeline/components/PipelineStudio/StepPalette/StepPalette'
import { StageType } from '@pipeline/utils/stageHelpers'
import {
  DeploymentConfigExecutionStepWrapper,
  useDeploymentContext
} from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { DrawerSizes, DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  StepCommandsWithRef as StepCommands,
  StepFormikRef
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepCommandsViews, Values } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { generateRandomString } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { TemplateStepValues } from '@templates-library/components/PipelineSteps/TemplateStep/TemplateStepWidget/TemplateStepWidget'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { createTemplate, getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

import { DeploymentConfigStepDrawerTitle } from './DeploymentConfigStepDrawerTitle'
import css from './DeploymentConfigStepDrawer.module.scss'

const DEFAULT_STEP_PALETTE_MODULE_INFO = [
  {
    module: 'cd',
    shouldShowCommonSteps: true
  }
]

const getExistingStepIdentifiersSet = (executionStepsList: DeploymentConfigExecutionStepWrapper[]) =>
  new Set([
    ...map(executionStepsList, (executionStep: DeploymentConfigExecutionStepWrapper) => executionStep.step.identifier)
  ])

const checkDuplicateStep = (
  formikRef: React.MutableRefObject<StepFormikRef | null>,
  executionStepsList: DeploymentConfigExecutionStepWrapper[],
  getString: UseStringsReturn['getString'],
  isNewStep: boolean
): boolean => {
  const stepIdentifier = (formikRef.current?.getValues() as Values).identifier
  const existingStepIdentifiersSet = getExistingStepIdentifiersSet(executionStepsList)

  if (existingStepIdentifiersSet.has(stepIdentifier) && formikRef.current?.setFieldError && isNewStep) {
    setTimeout(() => {
      formikRef.current?.setFieldError('identifier', getString('pipelineSteps.duplicateStep'))
    }, 300)
    return true
  }
  return false
}

export function DeploymentConfigStepDrawer() {
  const formikRef = React.useRef<StepFormikRef | null>(null)

  const {
    deploymentConfig,
    updateDeploymentConfig,
    drawerData,
    setDrawerData,
    stepsFactory,
    templateTypes,
    setTemplateTypes,
    allowableTypes,
    isReadOnly
  } = useDeploymentContext()
  const { getTemplate } = useTemplateSelector()
  const { getString } = useStrings()

  const executionStepsList = deploymentConfig?.execution?.steps || []

  const templateStepNode = drawerData.data?.stepConfig?.node

  const isNewStep = React.useMemo(() => {
    const existingStepIdentifiersSet = getExistingStepIdentifiersSet(executionStepsList)
    return !existingStepIdentifiersSet.has(templateStepNode?.identifier as string)
  }, [executionStepsList, templateStepNode])

  const applyChanges = async (): Promise<void> => {
    if (checkDuplicateStep(formikRef, executionStepsList, getString, isNewStep)) {
      return
    }

    await formikRef?.current?.submitForm()
    if (!isEmpty(formikRef.current?.getErrors())) {
      return
    } else {
      const formValues = formikRef?.current?.getValues() as TemplateStepValues
      const stepNode = drawerData.data?.stepConfig?.node as TemplateStepNode
      const { template } = stepNode
      const { templateRef, versionLabel } = template || {}

      const updatedDeploymentConfig = produce(deploymentConfig, draft => {
        const executionSteps = deploymentConfig?.execution?.steps || []
        const updatedExecutionSteps = clone(executionSteps)
        const newStepToAdd: DeploymentConfigExecutionStepWrapper = {
          step: {
            name: formValues.name,
            identifier: formValues.identifier,
            template: {
              templateRef,
              versionLabel
            }
          }
        }

        if (isNewStep) {
          updatedExecutionSteps.push(newStepToAdd)
        } else {
          updatedExecutionSteps.forEach(executionStep => {
            if (executionStep.step.identifier === newStepToAdd.step.identifier) {
              executionStep.step = newStepToAdd.step
            }
          })
        }

        set(draft, 'execution.steps', updatedExecutionSteps)
      })
      const updatedTemplateTypes = produce(templateTypes, draft => {
        set(draft, templateRef, formValues.allValues?.type)
      })

      setTemplateTypes(updatedTemplateTypes)
      updateDeploymentConfig(updatedDeploymentConfig)
      setDrawerData({
        type: DrawerTypes.AddStep
      })
    }
  }

  const addOrUpdateTemplate = async (
    selectedTemplate: TemplateSummaryResponse,
    drawerType: DrawerTypes
  ): Promise<void> => {
    try {
      const stepType = get(templateTypes, getScopeBasedTemplateRef(selectedTemplate))
      const { template } = await getTemplate({
        templateType: 'Step',
        allChildTypes: [stepType],
        selectedTemplate
      })
      // "type" is required here in processNode as it has not been added yet for the new template in templateTypes map since the changes
      // have not been applied yet
      const processNode = {
        ...createTemplate(drawerData.data?.stepConfig?.node, template),
        type: template.childType as string
      }
      setDrawerData({
        type: drawerType,
        data: {
          stepConfig: {
            node: processNode
          },
          drawerConfig: {
            shouldShowApplyChangesBtn: true
          },
          isDrawerOpen: true
        }
      })
    } catch (_) {
      // Do nothing.. user cancelled template selection
    }
  }

  const removeTemplate = async (drawerType: DrawerTypes): Promise<void> => {
    const node = drawerData.data?.stepConfig?.node as TemplateStepNode
    const processNode = produce({} as StepElementConfig, draft => {
      draft.name = node.name
      draft.identifier = generateRandomString(node.name as string)
      draft.type = get(templateTypes, node.template.templateRef)
    })

    const updatedDeploymentConfig = produce(deploymentConfig, draft => {
      const updatedExecutionSteps = filter(
        executionStepsList,
        (executionStep: DeploymentConfigExecutionStepWrapper) => {
          return executionStep.step.identifier !== node.identifier
        }
      )
      set(draft, 'execution.steps', updatedExecutionSteps)
    })

    updateDeploymentConfig(updatedDeploymentConfig)
    setDrawerData({
      type: drawerType,
      data: {
        stepConfig: {
          node: processNode
        },
        isDrawerOpen: true
      }
    })
  }

  const drawerTitle = React.useMemo(() => {
    if (drawerData.type === DrawerTypes.StepConfig) {
      return (
        <DeploymentConfigStepDrawerTitle
          discardChanges={() => {
            setDrawerData({
              type: DrawerTypes.AddStep
            })
          }}
          applyChanges={applyChanges}
        />
      )
    }
  }, [drawerData])

  const onSelection = React.useCallback(
    async (data: StepData) => {
      const processNode: StepElementConfig = {
        name: '',
        identifier: generateRandomString(''),
        type: data.type as string
      }
      setDrawerData({
        type: DrawerTypes.StepConfig,
        data: {
          stepConfig: {
            node: processNode
          },
          isDrawerOpen: true
        }
      })
    },
    [setDrawerData]
  )

  const closeDrawer = React.useCallback(
    (e?: SyntheticEvent<HTMLElement, Event> | undefined): void => {
      e?.persist()
      setDrawerData({ type: DrawerTypes.AddStep, data: { isDrawerOpen: false } })
    },
    [setDrawerData]
  )

  const onCloseDrawer = React.useCallback((): void => {
    closeDrawer()
  }, [closeDrawer])

  return (
    <Container>
      <Drawer
        onClose={closeDrawer}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        hasBackdrop={true}
        size={DrawerSizes[drawerData.type]}
        isOpen={drawerData?.data?.isDrawerOpen}
        position={Position.RIGHT}
        data-type={drawerData.type}
        className={css.stepDrawer}
        title={drawerTitle}
        isCloseButtonShown={false}
        portalClassName={'pipeline-studio-right-drawer'}
      >
        <Button minimal className={css.closeButton} icon="cross" withoutBoxShadow onClick={onCloseDrawer} />
        {drawerData.type === DrawerTypes.StepConfig && (
          <StepCommands
            step={drawerData?.data?.stepConfig?.node as StepOrStepGroupOrTemplateStepData}
            ref={formikRef}
            stepsFactory={stepsFactory}
            checkDuplicateStep={checkDuplicateStep.bind(null, formikRef, executionStepsList, getString, isNewStep)}
            isNewStep={isNewStep}
            onUpdate={noop}
            viewType={StepCommandsViews.Pipeline}
            isStepGroup={false}
            isReadonly={isReadOnly}
            allowableTypes={allowableTypes}
            onUseTemplate={(selectedTemplate: TemplateSummaryResponse) =>
              addOrUpdateTemplate(selectedTemplate, drawerData.type)
            }
            onRemoveTemplate={() => removeTemplate(drawerData.type)}
          />
        )}
        {drawerData.type === DrawerTypes.AddStep && (
          <StepPalette
            stepsFactory={stepsFactory}
            stepPaletteModuleInfos={DEFAULT_STEP_PALETTE_MODULE_INFO}
            stageType={StageType.DEPLOY}
            onSelect={onSelection}
          />
        )}
      </Drawer>
    </Container>
  )
}
