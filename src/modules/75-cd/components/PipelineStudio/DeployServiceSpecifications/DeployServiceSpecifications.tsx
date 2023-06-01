/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  AllowedTypes,
  Card,
  Checkbox,
  Container,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text,
  useConfirmationDialog
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import produce from 'immer'
import { debounce, defaultTo, get, isEmpty, noop, set, unset } from 'lodash-es'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ServiceConfig, ServiceDefinition, useGetServiceList } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import PropagateWidget, {
  setupMode
} from '@cd/components/PipelineStudio/DeployServiceSpecifications/PropagateWidget/PropagateWidget'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployServiceSpecifications/SelectDeploymentType/SelectDeploymentType'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { useDeepCompareEffect } from '@common/hooks'
import {
  deleteStageData,
  doesStageContainOtherData,
  getServiceDefinitionType,
  getStepTypeByDeploymentType,
  ServiceDeploymentType,
  StageType
} from '@pipeline/utils/stageHelpers'
import type { StageElementConfig } from 'services/pipeline-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { DeployServiceData } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export interface DeployServiceSpecificationsProps {
  setDefaultServiceSchema: () => Promise<void>
  children: React.ReactNode
  customRef?: React.Ref<HTMLDivElement>
}

export default function DeployServiceSpecifications({
  setDefaultServiceSchema,
  customRef,
  children
}: DeployServiceSpecificationsProps): JSX.Element {
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps & ServicePathProps>()
  const { CDS_PIPELINE_STUDIO_UPGRADES } = useFeatureFlags()
  const {
    state: {
      pipeline,
      templateTypes,
      templateServiceData,
      selectionState: { selectedStageId }
    },
    allowableTypes,
    isReadonly,
    scope,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()

  const domRef = React.useRef<HTMLDivElement | null>(null)
  const scrollRef = customRef || domRef

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const [setupModeType, setSetupMode] = useState('')
  const [checkedItems, setCheckedItems] = useState({
    overrideSetCheckbox: false
  })

  const serviceDefinitionType = useCallback(
    (stageData?: StageElementWrapper<DeploymentStageElementConfig>): ServiceDeploymentType => {
      const data = getServiceDefinitionType(
        stageData,
        getStageFromPipeline,
        isNewServiceEnvEntity,
        false,
        templateServiceData
      ) as ServiceDeploymentType
      return data
    },
    [getStageFromPipeline, templateServiceData]
  )

  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption>()
  const [serviceIdNameMap, setServiceIdNameMap] = useState<{ [key: string]: string }>()
  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>(
    serviceDefinitionType(stage)
  )
  const [previousStageList, setPreviousStageList] = useState<SelectOption[]>([])
  const [currStageData, setCurrStageData] = useState<StageElementWrapper<DeploymentStageElementConfig> | undefined>()

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  const memoizedQueryParam = useMemo(
    () => ({
      accountIdentifier: queryParams.accountId,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier
    }),
    [queryParams]
  )
  const { data: serviceResponse } = useGetServiceList({
    queryParams: memoizedQueryParam
  })

  useEffect(() => {
    if (
      !stage?.stage?.spec?.serviceConfig?.serviceDefinition &&
      !stage?.stage?.spec?.serviceConfig?.useFromStage?.stage &&
      stage?.stage?.type === StageType.DEPLOY
    ) {
      setDefaultServiceSchema()
    } else if (
      scope !== Scope.PROJECT &&
      stage?.stage?.spec?.serviceConfig &&
      isEmpty(stage?.stage?.spec?.serviceConfig?.serviceRef)
    ) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.serviceRef', RUNTIME_INPUT_VALUE)
        }
      })
      if (stageData?.stage) {
        debounceUpdateStage(stageData?.stage)
      }
    }
  }, [])

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.SERVICE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMap])

  useEffect(() => {
    const serviceIdNameMapping: { [key: string]: string } = {}
    serviceResponse?.data?.content?.forEach(service => {
      if (service.service?.identifier) {
        serviceIdNameMapping[service.service?.identifier] = service.service?.name || ''
      }
    })
    setServiceIdNameMap(serviceIdNameMapping)
  }, [serviceResponse])

  useDeepCompareEffect(() => {
    if (stages && stages.length > 0) {
      const newPreviousStageList: SelectOption[] = []
      const currentStageType = stage?.stage?.type
      stages.forEach((item, index) => {
        if (index < stageIndex) {
          if (item.stage?.template) {
            const stageType = get(templateTypes, item.stage.template.templateRef)
            if (currentStageType === stageType) {
              newPreviousStageList.push({
                label: `Stage [${item.stage?.name}] - [Template]`,
                value: item.stage?.identifier || ''
              })
            }
          } else if (
            currentStageType === item?.stage?.type &&
            !get(item.stage, `spec.serviceConfig.useFromStage.stage`)
          ) {
            let serviceName = (item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.service?.name
            if (isEmpty(serviceName) && serviceIdNameMap) {
              serviceName =
                serviceIdNameMap[
                  (item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.serviceRef as string
                ]
            }
            if (isEmpty(serviceName)) {
              serviceName = (item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.serviceRef || ''
            }
            newPreviousStageList.push({
              label: `Stage [${item.stage?.name}] - Service [${serviceName}]`,
              value: item.stage?.identifier || ''
            })
          }
        }
      })
      setPreviousStageList(newPreviousStageList)
    }
  }, [stages, serviceIdNameMap])

  useEffect(() => {
    if (stageIndex === 0) {
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stageIndex])

  useEffect(() => {
    const useFromStage = stage?.stage?.spec?.serviceConfig?.useFromStage
    const stageOverrides = stage?.stage?.spec?.serviceConfig?.stageOverrides

    if (useFromStage) {
      setSetupMode(setupMode.PROPAGATE)
      if (previousStageList && previousStageList.length > 0) {
        const selectedIdentifier = useFromStage?.stage
        const selectedOption = previousStageList.find(v => v.value === selectedIdentifier)
        setSelectedPropagatedState(selectedOption)
        setCheckedItems({
          ...checkedItems,
          overrideSetCheckbox: !!stageOverrides
        })
      }
    } else {
      setSetupMode(setupMode.DIFFERENT)
      setSelectedPropagatedState({
        label: '',
        value: ''
      })
      setCheckedItems({
        ...checkedItems,
        overrideSetCheckbox: !!stageOverrides
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.stage?.spec, previousStageList])

  useEffect(() => {
    if (selectedPropagatedState && selectedPropagatedState.value) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.useFromStage', { stage: selectedPropagatedState.value })
        }
        if (draft?.stage?.spec?.serviceConfig?.serviceDefinition) {
          delete draft.stage.spec.serviceConfig.serviceDefinition
        }
        if (draft?.stage?.spec?.serviceConfig?.serviceRef !== undefined) {
          delete draft.stage.spec.serviceConfig.serviceRef
        }
      })
      debounceUpdateStage(stageData?.stage)
      setSelectedDeploymentType(serviceDefinitionType(stageData))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropagatedState])

  useEffect(() => {
    if (selectedPropagatedState?.value && checkedItems.overrideSetCheckbox) {
      setSelectedDeploymentType(serviceDefinitionType(stage))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropagatedState?.value, checkedItems.overrideSetCheckbox])

  const setStageOverrideSchema = (): Promise<void> => {
    const stageData = produce(stage, draft => {
      if (draft) {
        set(draft, 'stage.spec', {
          ...stage?.stage?.spec,
          serviceConfig: {
            ...stage?.stage?.spec?.serviceConfig,
            stageOverrides: {
              artifacts: {
                sidecars: []
              },
              manifests: [],
              variables: []
            }
          }
        })
      }
      if (draft?.stage?.spec?.serviceConfig?.serviceDefinition) {
        delete draft.stage.spec.serviceConfig.serviceDefinition
      }
    })

    return debounceUpdateStage(stageData?.stage)
  }

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const _isChecked = (event.target as HTMLInputElement).checked
    setCheckedItems({
      ...checkedItems,
      overrideSetCheckbox: _isChecked
    })
    if (_isChecked) {
      setStageOverrideSchema()
    } else {
      const stageData = produce(stage, draft => {
        if (stage?.stage?.spec?.serviceConfig?.stageOverrides) {
          unset(draft?.stage?.spec?.serviceConfig, 'stageOverrides')
        }
      })

      debounceUpdateStage(stageData?.stage)
    }
  }

  const updateService = useCallback(
    async (value: ServiceConfig) => {
      const stageData = produce(stage, draft => {
        const serviceObj = get(draft, 'stage.spec.serviceConfig', {})
        if (value.service) {
          serviceObj.service = value.service
          delete serviceObj.serviceRef
        } else {
          serviceObj.serviceRef = value.serviceRef
          delete serviceObj.service
        }
      })
      await debounceUpdateStage(stageData?.stage)
    },
    [debounceUpdateStage, stage]
  )

  const handleDeploymentTypeChange = useCallback(
    (deploymentType: ServiceDeploymentType): void => {
      if (deploymentType !== selectedDeploymentType) {
        const stageData = produce(stage, draft => {
          const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
          serviceDefinition.type = deploymentType
        })
        if (doesStageContainOtherData(stageData?.stage)) {
          setCurrStageData(stageData)
          openStageDataDeleteWarningDialog()
        } else {
          setSelectedDeploymentType(deploymentType)
          updateStage(stageData?.stage as StageElementConfig)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, updateStage]
  )

  const { openDialog: openStageDataDeleteWarningDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.stageDataDeleteWarningText'),
    titleText: getString('pipeline.stageDataDeleteWarningTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deleteStageData(currStageData?.stage)
        await debounceUpdateStage(currStageData?.stage)
        setSelectedDeploymentType(serviceDefinitionType(currStageData))
      }
    }
  })

  const getBasedServiceRef = React.useCallback(() => {
    const stageObj = get(stage, 'stage.spec', {})
    if (stageObj.serviceConfig) {
      return get(stage, 'stage.spec.serviceConfig.serviceRef', '')
    }
    return ''
  }, [stage])

  const getService = React.useCallback(() => {
    const stageObj = get(stage, 'stage.spec', {})
    if (stageObj.serviceConfig) {
      return get(stage, 'stage.spec.serviceConfig.service', {})
    }
    return ''
  }, [stage])

  const getDeployServiceWidgetInitValues = React.useCallback((): DeployServiceData => {
    return {
      service: getService(),
      serviceRef: scope === Scope.PROJECT ? getBasedServiceRef() : getBasedServiceRef() || RUNTIME_INPUT_VALUE
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={stageCss.deployStage} ref={scrollRef}>
      {!CDS_PIPELINE_STUDIO_UPGRADES && (
        <DeployServiceErrors domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      )}
      <div
        className={cx(stageCss.contentSection, stageCss.paddedSection, {
          [stageCss.paddedSectionNew]: CDS_PIPELINE_STUDIO_UPGRADES
        })}
      >
        {previousStageList.length > 0 && (
          <Container margin={{ bottom: 'xlarge', left: 'xlarge' }}>
            <PropagateWidget
              setupModeType={setupModeType}
              selectedPropagatedState={selectedPropagatedState}
              previousStageList={previousStageList}
              isReadonly={isReadonly}
              setSetupMode={setSetupMode}
              setSelectedPropagatedState={setSelectedPropagatedState}
              initWithServiceDefinition={setDefaultServiceSchema}
            />
            {setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.value && (
              <Container margin={{ top: 'large' }}>
                <Container padding={{ bottom: 'small' }} border={{ bottom: true }}>
                  <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
                    {getString('cd.pipelineSteps.serviceTab.stageOverrides')}
                  </Text>
                </Container>
                <Checkbox
                  color={Color.GREY_500}
                  font={{ weight: 'semi-bold' }}
                  margin={{ top: 'medium' }}
                  label={getString('cd.pipelineSteps.serviceTab.overrideChanges')}
                  checked={checkedItems.overrideSetCheckbox}
                  onChange={handleChange}
                />
              </Container>
            )}
          </Container>
        )}
        {setupModeType === setupMode.DIFFERENT ? (
          <>
            <>
              <div className={stageCss.tabHeading}>{getString('cd.pipelineSteps.serviceTab.aboutYourService')}</div>
              <Card className={stageCss.sectionCard} id="aboutService">
                <StepWidget
                  type={StepType.DeployService}
                  readonly={isReadonly}
                  initialValues={getDeployServiceWidgetInitValues()}
                  allowableTypes={
                    scope === Scope.PROJECT
                      ? allowableTypes
                      : ((allowableTypes as MultiTypeInputType[]).filter(
                          item => item !== MultiTypeInputType.FIXED
                        ) as AllowedTypes)
                  }
                  onUpdate={data => updateService(data)}
                  factory={factory}
                  stepViewType={StepViewType.Edit}
                />
              </Card>
            </>
            <>
              <div className={stageCss.tabHeading} id="serviceDefinition">
                {getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
              </div>
              <SelectDeploymentType
                selectedDeploymentType={selectedDeploymentType}
                viewContext="setup"
                isReadonly={isReadonly}
                handleDeploymentTypeChange={handleDeploymentTypeChange}
                shouldShowGitops={false}
                onDeploymentTemplateSelect={noop}
              />
              <Layout.Horizontal>
                <StepWidget<K8SDirectServiceStep>
                  factory={factory}
                  readonly={isReadonly}
                  initialValues={{
                    stageIndex,
                    setupModeType,
                    deploymentType: selectedDeploymentType as ServiceDefinition['type']
                  }}
                  allowableTypes={allowableTypes}
                  type={getStepTypeByDeploymentType(defaultTo(selectedDeploymentType, ''))}
                  stepViewType={StepViewType.Edit}
                />
              </Layout.Horizontal>
            </>
          </>
        ) : (
          checkedItems.overrideSetCheckbox &&
          selectedPropagatedState?.value && (
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              readonly={isReadonly}
              initialValues={{
                stageIndex,
                setupModeType,
                deploymentType: selectedDeploymentType as ServiceDefinition['type']
              }}
              allowableTypes={allowableTypes}
              type={getStepTypeByDeploymentType(defaultTo(selectedDeploymentType, ''))}
              stepViewType={StepViewType.Edit}
            />
          )
        )}
        {((setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.value) ||
          setupModeType === setupMode.DIFFERENT) && <Container margin={{ top: 'xxlarge' }}>{children}</Container>}
      </div>
    </div>
  )
}
