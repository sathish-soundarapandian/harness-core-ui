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
  Container,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import produce from 'immer'
import { debounce, defaultTo, get, isEmpty, noop, set, unset } from 'lodash-es'
import { Divider } from '@blueprintjs/core'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  NGServiceConfig,
  ServiceConfig,
  ServiceDefinition,
  ServiceResponseDTO,
  StageElementConfig,
  useGetRuntimeInputsServiceEntity,
  useGetServiceV2
} from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import {
  DeployTabs,
  getServiceEntityServiceRef
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployServiceSpecifications/SelectDeploymentType'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getStepTypeByDeploymentType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { Scope } from '@common/interfaces/SecretsInterface'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { DeployServiceData } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceInterface'
import { useCache } from '@common/hooks/useCache'
import type { ServiceInputsConfig } from '@pipeline/utils/DeployStageInterface'
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import PropagateFromServiceV2 from './PropagateWidget/PropagateFromServiceV2'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export interface DeployServiceEntitySpecificationsProps {
  children: React.ReactNode
}

export default function DeployServiceEntitySpecifications({
  children
}: DeployServiceEntitySpecificationsProps): JSX.Element {
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps & ServicePathProps>()

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
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )
  const { stages } = getFlattenedStages(pipeline)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const getDeploymentType = (): ServiceDeploymentType => {
    return get(stage, 'stage.spec.deploymentType')
  }
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()
  const { setCache } = useCache()

  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>(
    getDeploymentType()
  )
  const [gitOpsEnabled, setGitOpsEnabled] = useState(false)
  const [isReadonlyView, setIsReadOnlyView] = useState(false)
  const [setupModeType, setSetupMode] = useState(
    isEmpty(stage?.stage?.spec?.service?.useFromStage) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  const getStagesAllowedforPropogate = useCallback(
    (stageItem): boolean => {
      const currentStageType = stage?.stage?.type
      const currentStageDeploymentType = stage?.stage?.spec?.deploymentType
      if (stageItem.stage.template) {
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        const deploymentType = get(templateServiceData, stageItem.stage.template.templateRef)
        return (
          !isEmpty(stageItem.stage.template.templateRef) &&
          currentStageType === stageType &&
          deploymentType === currentStageDeploymentType
        )
      } else {
        return (
          !isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef) &&
          currentStageType === stageItem?.stage?.type &&
          (stageItem.stage as DeploymentStageElementConfig)?.spec?.deploymentType === currentStageDeploymentType
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const previousStageList = useMemo(() => {
    if (stages.length && stageIndex > 0) {
      //stage allowed for use from stage should have service V2 services and the deployment type, stage type should be same as current stage
      const stagewithServiceV2 = stages.slice(0, stageIndex).filter(getStagesAllowedforPropogate)
      return stagewithServiceV2.map(stageItem => {
        if (stageItem.stage?.template) {
          return {
            label: `Stage [${stageItem.stage?.name}] - [Template]`,
            value: stageItem.stage?.identifier || ''
          }
        } else if (!get(stageItem.stage, `spec.serviceConfig.useFromStage`)) {
          const defaultService = (stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef
          return {
            label: `Stage [${stageItem.stage?.name}] - Service [${defaultService}]`,
            value: stageItem.stage?.identifier
          }
        }
      })
    }
  }, [getStagesAllowedforPropogate, stageIndex, stages])

  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    previousStageList?.find(v => v?.value === stage?.stage?.spec?.service?.useFromStage?.stage) as SelectOption
  )

  const memoizedQueryParam = useMemo(
    () => ({
      accountIdentifier: queryParams.accountId,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier
    }),
    [queryParams]
  )

  const { data: selectedServiceResponse, refetch: refetchServiceData } = useGetServiceV2({
    serviceIdentifier: '',
    queryParams: memoizedQueryParam,
    lazy: true
  })
  const { data: serviceInputsResponse, refetch: refetchServiceInputs } = useGetRuntimeInputsServiceEntity({
    serviceIdentifier: '',
    queryParams: memoizedQueryParam,
    lazy: true
  })

  useEffect(() => {
    //When service.serviceRef is present refetch serviceAPI to populate deployment type and service definition
    if (getServiceEntityServiceRef(stage?.stage)) {
      const stageServiceRef = stage?.stage?.spec?.service?.serviceRef
      if (!isEmpty(stageServiceRef)) {
        const params = {
          pathParams: {
            serviceIdentifier: stageServiceRef
          },
          queryParams: memoizedQueryParam
        }
        Promise.all([
          refetchServiceData({
            ...params
          }),
          refetchServiceInputs({
            ...params
          })
        ])
      } else {
        if (
          scope !== Scope.PROJECT &&
          stage?.stage?.spec?.service &&
          isEmpty(stage?.stage?.spec?.service?.serviceRef)
        ) {
          const stageData = produce(stage, draft => {
            if (draft) {
              set(draft, 'stage.spec.service.serviceRef', RUNTIME_INPUT_VALUE)
            }
          })
          if (stageData?.stage) {
            debounceUpdateStage(stageData?.stage)
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //This is to refetch the service API and update stage on change of service from service select
  useEffect(() => {
    const serviceData = selectedServiceResponse?.data?.service as ServiceResponseDTO
    //serviceInputsData is the runtime data for service inputs
    const serviceInputsData = serviceInputsResponse?.data?.inputSetTemplateYaml

    if (!isEmpty(serviceData?.yaml) && serviceInputsResponse?.data) {
      const serviceInputSetResponse = yamlParse(defaultTo(serviceInputsData, ''))
      const parsedYaml = yamlParse<NGServiceConfig>(defaultTo(serviceData.yaml, ''))
      const serviceInfo = parsedYaml.service?.serviceDefinition
      if (serviceInfo) {
        const stageData = produce(stage, draft => {
          if (draft) {
            set(draft, 'stage.spec.service.serviceRef', parsedYaml.service?.identifier)

            if ((serviceInputSetResponse as ServiceInputsConfig)?.serviceInputs) {
              set(
                draft,
                'stage.spec.service.serviceInputs',
                (serviceInputSetResponse as ServiceInputsConfig)?.serviceInputs
              )
            } else {
              unset(draft, 'stage.spec.service.serviceInputs')
            }
          }
        })
        if (stageData?.stage) {
          debounceUpdateStage(stageData?.stage)
        }
        //setting service data in cache to reuse it in manifests, artifacts, variables
        const serviceCacheId = `${pipeline.identifier}-${selectedStageId}-service`
        setCache(serviceCacheId, serviceInfo)

        setSelectedDeploymentType(serviceInfo.type as ServiceDeploymentType)
        setGitOpsEnabled(!!parsedYaml.service?.gitOpsEnabled)
        setIsReadOnlyView(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceResponse, serviceInputsResponse])

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.SERVICE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMap])

  const updateService = useCallback(
    async (value: ServiceConfig) => {
      const isPropogatedFromStage = !isEmpty(get(stage, 'stage.spec.service.useFromStage'))
      const stageData = produce(stage, draft => {
        if (draft) {
          if (isPropogatedFromStage) {
            unset(draft, 'stage.spec.service.useFromStage')
          }
          if (value.service) {
            set(draft, 'stage.spec.service.service', value.service)
            unset(draft, 'stage.spec.service.serviceRef')
          } else {
            set(draft, 'stage.spec.service.serviceRef', value.serviceRef)
            unset(draft, 'stage.spec.service.service')
            if (getMultiTypeFromValue(value.serviceRef) === MultiTypeInputType.EXPRESSION) {
              unset(draft, 'stage.spec.service.serviceInputs')
            } else if (getMultiTypeFromValue(value.serviceRef) === MultiTypeInputType.RUNTIME) {
              set(draft, 'stage.spec.service.serviceInputs', RUNTIME_INPUT_VALUE)
            }
          }
        }
      })
      await debounceUpdateStage(stageData?.stage)

      if (value.serviceRef && getMultiTypeFromValue(value.serviceRef) === MultiTypeInputType.FIXED) {
        const params = {
          pathParams: {
            serviceIdentifier: value.serviceRef
          },
          queryParams: memoizedQueryParam
        }
        Promise.all([
          refetchServiceData({
            ...params
          }),
          refetchServiceInputs({
            ...params
          })
        ])
      } else {
        setIsReadOnlyView(false)
      }
    },
    [debounceUpdateStage, memoizedQueryParam, refetchServiceData, refetchServiceInputs, stage]
  )

  const getDeployServiceWidgetInitValues = useCallback((): DeployServiceData => {
    const serviceRef = get(stage, 'stage.spec.service.serviceRef')
    return {
      service: get(stage, 'stage.spec.service.service', ''),
      isNewServiceEntity: true,
      serviceRef: scope === Scope.PROJECT ? defaultTo(serviceRef, '') : defaultTo(serviceRef, RUNTIME_INPUT_VALUE),
      deploymentType: stage?.stage?.spec?.deploymentType as ServiceDeploymentType,
      gitOpsEnabled: defaultTo(stage?.stage?.spec?.gitOpsEnabled, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPropogatedStageSelect = useCallback(
    (value: SelectOption): void => {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.service', { useFromStage: { stage: value.value } })
        }
      })
      debounceUpdateStage(stageData?.stage)
      setSelectedPropagatedState(value)
    },
    [debounceUpdateStage, stage]
  )
  const onStageServiceChange = useCallback(
    (mode: string): void => {
      if (!isReadonly) {
        setSetupMode(mode)
        setIsReadOnlyView(false)
        setSelectedPropagatedState('')
      }
    },
    [isReadonly]
  )

  return (
    <div className={stageCss.deployStage} ref={scrollRef}>
      <DeployServiceErrors domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={cx(stageCss.contentSection, stageCss.paddedSection)}>
        {!!previousStageList?.length && (
          <Container margin={{ bottom: 'xlarge', left: 'xlarge' }}>
            <PropagateFromServiceV2
              setupModeType={setupModeType}
              selectedPropagatedState={selectedPropagatedState}
              previousStageList={previousStageList as SelectOption[]}
              isReadonly={isReadonly}
              onStageServiceChange={onStageServiceChange}
              onPropogatedStageSelect={onPropogatedStageSelect}
            />
          </Container>
        )}
        {setupModeType === setupMode.DIFFERENT && (
          <>
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

            {isReadonlyView && (
              <>
                <Divider className={stageCss.divider} />
                <div className={stageCss.tabHeading} id="serviceDefinition">
                  {getString('pipelineSteps.deploy.serviceSpecifications.serviceDefinition')}
                </div>
                <SelectDeploymentType
                  selectedDeploymentType={selectedDeploymentType}
                  viewContext="setup"
                  isReadonly={isReadonly || isReadonlyView}
                  handleDeploymentTypeChange={noop}
                  shouldShowGitops={true}
                  gitOpsEnabled={gitOpsEnabled}
                />
                <Layout.Horizontal>
                  <StepWidget<K8SDirectServiceStep>
                    factory={factory}
                    readonly={isReadonly || isReadonlyView}
                    initialValues={{
                      stageIndex,
                      setupModeType: setupMode.DIFFERENT,
                      deploymentType: selectedDeploymentType as ServiceDefinition['type'],
                      isReadonlyServiceMode: isReadonlyView
                    }}
                    allowableTypes={allowableTypes}
                    type={getStepTypeByDeploymentType(defaultTo(selectedDeploymentType, ''))}
                    stepViewType={StepViewType.Edit}
                  />
                </Layout.Horizontal>
              </>
            )}
          </>
        )}
        <Container margin={{ top: 'xxlarge' }}>{children}</Container>
      </div>
    </div>
  )
}
