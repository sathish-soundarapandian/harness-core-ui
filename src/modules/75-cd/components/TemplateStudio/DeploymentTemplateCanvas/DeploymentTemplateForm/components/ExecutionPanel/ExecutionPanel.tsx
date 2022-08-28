/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes, Icon, PopoverInteractionKind, Position } from '@blueprintjs/core'
import produce from 'immer'
import { defaultTo, filter, get, map, set, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Button, ButtonVariation, Container, Layout, Popover, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { useStrings } from 'framework/strings'
import {
  DeploymentConfigExecutionStepWrapper,
  useDeploymentContext
} from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { StepCategory, useGetStepsV2, StepElementConfig, TemplateStepNode } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import CardWithOuterTitle from '@pipeline/components/CardWithOuterTitle/CardWithOuterTitle'
import { generateRandomString } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StepTemplateCard } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/StepTemplateCard/StepTemplateCard'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import css from './ExecutionPanel.module.scss'

function AddStep({ onAddStepClick }: { onAddStepClick: () => void }) {
  const { isReadOnly } = useDeploymentContext()
  const { getString } = useStrings()

  const handleOnClick = () => {
    if (!isReadOnly) {
      onAddStepClick()
    }
  }

  return (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" onClick={handleOnClick}>
      <Container className={cx({ [css.addStepDisabled]: isReadOnly }, css.addStep)}>
        <Icon icon="plus" iconSize={22} color={'var(--grey-400)'} />
      </Container>
      <Text
        className={cx({ [css.addStepDisabled]: isReadOnly })}
        font={{ size: 'small', weight: 'semi-bold' }}
        color={Color.GREY_500}
      >
        {getString('pipelines-studio.addStep')}
      </Text>
    </Layout.Vertical>
  )
}

const getStepTypesFromCategories = (stepCategories: StepCategory[]): string[] => {
  const validStepTypes: string[] = []
  stepCategories.forEach(category => {
    if (category.stepCategories?.length) {
      validStepTypes.push(...getStepTypesFromCategories(category.stepCategories))
    } else if (category.stepsData?.length) {
      category.stepsData.forEach(stepData => {
        if (stepData.type) {
          validStepTypes.push(stepData.type)
        }
      })
    }
  })
  return validStepTypes
}

export function ExecutionPanel({ children }: React.PropsWithChildren<unknown>) {
  const { deploymentConfig, updateDeploymentConfig, setDrawerData, isReadOnly, drawerData } = useDeploymentContext()
  const executionSteps = get(deploymentConfig, 'execution.steps', []) as DeploymentConfigExecutionStepWrapper[]

  const { getTemplate } = useTemplateSelector()
  const { accountId } = useParams<ProjectPathProps>()

  const [isDeploymentStepPopoverOpen, setIsDeploymentStepPopoverOpen] = React.useState(false)
  const [allChildTypes, setAllChildTypes] = React.useState<string[]>([])

  const { data: stepsData } = useMutateAsGet(useGetStepsV2, {
    queryParams: { accountId },
    body: {
      stepPalleteModuleInfos: [
        {
          module: 'cd',
          shouldShowCommonSteps: true
        }
      ]
    }
  })

  React.useEffect(() => {
    if (stepsData?.data?.stepCategories) {
      setAllChildTypes(getStepTypesFromCategories(stepsData.data.stepCategories))
    }
  }, [stepsData?.data?.stepCategories])

  const openDeploymentStepPopover = () => {
    setIsDeploymentStepPopoverOpen(true)
  }

  const closeDeploymentStepPopover = () => {
    setIsDeploymentStepPopoverOpen(false)
  }

  const { getString } = useStrings()

  const onUseTemplate = async (): Promise<void> => {
    try {
      const { template } = await getTemplate({ templateType: 'Step', allChildTypes })

      const processNode = produce({} as StepElementConfig, draft => {
        const nodeName = drawerData.data?.stepConfig?.node?.name
        draft.name = defaultTo(nodeName, '')
        draft.identifier = generateRandomString(defaultTo(nodeName, ''))
        draft.type = template?.childType as string
        set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
        if (template.versionLabel) {
          set(draft, 'template.versionLabel', template.versionLabel)
        }
      })

      setDrawerData({
        type: DrawerTypes.StepConfig,
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

  const onStepTemplateCardViewClick = (stepNode: TemplateStepNode) => {
    const { name, identifier, template } = stepNode
    const { templateRef, versionLabel } = template || {}

    const processNode = produce({} as TemplateStepNode, draft => {
      draft.name = defaultTo(name, '')
      draft.identifier = identifier
      set(draft, 'template.templateRef', templateRef)
      if (versionLabel) {
        set(draft, 'template.versionLabel', versionLabel)
      }
    })

    setDrawerData({
      type: DrawerTypes.StepConfig,
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
  }

  const handleStepTemplateCardRemove = (stepNode: TemplateStepNode) => {
    const updatedDeploymentConfig = produce(deploymentConfig, draft => {
      const updatedExecutionSteps = filter(executionSteps, (executionStep: DeploymentConfigExecutionStepWrapper) => {
        return executionStep.step.identifier !== stepNode.identifier
      })
      set(draft, 'execution.steps', updatedExecutionSteps)
    })
    updateDeploymentConfig(updatedDeploymentConfig)
  }

  const renderLinkedStepTemplates = () =>
    map(executionSteps, (executionStepObj: DeploymentConfigExecutionStepWrapper) => {
      return !isEmpty(executionStepObj?.step) ? (
        <StepTemplateCard
          stepNode={executionStepObj.step}
          onRemoveClick={handleStepTemplateCardRemove}
          onCardClick={onStepTemplateCardViewClick}
        />
      ) : null
    })

  const handleAddStepClick = React.useCallback(() => {
    setDrawerData({ type: DrawerTypes.AddStep, data: { isDrawerOpen: true } })
    closeDeploymentStepPopover()
  }, [])

  const handleUseTemplateClick = React.useCallback(() => {
    onUseTemplate()
    closeDeploymentStepPopover()
  }, [])

  return (
    <Container className={css.executionWidgetWrapper}>
      <CardWithOuterTitle
        title={getString('cd.deploymentSteps')}
        className={css.deploymentStepsCard}
        headerClassName={css.headerText}
      >
        <Layout.Vertical spacing="medium" width={'100%'}>
          <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
            {getString('cd.addStepsForYourDeploymentType')}
          </Text>
          <Container className={css.stepsContainer}>
            <Popover
              interactionKind={PopoverInteractionKind.CLICK}
              className={Classes.DARK}
              position={Position.BOTTOM}
              disabled={isReadOnly}
              isOpen={isDeploymentStepPopoverOpen}
              onInteraction={nextOpenState => {
                setIsDeploymentStepPopoverOpen(nextOpenState)
              }}
              content={
                <Layout.Vertical className={css.addStepPopoverContainer} spacing="small" padding="small">
                  <Button
                    minimal
                    variation={ButtonVariation.PRIMARY}
                    icon="Edit"
                    text={getString('pipelines-studio.addStep')}
                    onClick={handleAddStepClick}
                  />
                  <Button
                    minimal
                    variation={ButtonVariation.PRIMARY}
                    icon="template-library"
                    text={getString('common.useTemplate')}
                    onClick={handleUseTemplateClick}
                  />
                </Layout.Vertical>
              }
            >
              <AddStep onAddStepClick={openDeploymentStepPopover} />
            </Popover>
            {renderLinkedStepTemplates()}
          </Container>
        </Layout.Vertical>
      </CardWithOuterTitle>
      {children}
    </Container>
  )
}
