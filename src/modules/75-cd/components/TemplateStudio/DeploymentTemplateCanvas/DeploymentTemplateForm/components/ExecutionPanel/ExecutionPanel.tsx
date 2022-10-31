/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Intent, Position } from '@blueprintjs/core'
import { at, defaultTo, get, isEmpty, map, noop, set } from 'lodash-es'
import {
  Button,
  Container,
  GridListToggle,
  IconName,
  Layout,
  Text,
  Views,
  ExpandingSearchInput,
  useToaster,
  ExpandingSearchInputHandle,
  useConfirmationDialog
} from '@wings-software/uicore'
import cx from 'classnames'
import { Color } from '@wings-software/design-system'
import { useHistory, useParams } from 'react-router-dom'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { TemplateUsage } from '@templates-library/utils/templatesUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import {
  getUpdatedDeploymentConfig,
  getUpdatedTemplateDetailsByRef
} from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/ExecutionPanel/ExecutionPanelUtils'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { TemplatesActionPopover } from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import type { TemplateSummaryResponse } from 'services/template-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ExecutionPanelListView from './ExecutionPanelListView/ExecutionPanelListView'
import { StepTemplateCard } from '../StepTemplateCard/StepTemplateCard'
import css from './ExecutionPanel.module.scss'
export interface StepAdditionMenuItem {
  icon: IconName
  label: string
  onClick: () => void
}

const ALLOWED_STEP_TEMPLATE_TYPES = [StepType.SHELLSCRIPT, StepType.HTTP]

export function ExecutionPanel({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const {
    deploymentConfig,
    updateDeploymentConfig,
    setDrawerData,
    isReadOnly,
    templateDetailsByRef,
    setTemplateDetailsByRef
  } = useDeploymentContext()
  const stepTemplateRefs = get(deploymentConfig, 'execution.stepTemplateRefs', []) as string[]
  const { getString } = useStrings()
  const { getTemplate } = useTemplateSelector()
  const history = useHistory()
  const { showSuccess, showWarning } = useToaster()
  const searchRef = React.useRef<ExpandingSearchInputHandle>()

  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  const [menuOpen, setMenuOpen] = React.useState(false)
  const [view, setView] = React.useState<Views>(Views.GRID)
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse | undefined>()
  const [stepTemplateRefsList, setStepTemplateRefsList] = React.useState(stepTemplateRefs)
  const [searchString, setSearchString] = React.useState<string | undefined>(undefined)

  useEffect(() => {
    searchRef.current?.clear()
  }, [stepTemplateRefs])

  useEffect(() => {
    let filteredstepTemplateRefs = [...stepTemplateRefs]
    if (searchString) {
      filteredstepTemplateRefs = filteredstepTemplateRefs.filter(item =>
        item.toLowerCase().includes(searchString.toLowerCase())
      )
    }
    setStepTemplateRefsList(filteredstepTemplateRefs)
  }, [searchString, stepTemplateRefs])

  const onUseTemplate = async (): Promise<void> => {
    try {
      const { template } = await getTemplate({
        templateType: 'Step',
        filterProperties: {
          childTypes: ALLOWED_STEP_TEMPLATE_TYPES
        },
        disableVersionChange: true,
        allowedUsages: [TemplateUsage.USE]
      })
      const templateRef = getScopeBasedTemplateRef(template)
      /* istanbul ignore next */
      if (stepTemplateRefs.some(item => item === templateRef)) {
        showWarning(getString('cd.duplicateStep'))
        return
      }
      const updatedDeploymentConfig = getUpdatedDeploymentConfig({ templateRef, deploymentConfig })
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

  const handleAddStepClick = React.useCallback(() => {
    setDrawerData({ type: DrawerTypes.AddStep, data: { isDrawerOpen: true } })
  }, [setDrawerData])

  const handleUseTemplateClick = (): void => {
    onUseTemplate()
  }

  const stepAdditionOptions: StepAdditionMenuItem[] = [
    {
      label: getString('cd.createAndUseTemplate'),
      icon: 'plus',
      onClick: handleAddStepClick
    },
    {
      label: getString('templatesLibrary.useTemplateLabel'),
      icon: 'template-library',
      onClick: handleUseTemplateClick
    }
  ]

  const handleCardClick = React.useCallback(
    templateData => {
      setDrawerData({
        type: DrawerTypes.ViewTemplateDetails,
        data: {
          isDrawerOpen: true,
          templateDetails: templateData
        }
      })
    },
    [setDrawerData]
  )

  const goToTemplateStudio = (template: TemplateSummaryResponse): void => {
    history.push(
      routes.toTemplateStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        templateType: template.templateEntityType,
        templateIdentifier: defaultTo(template.identifier, ''),
        versionLabel: template.versionLabel,
        repoIdentifier: template.gitDetails?.repoIdentifier,
        branch: template.gitDetails?.branch
      })
    )
  }

  const handleCardRemove = (template: TemplateSummaryResponse): void => {
    const updatedDeploymentConfig = produce(deploymentConfig, draft => {
      const updatedStepTemplateRefs = stepTemplateRefs.filter(
        templateRef => templateRef !== getScopeBasedTemplateRef(template)
      )
      set(draft, 'execution.stepTemplateRefs', updatedStepTemplateRefs)
    })
    updateDeploymentConfig(updatedDeploymentConfig).then(_ => {
      showSuccess(getString('cd.removeStepTemplateSuccess'))
    })
  }

  const { openDialog: openRemoveStepTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    cancelButtonText: getString('no'),
    contentText: getString('cd.removeStepTemplateConfirmationLabel'),
    titleText: getString('cd.removeStepTemplate'),
    confirmButtonText: getString('yes'),
    buttonIntent: Intent.DANGER,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        selectedTemplate && handleCardRemove(selectedTemplate)
      }
    }
  })

  const handleRemoveTemplateClick = React.useCallback(
    (template: TemplateSummaryResponse) => {
      setSelectedTemplate(template)
      openRemoveStepTemplateDialog()
    },
    [openRemoveStepTemplateDialog]
  )

  const content = React.useMemo(() => {
    const allTemplatesRefData = [] as TemplateSummaryResponse[]

    stepTemplateRefsList.forEach(name => {
      allTemplatesRefData.push({ ...at(templateDetailsByRef, name)[0], templateRef: name } as TemplateSummaryResponse)
    })
    if (isEmpty(stepTemplateRefsList) && searchString) {
      /* istanbul ignore next */
      return (
        <Text margin={{ top: 'large', bottom: 'small' }} color={Color.GREY_500} font={{ size: 'small' }}>
          {getString('common.filters.noMatchingFilterData')}
        </Text>
      )
    }

    const commonProps = {
      onSelect: handleCardClick,
      onPreview: handleCardClick,
      onOpenEdit: goToTemplateStudio,
      onDelete: handleRemoveTemplateClick
    }

    return view === Views.GRID ? (
      <Container className={css.stepsContainer}>
        {map(allTemplatesRefData, (stepTemplateRefData: TemplateSummaryResponse, stepTemplateIndex: number) => {
          return (
            !isEmpty(stepTemplateRefData) && (
              <StepTemplateCard {...commonProps} key={stepTemplateIndex} templateDetails={stepTemplateRefData} />
            )
          )
        })}
      </Container>
    ) : (
      <ExecutionPanelListView {...commonProps} gotoPage={noop} data={{ content: allTemplatesRefData }} />
    )
  }, [stepTemplateRefsList, view, handleCardClick, templateDetailsByRef])

  const onChange = (text: string): void => {
    setSearchString(text.trim())
  }

  return (
    <Container className={css.executionWidgetWrapper}>
      <Container flex={{ justifyContent: 'space-between' }}>
        <Layout.Horizontal margin={{ top: 'xlarge', bottom: 'xlarge', left: 'medium', right: 'medium' }}>
          <Text
            color={Color.BLACK}
            className={cx(css.headerText, css.marginRight)}
            tooltipProps={{ dataTooltipId: 'deploymentStepsDT' }}
          >
            {getString('cd.deploymentSteps')}
          </Text>
          <TemplatesActionPopover
            open={menuOpen}
            minimal={true}
            items={stepAdditionOptions}
            position={Position.BOTTOM}
            disabled={isReadOnly}
            setMenuOpen={setMenuOpen}
            usePortal
          >
            <Button
              icon="plus"
              rightIcon="chevron-down"
              text={getString('addStep')}
              onClick={noop}
              disabled={isReadOnly}
              className={css.addButton}
            />
          </TemplatesActionPopover>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <ExpandingSearchInput
            onChange={onChange}
            alwaysExpanded={false}
            placeholder={getString('stepPalette.searchPlaceholder')}
            className={css.marginRight}
            ref={searchRef}
            autoFocus={false}
          />
          <GridListToggle initialSelectedView={view} onViewToggle={setView} />
        </Layout.Horizontal>
      </Container>

      <CardWithOuterTitle className={css.deploymentStepsCard}>
        <Layout.Vertical spacing="medium" width={'100%'}>
          <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
            {getString('cd.useStepTemplatesForYourDeploymentType')}
          </Text>
          <Container>{content}</Container>
        </Layout.Vertical>
      </CardWithOuterTitle>
      {children}
    </Container>
  )
}
