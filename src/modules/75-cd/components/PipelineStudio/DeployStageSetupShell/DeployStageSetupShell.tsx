/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Tabs, Tab, Button, Icon, ButtonVariation, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import cx from 'classnames'
import { Expander, IconName } from '@blueprintjs/core'
import { defaultTo, get, isEmpty, set, debounce } from 'lodash-es'
import type { ValidationError } from 'yup'
import YAML from 'yaml'
import produce from 'immer'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  GetExecutionStrategyYamlQueryParams,
  GoogleCloudFunctionDeploymentMetaData,
  StageElementConfig,
  useGetExecutionStrategyYaml,
  useGetFailureStrategiesYaml
} from 'services/cd-ng'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import {
  DeployTabs,
  ExecutionType,
  isNewServiceEnvEntity,
  isNewEnvInfraDef
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import {
  getServiceDefinitionType,
  isCustomDeploymentType,
  isGoogleCloudFuctionsDeploymentType,
  isServerlessDeploymentType,
  ServiceDeploymentType,
  StageType,
  GoogleCloudFunctionsEnvType
} from '@pipeline/utils/stageHelpers'
import { getCDStageValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import {
  isContextTypeNotStageTemplate,
  isContextTypeTemplateType
} from '@pipeline/components/PipelineStudio/PipelineUtils'
import DeployInfraSpecifications from '../DeployInfraSpecifications/DeployInfraSpecifications'
import DeployServiceSpecifications from '../DeployServiceSpecifications/DeployServiceSpecifications'
import DeployStageSpecifications from '../DeployStageSpecifications/DeployStageSpecifications'
import DeployAdvancedSpecifications from '../DeployAdvancedSpecifications/DeployAdvancedSpecifications'
import DeployEnvSpecifications from '../DeployEnvSpecifications/DeployEnvSpecifications'
import DeployServiceEntitySpecifications from '../DeployServiceSpecifications/DeployServiceEntitySpecifications'
import css from './DeployStageSetupShell.module.scss'

const TabsOrder = [
  DeployTabs.OVERVIEW,
  DeployTabs.SERVICE,
  DeployTabs.INFRASTRUCTURE,
  DeployTabs.EXECUTION,
  DeployTabs.ADVANCED
]
const iconNames = { tick: 'tick' as IconName }

export default function DeployStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const { NG_SVC_ENV_REDESIGN = false } = useFeatureFlags()
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const pipelineContext = usePipelineContext()
  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStageId, selectedStepId, selectedSectionId },
      gitDetails,
      storeMetadata,
      templateTypes,
      templateIcons,
      templateServiceData
    },
    contextType,
    stagesMap,
    isReadonly,
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    scope,
    setSelectedStepId,
    setSelectedSectionId
  } = pipelineContext

  const query = useQueryParams()
  const { accountId } = useParams<AccountPathProps>()
  const [incompleteTabs, setIncompleteTabs] = React.useState<{ [key in DeployTabs]?: boolean }>({})
  const [selectedTabId, setSelectedTabId] = React.useState<DeployTabs>(
    selectedStepId ? DeployTabs.EXECUTION : DeployTabs.SERVICE
  )
  const { stage: selectedStage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const { checkErrorsForTab } = React.useContext(StageErrorContext)
  const gitOpsEnabled = selectedStage?.stage?.spec?.gitOpsEnabled
  const isNewService = isNewServiceEnvEntity(NG_SVC_ENV_REDESIGN, selectedStage?.stage as DeploymentStageElementConfig)
  const isNewEnvDef = isNewEnvInfraDef(NG_SVC_ENV_REDESIGN, selectedStage?.stage as DeploymentStageElementConfig)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )

  const serviceDefinitionType = useCallback((): GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] => {
    return getServiceDefinitionType(
      selectedStage,
      getStageFromPipeline,
      isNewServiceEnvEntity,
      NG_SVC_ENV_REDESIGN,
      templateServiceData
    )
  }, [getStageFromPipeline, NG_SVC_ENV_REDESIGN, selectedStage, templateServiceData])

  // ? This function should ideally not be present here. Needs refactoring
  const setDefaultServiceSchema = useCallback((): Promise<void> => {
    const stageData = produce(selectedStage, draft => {
      if (draft) {
        if (isNewService) {
          if (
            isEmpty(get(draft, 'stage.spec.service.serviceRef')) &&
            isEmpty(get(draft, 'stage.spec.services.values')) &&
            isEmpty(get(draft, 'stage.spec.service.useFromStage')) &&
            // deploy type check - fixes weird issue which updates any other stage / stage template on unmount.
            draft.stage?.type === StageType.DEPLOY
          ) {
            set(draft, 'stage.spec.service', {
              serviceRef: scope === Scope.PROJECT && !isContextTypeTemplateType(contextType) ? '' : RUNTIME_INPUT_VALUE,
              serviceInputs:
                scope === Scope.PROJECT && !isContextTypeTemplateType(contextType) ? undefined : RUNTIME_INPUT_VALUE
            })
          }
        } else {
          set(draft, 'stage.spec.serviceConfig', {
            serviceRef: scope === Scope.PROJECT && !isContextTypeTemplateType(contextType) ? '' : RUNTIME_INPUT_VALUE,
            serviceDefinition: {
              spec: {
                variables: []
              }
            }
          })
        }
      }
    })

    return debounceUpdateStage(stageData?.stage)
  }, [selectedStage, debounceUpdateStage, isNewService, scope, contextType])

  //this will default the tab to execution for previously configured stages -- for new stages it will still takes user to service tab only
  const defaultExecTab = (): boolean => {
    if (isEmpty(incompleteTabs) && !(selectedStage?.stage && isEmpty(selectedStage?.stage?.spec?.execution))) {
      return true
    }
    return false
  }

  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && (TabsOrder.includes(sectionId) || sectionId === DeployTabs.ENVIRONMENT)) {
      setSelectedTabId(sectionId)
    } else {
      setSelectedSectionId(defaultExecTab() ? DeployTabs.EXECUTION : DeployTabs.SERVICE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId])

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(DeployTabs.EXECUTION)
    }
  }, [selectedStepId])

  React.useEffect(() => {
    /* istanbul ignore else */
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  const handleTabChange = (nextTab: DeployTabs, checkTabSwitch?: boolean): void => {
    let nextTabIdx = TabsOrder.indexOf(nextTab)
    let currentTabIdx = TabsOrder.indexOf(selectedTabId)
    if (selectedTabId === DeployTabs.ENVIRONMENT) currentTabIdx = TabsOrder.indexOf(DeployTabs.INFRASTRUCTURE)
    if (nextTab === DeployTabs.ENVIRONMENT) nextTabIdx = TabsOrder.indexOf(DeployTabs.INFRASTRUCTURE)

    if (isNewEnvDef && nextTab === DeployTabs.INFRASTRUCTURE) {
      nextTab = DeployTabs.ENVIRONMENT
    }

    if (!!checkTabSwitch && nextTabIdx < currentTabIdx) {
      setSelectedTabId(nextTab)
      setSelectedSectionId(nextTab)
    } else {
      checkErrorsForTab(selectedTabId).then(_ => {
        setSelectedTabId(nextTab)
        setSelectedSectionId(nextTab)
      })
    }
  }

  const selectedDeploymentType = serviceDefinitionType()
  const googleCloudFunctionEnvType = (
    selectedStage?.stage?.spec?.deploymentMetadata as GoogleCloudFunctionDeploymentMetaData
  )?.environmentType

  const isServiceDefinitionPresent = isNewService
    ? (get(selectedStage, 'stage.spec.service') || get(selectedStage, 'stage.spec.services')) && serviceDefinitionType()
    : selectedDeploymentType

  const shouldSelectBasicStrategyType = () => {
    if (
      selectedDeploymentType === ServiceDeploymentType.ServerlessAwsLambda ||
      selectedDeploymentType === ServiceDeploymentType.GoogleCloudFunctions
    ) {
      return true
    }
    return false
  }

  const getStrategyType = (): GetExecutionStrategyYamlQueryParams['strategyType'] => {
    if (isNewService && gitOpsEnabled) {
      return ExecutionType.GITOPS
    } else if (shouldSelectBasicStrategyType()) {
      return ExecutionType.BASIC
    } else if (selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
      return ExecutionType.DEFAULT
    }
    return ExecutionType.ROLLING
  }
  const strategyType = getStrategyType()

  const { data: stageYamlSnippet, loading, refetch } = useGetFailureStrategiesYaml({ lazy: true })

  const { data: yamlSnippet, refetch: refetchYamlSnippet } = useGetExecutionStrategyYaml({
    queryParams: {
      accountIdentifier: accountId,
      serviceDefinitionType: selectedDeploymentType as GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
      strategyType,
      deploymentMetadataYaml: selectedStage?.stage?.spec?.deploymentMetadata
        ? yamlStringify(selectedStage?.stage?.spec?.deploymentMetadata)
        : undefined
    },
    lazy: true
  })

  React.useEffect(() => {
    if (selectedDeploymentType) {
      refetchYamlSnippet()
    }
  }, [selectedDeploymentType, refetchYamlSnippet])

  const fetchDefaultStep =
    isServerlessDeploymentType(selectedDeploymentType) ||
    isCustomDeploymentType(selectedDeploymentType) ||
    (isGoogleCloudFuctionsDeploymentType(selectedDeploymentType) &&
      googleCloudFunctionEnvType === GoogleCloudFunctionsEnvType.GenOne)

  React.useEffect(() => {
    if (
      (fetchDefaultStep || selectedStage?.stage?.spec?.gitOpsEnabled) &&
      yamlSnippet?.data &&
      selectedStage &&
      isEmpty(selectedStage.stage?.spec?.execution)
    ) {
      updateStage(
        produce(selectedStage, draft => {
          if (!draft.stage?.spec?.execution) {
            draft = set(draft, 'stage.spec', { ...draft.stage?.spec, execution: {} })
          }
          const jsonFromYaml = YAML.parse(defaultTo(yamlSnippet?.data, '{}')) as StageElementConfig
          set(draft, 'stage.failureStrategies', jsonFromYaml.failureStrategies)
          set(draft, 'stage.spec.execution', defaultTo(jsonFromYaml.spec?.execution, {}))
        }).stage as StageElementConfig
      )
    }
  }, [yamlSnippet?.data, selectedStage, selectedDeploymentType, updateStage])

  React.useEffect(() => {
    // do the following one if it is a new stage
    if (!loading && selectedStage?.stage && isEmpty(selectedStage?.stage?.spec?.execution)) {
      if (!stageYamlSnippet?.data) {
        // fetch data on first load of new stage
        refetch()
      } else {
        // update the new stage with the fetched data
        updateStage(
          produce(selectedStage?.stage as StageElementConfig, draft => {
            const jsonFromYaml = YAML.parse(defaultTo(stageYamlSnippet?.data, '')) as StageElementConfig
            if (!draft.failureStrategies) {
              draft.failureStrategies = jsonFromYaml.failureStrategies
            }
          })
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageYamlSnippet])

  const validate = React.useCallback(() => {
    try {
      getCDStageValidationSchema(
        getString,
        selectedDeploymentType as GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
        isNewService,
        isNewEnvDef,
        contextType
      ).validateSync(selectedStage?.stage, {
        abortEarly: false,
        context: selectedStage?.stage
      })
      setIncompleteTabs({})
    } catch (error) {
      if (error.name !== 'ValidationError') {
        return
      }
      const response = error.inner.reduce((errors: ValidationError, currentError: ValidationError) => {
        errors = set(errors, currentError.path, currentError.message)
        return errors
      }, {})
      const newIncompleteTabs: { [key in DeployTabs]?: boolean } = {}
      if (!isEmpty(response.name) || !isEmpty(response.identifier) || !isEmpty(response.variables)) {
        newIncompleteTabs[DeployTabs.OVERVIEW] = true
      }
      if ((isNewService && !isEmpty(get(response.spec, 'service'))) || !isEmpty(get(response.spec, 'serviceConfig'))) {
        newIncompleteTabs[DeployTabs.SERVICE] = true
      }
      if (!isEmpty(get(response.spec, 'environment'))) {
        newIncompleteTabs[DeployTabs.ENVIRONMENT] = true
      }
      if (!isEmpty(get(response.spec, 'infrastructure'))) {
        newIncompleteTabs[DeployTabs.INFRASTRUCTURE] = true
      }
      if (!isEmpty(get(response.spec, 'execution'))) {
        newIncompleteTabs[DeployTabs.EXECUTION] = true
      }
      if (!isEmpty(response.failureStrategies)) {
        newIncompleteTabs[DeployTabs.ADVANCED] = true
      }
      setIncompleteTabs(newIncompleteTabs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIncompleteTabs, selectedStage?.stage])

  const shouldShowExecutionStrategies = () => {
    const stageType = selectedStage?.stage?.type
    const openExecutionStrategy = stageType ? stagesMap[stageType].openExecutionStrategy : true

    // When deployment is of type serverless
    const isServerlessDeploymentTypeSelected = isServerlessDeploymentType(selectedDeploymentType)

    // When deployment type is GoogleCloudFunctions
    const isGoogleCloudFunctionsDeploymentTypeSelected = isGoogleCloudFuctionsDeploymentType(selectedDeploymentType)
    const isGoogleCloudFunctionGen1EnvTypeSelected =
      isGoogleCloudFunctionsDeploymentTypeSelected && googleCloudFunctionEnvType === GoogleCloudFunctionsEnvType.GenOne

    // Show executiomn strategies when openExecutionStrategy is true
    // and deployment type is not of type serverless/GoogleCloudFunctions and
    // when gitOpsEnabled is false
    return (
      openExecutionStrategy &&
      !isServerlessDeploymentTypeSelected &&
      !gitOpsEnabled &&
      !isGoogleCloudFunctionGen1EnvTypeSelected
    )
  }

  React.useEffect(() => {
    // if serviceDefinition not selected, redirect to SERVICE - preventing strategies drawer to be opened
    if (!isServiceDefinitionPresent) {
      setSelectedTabId(DeployTabs.SERVICE)
      return
    }
    if (selectedTabId === DeployTabs.EXECUTION) {
      /* istanbul ignore else */
      if (selectedStage?.stage && selectedStage?.stage.type === StageType.DEPLOY) {
        if (!selectedStage?.stage?.spec?.execution) {
          if (shouldShowExecutionStrategies()) {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.ExecutionStrategy,
                hasBackdrop: true
              }
            })
          }
        } else {
          // set default (empty) values
          // NOTE: this cannot be set in advance as data.stage.spec.execution===undefined is a trigger to open ExecutionStrategy for CD stage
          /* istanbul ignore else */
          if (selectedStage?.stage?.spec?.execution) {
            if (!selectedStage.stage.spec.execution.steps) {
              selectedStage.stage.spec.execution.steps = []
            }
            if (!selectedStage.stage.spec.execution.rollbackSteps) {
              selectedStage.stage.spec.execution.rollbackSteps = []
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage, selectedTabId, selectedStageId, selectedDeploymentType])

  React.useEffect(() => {
    if (!isServiceDefinitionPresent) {
      setSelectedTabId(DeployTabs.SERVICE)
    }
    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedStage)])

  const originalStage = selectedStageId
    ? getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId, originalPipeline).stage
    : undefined

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })

  const addLinkedTemplatesLabel = React.useMemo(() => {
    const isCustomDeploymentConfigPresent = !isEmpty(get(selectedStage, 'stage.spec.customDeploymentRef'))
    return isCustomDeploymentConfigPresent ? getString('common.deploymentTemplateSteps') : ''
  }, [selectedStage, getString])

  const navBtns = (
    <Layout.Horizontal className={css.navigationBtns}>
      {selectedTabId !== DeployTabs.OVERVIEW && (
        <Button
          text={getString('back')}
          variation={ButtonVariation.SECONDARY}
          icon="chevron-left"
          onClick={() => {
            let nextTab = TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)]
            if (selectedTabId === DeployTabs.ENVIRONMENT) nextTab = DeployTabs.SERVICE
            setSelectedTabId(nextTab)
            setSelectedSectionId(nextTab)
          }}
        />
      )}
      {selectedTabId !== DeployTabs.ADVANCED && (
        <Button
          text={selectedTabId === DeployTabs.EXECUTION ? getString('save') : getString('continue')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === DeployTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else if (selectedTabId === DeployTabs.ENVIRONMENT) {
              handleTabChange(DeployTabs.EXECUTION)
            } else {
              handleTabChange(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
            }
          }}
        />
      )}
    </Layout.Horizontal>
  )

  return (
    <section ref={layoutRef} key={selectedStageId} className={cx(css.setupShell)}>
      <Tabs
        id="stageSetupShell"
        onChange={(nextTab: DeployTabs) => handleTabChange(nextTab, true)}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={DeployTabs.OVERVIEW}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.OVERVIEW]}>
              <Icon name={incompleteTabs[DeployTabs.OVERVIEW] ? 'cd-main' : iconNames.tick} size={16} />
              {getString('overview')}
            </span>
          }
          data-testid="overview"
        />

        <Tab
          id={DeployTabs.SERVICE}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.SERVICE]}>
              <Icon name={incompleteTabs[DeployTabs.SERVICE] ? 'services' : iconNames.tick} size={16} />
              {getString('service')}
            </span>
          }
          panel={
            isNewService ? (
              <DeployServiceEntitySpecifications setDefaultServiceSchema={setDefaultServiceSchema}>
                {navBtns}
              </DeployServiceEntitySpecifications>
            ) : (
              <DeployServiceSpecifications setDefaultServiceSchema={setDefaultServiceSchema}>
                {navBtns}
              </DeployServiceSpecifications>
            )
          }
          data-testid="service"
        />
        {isNewEnvDef && (
          <Tab
            id={DeployTabs.ENVIRONMENT}
            title={
              <span className={css.title} data-completed={!incompleteTabs[DeployTabs.ENVIRONMENT]}>
                <Icon name={incompleteTabs[DeployTabs.ENVIRONMENT] ? 'infrastructure' : iconNames.tick} size={16} />
                {getString('environment')}
              </span>
            }
            panel={<DeployEnvSpecifications>{navBtns}</DeployEnvSpecifications>}
            data-testid="environment"
          />
        )}
        {(!NG_SVC_ENV_REDESIGN || (NG_SVC_ENV_REDESIGN && !isEmpty(selectedStage?.stage?.spec?.infrastructure))) && (
          <Tab
            id={DeployTabs.INFRASTRUCTURE}
            title={
              <span className={css.title} data-completed={!incompleteTabs[DeployTabs.INFRASTRUCTURE]}>
                <Icon name={incompleteTabs[DeployTabs.INFRASTRUCTURE] ? 'infrastructure' : iconNames.tick} size={16} />
                {getString('infrastructureText')}
              </span>
            }
            panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
            data-testid="infrastructure"
          />
        )}
        <Tab
          id={DeployTabs.EXECUTION}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.EXECUTION]}>
              <Icon name={incompleteTabs[DeployTabs.EXECUTION] ? 'execution' : iconNames.tick} size={16} />
              {getString('executionText')}
            </span>
          }
          className={cx(css.fullHeight, css.stepGroup)}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              isReadonly={isReadonly}
              hasDependencies={false}
              addLinkedTemplatesLabel={addLinkedTemplatesLabel}
              originalStage={originalStage}
              ref={executionRef}
              templateTypes={templateTypes}
              templateIcons={templateIcons}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stage={selectedStage!}
              updateStage={stageData => {
                if (stageData.stage) updateStage(stageData.stage)
              }}
              onAddStep={(event: ExecutionGraphAddStepEvent) => {
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
                          hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                        }
                      }
                    }
                  })
                }
              }}
              onEditStep={(event: ExecutionGraphEditStepEvent) => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.StepConfig,
                    data: {
                      stepConfig: {
                        node: event.node as any,
                        stepsMap: event.stepsMap,
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        isStepGroup: event.isStepGroup,
                        isUnderStepGroup: event.isUnderStepGroup,
                        addOrEdit: event.addOrEdit,
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                      }
                    }
                  }
                })
              }}
              onSelectStep={(stepId: string) => {
                setSelectedStepId(stepId)
              }}
              selectedStepId={selectedStepId}
            />
          }
          data-testid="execution"
        />
        <Tab
          id={DeployTabs.ADVANCED}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.ADVANCED]}>
              <Icon name={incompleteTabs[DeployTabs.ADVANCED] ? 'advanced' : iconNames.tick} size={16} />
              Advanced
            </span>
          }
          className={css.fullHeight}
          panel={<DeployAdvancedSpecifications>{navBtns}</DeployAdvancedSpecifications>}
          data-testid="advanced"
        />
        {isContextTypeNotStageTemplate(contextType) && selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton
              data={selectedStage.stage}
              type={'Stage'}
              gitDetails={gitDetails}
              storeMetadata={storeMetadata}
              buttonProps={{
                margin: { right: 'medium' },
                disabled: !!selectedStage.stage.spec?.serviceConfig?.useFromStage
              }}
            />
          </>
        )}
      </Tabs>
    </section>
  )
}
