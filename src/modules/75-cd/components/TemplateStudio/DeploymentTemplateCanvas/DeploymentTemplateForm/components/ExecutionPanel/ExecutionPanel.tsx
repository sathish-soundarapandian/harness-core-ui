/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes, Icon, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { get, map, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Button, ButtonVariation, Container, Layout, Popover, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { useStrings } from 'framework/strings'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { DeploymentConfigStepTemplateRefDetails } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import { StepCategory, useGetStepsV2 } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import {
  getUpdatedDeploymentConfig,
  getUpdatedTemplateDetailsByRef
} from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/ExecutionPanel/ExecutionPanelUtils'
import { StepTemplateCard } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/StepTemplateCard/StepTemplateCard'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import css from './ExecutionPanel.module.scss'

function AddStepTemplate({ onAddStepClick }: { onAddStepClick: () => void }) {
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
        {getString('add')}
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
  const {
    deploymentConfig,
    updateDeploymentConfig,
    setDrawerData,
    isReadOnly,
    templateDetailsByRef,
    setTemplateDetailsByRef
  } = useDeploymentContext()
  const stepTemplateRefs = get(
    deploymentConfig,
    'execution.stepTemplateRefs',
    []
  ) as DeploymentConfigStepTemplateRefDetails[]

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
      const templateRef = getScopeBasedTemplateRef(template)

      const templateRefObj = {
        templateRef,
        versionLabel: template.versionLabel as string
      }

      const updatedDeploymentConfig = getUpdatedDeploymentConfig({ templateRefObj, deploymentConfig })
      const updatedTemplateDetailsByRef = getUpdatedTemplateDetailsByRef({
        templateDetailsObj: template,
        templateRef,
        templateDetailsByRef
      })

      setTemplateDetailsByRef(updatedTemplateDetailsByRef)
      updateDeploymentConfig(updatedDeploymentConfig)
      setDrawerData({
        type: DrawerTypes.AddStep
      })
    } catch (_) {
      // Do nothing.. user cancelled template selection
    }
  }

  const renderLinkedStepTemplates = () =>
    map(stepTemplateRefs, (stepTemplateRefObj: DeploymentConfigStepTemplateRefDetails, stepTemplateIndex: number) => {
      return !isEmpty(stepTemplateRefObj) ? (
        <StepTemplateCard stepTemplateRefObj={stepTemplateRefObj} stepTemplateIndex={stepTemplateIndex} />
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
            {getString('cd.addStepTemplatesForYourDeploymentType')}
          </Text>
          <Container className={css.stepsContainer}>
            <Popover
              interactionKind={PopoverInteractionKind.CLICK}
              className={Classes.DARK}
              position={Position.BOTTOM}
              disabled={isReadOnly}
              isOpen={isDeploymentStepPopoverOpen}
              onInteraction={setIsDeploymentStepPopoverOpen}
              content={
                <Layout.Vertical className={css.addStepPopoverContainer} spacing="small" padding="small">
                  <Button
                    minimal
                    variation={ButtonVariation.PRIMARY}
                    icon="Edit"
                    text={getString('cd.addStepTemplate')}
                    onClick={handleAddStepClick}
                  />
                  <Button
                    minimal
                    variation={ButtonVariation.PRIMARY}
                    icon="template-library"
                    text={getString('cd.useStepTemplate')}
                    onClick={handleUseTemplateClick}
                  />
                </Layout.Vertical>
              }
            >
              <AddStepTemplate onAddStepClick={openDeploymentStepPopover} />
            </Popover>
            {renderLinkedStepTemplates()}
          </Container>
        </Layout.Vertical>
      </CardWithOuterTitle>
      {children}
    </Container>
  )
}
