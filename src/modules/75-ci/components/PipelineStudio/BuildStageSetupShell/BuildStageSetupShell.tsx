/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Expander } from '@blueprintjs/core'
import { cloneDeep, get, isEmpty, isEqual, set } from 'lodash-es'
import produce from 'immer'
import { Tabs, Tab, Icon, Button, Layout, ButtonVariation, IconName, AccordionTabs } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { HarnessIconName, IconProps } from '@harness/icons'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import type { StageType } from '@pipeline/utils/stageHelpers'
import {
  generateRandomString,
  STATIC_SERVICE_GROUP_NAME,
  StepType
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StepType as StepsStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type {
  Infrastructure,
  K8sDirectInfraYaml,
  K8sHostedInfraYaml,
  K8sHostedInfraYamlSpec,
  Platform,
  UseFromStageInfraYaml,
  VmInfraYaml,
  VmPoolYaml
} from 'services/ci'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { isCloneCodebaseEnabledAtLeastOneStage } from '@pipeline/utils/CIUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import NameIconHeader from '@common/components/NameIconHeader/NameIconHeader'
import { stageIconMap } from '@pipeline/pages/execution-list/ExecutionListTable/ExecutionStage'
import BuildInfraSpecifications from '../BuildInfraSpecifications/BuildInfraSpecifications'
import BuildStageSpecifications from '../BuildStageSpecifications/BuildStageSpecifications'
import BuildAdvancedSpecifications from '../BuildAdvancedSpecifications/BuildAdvancedSpecifications'
import { BuildTabs } from '../CIPipelineStagesUtils'
import css from './BuildStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'approval-stage-icon',
  Pipeline: 'chained-pipeline',
  Custom: 'custom-stage-icon'
}

interface StagesFilledStateFlags {
  specifications: boolean
  infra: boolean
  execution: boolean
}

interface BuildStageSetupShellProps {
  moduleIcon?: IconName
}

const TabsOrder = [BuildTabs.OVERVIEW, BuildTabs.INFRASTRUCTURE, BuildTabs.EXECUTION, BuildTabs.ADVANCED]

interface TabListType {
  id: BuildTabs
  title: React.ReactNode
  panel: JSX.Element
  dataTestId: string
  className?: string
}

const BuildStageSetupShell: React.FC<BuildStageSetupShellProps> = ({ moduleIcon }) => {
  const icon = moduleIcon ? moduleIcon : 'ci-main'
  const { getString } = useStrings()
  const { CDS_PIPELINE_STUDIO_UPGRADES } = useFeatureFlags()
  const [selectedTabId, setSelectedTabId] = React.useState<BuildTabs>(BuildTabs.OVERVIEW)
  const [filledUpStages, setFilledUpStages] = React.useState<StagesFilledStateFlags>({
    specifications: false,
    infra: false,
    execution: false
  })
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipeline,
      originalPipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId = '', selectedStepId, selectedSectionId, stageDetailsOpen },
      gitDetails,
      storeMetadata,
      templateTypes,
      templateIcons
    },
    contextType,
    getStageFromPipeline,
    updatePipelineView,
    isReadonly,
    updateStage,
    setSelectedStepId,
    updatePipeline,
    setSelectedSectionId
  } = pipelineContext

  const query = useQueryParams()
  const [stageData, setStageData] = React.useState<BuildStageElementConfig | undefined>()
  const poolName =
    ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.poolName ||
    ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.identifier

  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const getChildRef = (tabId: BuildTabs): React.RefObject<HTMLDivElement> | null => {
    return CDS_PIPELINE_STUDIO_UPGRADES && selectedTabId === tabId ? scrollRef : null
  }

  const stageDetailsVisible = isSplitViewOpen || stageDetailsOpen

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(BuildTabs.EXECUTION)
    }
  }, [selectedStepId])

  React.useEffect(() => {
    // @TODO: add CI Codebase field check if Clone Codebase is checked
    // once it is added to BuildStageSpecifications (CI-757)
    const specifications = !!(stageData?.name && stageData?.identifier)
    const infra = !!(
      ((stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef &&
        (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace) ||
      (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage ||
      ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.poolName ||
      ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.identifier ||
      ((stageData?.spec?.infrastructure as K8sHostedInfraYaml)?.spec as K8sHostedInfraYamlSpec)?.identifier ||
      ((stageData?.spec?.platform as Platform)?.os && (stageData?.spec?.platform as Platform)?.arch)
    )
    const execution = !!stageData?.spec?.execution?.steps?.length
    setFilledUpStages({ specifications, infra, execution })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stageData?.name,
    stageData?.identifier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage,
    poolName,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as K8sHostedInfraYaml)?.spec,
    stageData?.spec?.execution?.steps?.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.platform as Platform)?.os,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.platform as Platform)?.arch
  ])

  /* If a stage A propagates it's infra from another stage B and number of stages in a pipeline change due to deletion of propagated stage B, then infra for stage A needs to be reset */
  React.useEffect(() => {
    const propagatedStageId = (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
    if (stageData && propagatedStageId) {
      const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(propagatedStageId)
      if (!propagatedStage) {
        // indicates propagated stage doesn't exist
        const stageWithoutInfra = set(stageData, 'spec.infrastructure', {
          useFromStage: {}
        })
        updateStage(stageWithoutInfra)
      }
    }
  }, [pipeline?.stages?.length])

  React.useEffect(() => {
    if (selectedStageId && stageDetailsVisible) {
      const { stage } = cloneDeep(getStageFromPipeline<BuildStageElementConfig>(selectedStageId))
      const key = Object.keys(stage || {})[0]
      if (key && stage && !isEqual(stage[key as 'stage'], stageData)) {
        setStageData(stage[key as 'stage'])
      }
    }
  }, [selectedStageId, pipeline, stageDetailsVisible])

  React.useEffect(() => {
    // if clone codebase is not enabled at least one stage, then remove properties from pipeline
    if (!isCloneCodebaseEnabledAtLeastOneStage(pipeline)) {
      const newPipeline = pipeline
      delete newPipeline.properties
      updatePipeline(newPipeline)
    }
  }, [stageData?.spec?.cloneCodebase])

  const { checkErrorsForTab } = React.useContext(StageErrorContext)

  const handleTabChange = (data: BuildTabs) => {
    checkErrorsForTab(selectedTabId).then(_ => {
      setSelectedTabId(data)
      setSelectedSectionId(data)
    })
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      const parent = layoutRef.current.parentElement
      if (parent && parent.scrollTo) {
        parent.scrollTo(0, 0)
      }
    }
  }, [selectedTabId])

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })
  const selectedStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId).stage
  const originalStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId, originalPipeline).stage
  const infraHasWarning = !filledUpStages.infra
  const executionHasWarning = !filledUpStages.execution
  const stageIconProps = stageIconMap[selectedStage?.stage?.type as StageType]

  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId && TabsOrder.includes(sectionId)) {
      setSelectedTabId(sectionId)
    } else {
      setSelectedSectionId(BuildTabs.EXECUTION)
    }
  }, [selectedSectionId])

  // NOTE: set empty arrays, required by ExecutionGraph
  const selectedStageClone = cloneDeep(selectedStage)
  if (selectedStageClone) {
    if (!selectedStageClone.stage?.spec?.serviceDependencies) {
      set(selectedStageClone, 'stage.spec.serviceDependencies', [])
    }
    if (!selectedStageClone.stage?.spec?.execution?.steps) {
      set(selectedStageClone, 'stage.spec.execution.steps', [])
    }
  }

  const navBtns = (
    <Layout.Horizontal spacing="medium" className={css.footer}>
      {selectedTabId !== BuildTabs.OVERVIEW ? (
        <Button
          text={getString('back')}
          icon="chevron-left"
          onClick={() =>
            handleTabChange(
              selectedTabId === BuildTabs.ADVANCED
                ? BuildTabs.EXECUTION
                : selectedTabId === BuildTabs.EXECUTION
                ? BuildTabs.INFRASTRUCTURE
                : BuildTabs.OVERVIEW
            )
          }
          variation={ButtonVariation.SECONDARY}
        />
      ) : null}
      {selectedTabId === BuildTabs.ADVANCED ? (
        contextType === PipelineContextType.Pipeline ? (
          <Button
            text="Done"
            intent="primary"
            onClick={() => {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
            }}
            variation={ButtonVariation.PRIMARY}
          />
        ) : null
      ) : (
        <Button
          text={selectedTabId === BuildTabs.EXECUTION ? getString('ci.save') : getString('continue')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === BuildTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              handleTabChange(selectedTabId === BuildTabs.OVERVIEW ? BuildTabs.INFRASTRUCTURE : BuildTabs.EXECUTION)
            }
          }}
          variation={ButtonVariation.PRIMARY}
          disabled={
            selectedTabId === BuildTabs.INFRASTRUCTURE &&
            (stageData?.spec?.infrastructure as Infrastructure)?.type === CIBuildInfrastructureType.KubernetesHosted &&
            !((stageData?.spec?.infrastructure as K8sHostedInfraYaml)?.spec as K8sHostedInfraYamlSpec)?.identifier
          }
        />
      )}
    </Layout.Horizontal>
  )

  const tabList = [
    {
      id: BuildTabs.OVERVIEW,
      title: (
        <span className={css.title}>
          <Icon name={icon} height={14} size={14} />
          Overview
        </span>
      ),
      panel: <BuildStageSpecifications customRef={getChildRef(BuildTabs.OVERVIEW)}>{navBtns}</BuildStageSpecifications>,
      dataTestId: 'overview'
    },
    {
      id: BuildTabs.INFRASTRUCTURE,
      title: (
        <span className={css.title}>
          <Icon
            name={infraHasWarning ? 'warning-sign' : 'infrastructure'}
            size={infraHasWarning ? 16 : 20}
            color={infraHasWarning ? Color.ORANGE_500 : undefined}
          />
          {getString('ci.infraLabel')}
        </span>
      ),
      panel: (
        <BuildInfraSpecifications customRef={getChildRef(BuildTabs.INFRASTRUCTURE)}>{navBtns}</BuildInfraSpecifications>
      ),
      dataTestId: getString('ci.infraLabel')
    },
    {
      id: BuildTabs.EXECUTION,
      className: cx({ [css.fullHeight]: !CDS_PIPELINE_STUDIO_UPGRADES }, css.executionPanel),
      title: (
        <span className={css.title}>
          <Icon
            name={executionHasWarning ? 'warning-sign' : 'execution'}
            size={executionHasWarning ? 16 : 20}
            color={executionHasWarning ? Color.ORANGE_500 : undefined}
          />
          {getString('ci.executionLabel')}
        </span>
      ),
      panel: (
        <ExecutionGraph
          allowAddGroup={true}
          hasRollback={false}
          isReadonly={isReadonly}
          hasDependencies={true}
          stage={selectedStageClone}
          originalStage={originalStage}
          ref={executionRef}
          templateTypes={templateTypes}
          templateIcons={templateIcons}
          updateStage={newStageData => {
            const newData = produce(newStageData, draft => {
              // cleanup rollbackSteps (note: rollbackSteps does not exist on CI stage at all)
              if (draft?.stage?.spec?.execution?.rollbackSteps) {
                delete draft.stage.spec.execution.rollbackSteps
              }
              // delete serviceDependencies if its empty array (as serviceDependencies is optional)
              if (draft?.stage?.spec?.serviceDependencies && isEmpty(draft?.stage?.spec?.serviceDependencies)) {
                delete draft.stage.spec.serviceDependencies
              }
            })

            if (newData.stage) {
              updateStage(newData.stage)
            }
          }}
          // Check and update the correct stage path here
          onAddStep={(event: ExecutionGraphAddStepEvent) => {
            if (event.parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: true,
                drawerData: {
                  type: DrawerTypes.ConfigureService,
                  data: {
                    stepConfig: {
                      node: {
                        type: StepsStepType.Dependency,
                        name: '',
                        identifier: generateRandomString(StepsStepType.Dependency)
                      },
                      stepsMap: event.stepsMap,
                      onUpdate: executionRef.current?.stepGroupUpdated,
                      addOrEdit: 'add',
                      isStepGroup: false,
                      hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                    }
                  }
                }
              })
            } else {
              if (event.isTemplate) {
                addTemplate(event)
              } else {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.AddStep,
                    data: {
                      paletteData: {
                        entity: event.entity,
                        stepsMap: event.stepsMap,
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        // isAddStepOverride: true,
                        isRollback: event.isRollback,
                        isParallelNodeClicked: event.isParallel,
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                      }
                    }
                  }
                })
              }
            }
          }}
          onEditStep={(event: ExecutionGraphEditStepEvent) => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: event.stepType === StepType.STEP ? DrawerTypes.StepConfig : DrawerTypes.ConfigureService,
                data: {
                  stepConfig: {
                    node: event.node as any,
                    stepsMap: event.stepsMap,
                    onUpdate: executionRef.current?.stepGroupUpdated,
                    isStepGroup: event.isStepGroup,
                    isUnderStepGroup: event.isUnderStepGroup,
                    addOrEdit: event.addOrEdit,
                    hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                  }
                }
              }
            })
          }}
          onSelectStep={(stepId: string) => {
            setSelectedStepId(stepId)
          }}
          selectedStepId={selectedStepId}
          className={CDS_PIPELINE_STUDIO_UPGRADES ? css.executionGraph : ''}
        />
      ),
      dataTestId: getString('ci.executionLabel')
    },
    {
      id: BuildTabs.ADVANCED,
      title: (
        <span className={css.title}>
          <Icon name="advanced" height={20} size={20} />
          {getString('ci.advancedLabel')}
        </span>
      ),
      panel: (
        <BuildAdvancedSpecifications customRef={getChildRef(BuildTabs.ADVANCED)}>{navBtns}</BuildAdvancedSpecifications>
      ),
      dataTestId: getString('ci.advancedLabel')
    }
  ].filter(Boolean) as TabListType[]

  const stageHeaderName = React.useMemo((): string => {
    const stageName = get(selectedStage?.stage, 'name', '')
    return `${getString('common.stage')}: ${stageName}`
  }, [getString, selectedStage?.stage])

  const renderArrow = (id: string) => {
    return (
      <Icon
        key={`tab-arrow-${id}`}
        name="chevron-right"
        height={20}
        size={20}
        margin={{ right: 'small', left: 'small' }}
        color={'grey400'}
        style={{ alignSelf: 'center' }}
      />
    )
  }

  return (
    <section className={css.setupShell} ref={layoutRef} key={selectedStageId}>
      {/* Common Error strip for stage setup shell in NEW_PIPELINE_STUDIO */}
      {CDS_PIPELINE_STUDIO_UPGRADES ? (
        <div className={css.accordionTabWrapper}>
          <Layout.Horizontal padding={{ top: 'xlarge', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }}>
            {/* Icon and Title Header*/}
            <NameIconHeader iconProps={stageIconProps as IconProps} name={stageHeaderName} />
            {isContextTypeNotStageTemplate(contextType) && selectedStage?.stage && (
              <>
                <Expander />
                <SaveTemplateButton
                  data={selectedStage?.stage}
                  type={'Stage'}
                  gitDetails={gitDetails}
                  storeMetadata={storeMetadata}
                />
              </>
            )}
          </Layout.Horizontal>

          <AccordionTabs
            tabList={tabList}
            tabsProps={{
              id: 'stageSetupShell',
              onChange: (nextTab: BuildTabs) => handleTabChange(nextTab),
              selectedTabId: selectedTabId
            }}
            accordionProps={{
              onChange: (nextTab: BuildTabs) => handleTabChange(nextTab),
              controlledActiveId: selectedTabId,
              className: css.accordionClassName,
              panelClassName: css.accordionPanelClassName,
              summaryClassName: css.accordionSummaryClassName
            }}
          >
            <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
          </AccordionTabs>
        </div>
      ) : (
        <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId}>
          {tabList.reduce<React.ReactElement[]>((acc, { id, panel, title, dataTestId, className }, idx) => {
            return [
              ...acc,
              <Tab
                key={id}
                id={id}
                panel={panel}
                title={title}
                data-testid={dataTestId}
                {...(className && { className })}
              />,
              ...(idx < tabList.length - 1 ? [renderArrow(id)] : [])
            ]
          }, [])}

          {isContextTypeNotStageTemplate(contextType) && selectedStage?.stage && (
            <>
              <Expander />
              <SaveTemplateButton
                data={selectedStage?.stage}
                type={'Stage'}
                gitDetails={gitDetails}
                storeMetadata={storeMetadata}
              />
            </>
          )}
        </Tabs>
      )}
    </section>
  )
}

export default BuildStageSetupShell
