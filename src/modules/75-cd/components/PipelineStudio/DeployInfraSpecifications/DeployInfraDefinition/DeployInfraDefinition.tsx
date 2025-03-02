/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import YAML from 'yaml'
import {
  Accordion,
  AllowedTypes,
  Card,
  Container,
  HarnessDocTooltip,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  Text
} from '@harness/uicore'
import { debounce, defaultTo, get, isEmpty, isNil, omit, set } from 'lodash-es'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getProvisionerExecutionStrategyYamlPromise,
  Infrastructure,
  K8sAzureInfrastructure,
  AzureWebAppInfrastructure,
  K8SDirectInfrastructure,
  K8sGcpInfrastructure,
  PdcInfrastructure,
  PipelineInfrastructure,
  StageElementConfig,
  EcsInfrastructure,
  GetExecutionStrategyYamlQueryParams,
  SshWinRmAwsInfrastructure,
  CustomDeploymentInfrastructure,
  ElastigroupInfrastructure,
  TanzuApplicationServiceInfrastructure,
  AsgInfrastructure,
  ServiceDefinition
} from 'services/cd-ng'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  InfraProvisioningData,
  ProvisionersOptions
} from '@cd/components/PipelineSteps/InfraProvisioning/InfraProvisioning'
import type { GcpInfrastructureSpec } from '@cd/components/PipelineSteps/GcpInfrastructureSpec/GcpInfrastructureSpec'
import type { PDCInfrastructureSpec } from '@cd/components/PipelineSteps/PDCInfrastructureSpec/PDCInfrastructureSpec'
import type { SshWinRmAwsInfrastructureSpec } from '@cd/components/PipelineSteps/SshWinRmAwsInfrastructureSpec/SshWinRmAwsInfrastructureSpec'
import type { SshWinRmAzureInfrastructureSpec } from '@cd/components/PipelineSteps/SshWinRmAzureInfrastructureSpec/SshWinRmAzureInfrastructureSpec'
import { useStrings } from 'framework/strings'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { InfraDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import SelectInfrastructureType from '@cd/components/PipelineStudio/DeployInfraSpecifications/SelectInfrastructureType/SelectInfrastructureType'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { AzureInfrastructureSpec } from '@cd/components/PipelineSteps/AzureInfrastructureStep/AzureInfrastructureStep'
import type { AzureWebAppInfrastructureSpec } from '@cd/components/PipelineSteps/AzureWebAppInfrastructureStep/AzureWebAppInfrastructureStep'
import {
  detailsHeaderName,
  getCustomStepProps,
  isServerlessDeploymentType,
  isAzureWebAppDeploymentType,
  ServerlessInfraTypes,
  StageType,
  getServiceDefinitionType,
  isElastigroupDeploymentType
} from '@pipeline/utils/stageHelpers'
import type { ServerlessAwsLambdaInfraSpec } from '@cd/components/PipelineSteps/ServerlessAwsLambdaInfraSpec/ServerlessAwsLambdaInfraSpec'
import type { ServerlessGCPSpec } from '@cd/components/PipelineSteps/ServerlessGCP/ServerlessGCPSpec'
import type { ServerlessAzureSpec } from '@cd/components/PipelineSteps/ServerlessAzure/ServerlessAzureSpec'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isNewServiceEnvEntity } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type { ECSInfraSpec } from '@cd/components/PipelineSteps/ECSInfraSpec/ECSInfraSpec'
import type { CustomDeploymentInfrastructureSpec } from '@cd/components/PipelineSteps/CustomDeploymentInfrastructureSpec/CustomDeploymentInfrastructureStep'
import type { ElastigroupInfrastructureSpec } from '@cd/components/PipelineSteps/ElastigroupInfraSpec/ElastigroupInfraSpec'
import type { TASInfrastructureSpec } from '@cd/components/PipelineSteps/TASInfrastructureStep/TASInfrastructureStep'
import type { AsgInfraSpec } from '@cd/components/PipelineSteps/AsgInfraSpec/AsgInfraSpec'
import type {
  GoogleCloudFunctionInfrastructure,
  GoogleCloudFunctionInfraSpec
} from '@cd/components/PipelineSteps/GoogleCloudFunction/GoogleCloudFunctionInfraSpec/GoogleCloudFunctionInfraSpec'
import type { AwsLambdaInfraSpec } from '@cd/components/PipelineSteps/AwsLambda/AwsLambdaInfraSpec/AwsLambdaInfraSpec'
import type { K8sAwsInfrastructureSpec } from '@cd/components/PipelineSteps/K8sAwsInfrastructureSpec/K8sAwsInfrastructureSpec'
import {
  cleanUpEmptyProvisioner,
  getInfraDefinitionDetailsHeaderTooltipId,
  getInfraDefinitionMethodTooltipId,
  getInfraGroups,
  getInfrastructureDefaultValue,
  InfrastructureGroup,
  isAsgDeploymentInfrastructureType,
  isAzureWebAppInfrastructureType,
  isCustomDeploymentInfrastructureType,
  isElastigroupInfrastructureType,
  isPDCDeploymentInfrastructureType,
  isServerlessInfrastructureType,
  isTASInfrastructureType
} from '../deployInfraHelper'
import stageCss from '../../DeployStageSetupShell/DeployStage.module.scss'

export const deploymentTypeInfraTypeMap: Record<ServiceDefinition['type'], InfraDeploymentType> = {
  Kubernetes: InfraDeploymentType.KubernetesDirect,
  NativeHelm: InfraDeploymentType.KubernetesDirect,
  WinRm: InfraDeploymentType.KubernetesDirect,
  Ssh: InfraDeploymentType.KubernetesDirect,
  ServerlessAwsLambda: InfraDeploymentType.ServerlessAwsLambda,
  AzureWebApp: InfraDeploymentType.AzureWebApp,
  ECS: InfraDeploymentType.ECS,
  Asg: InfraDeploymentType.Asg,
  CustomDeployment: InfraDeploymentType.CustomDeployment,
  Elastigroup: InfraDeploymentType.Elastigroup,
  TAS: InfraDeploymentType.TAS,
  GoogleCloudFunctions: InfraDeploymentType.GoogleCloudFunctions,
  AwsLambda: InfraDeploymentType.AwsLambda,
  AWS_SAM: InfraDeploymentType.AwsSam
}

export interface DeployInfraDefinitionProps {
  selectedInfrastructure?: string
}

type InfraTypes =
  | K8SDirectInfrastructure
  | K8sGcpInfrastructure
  | ServerlessInfraTypes
  | K8sAzureInfrastructure
  | PdcInfrastructure
  | SshWinRmAwsInfrastructure
  | AzureWebAppInfrastructure
  | EcsInfrastructure
  | CustomDeploymentInfrastructure
  | ElastigroupInfrastructure
  | TanzuApplicationServiceInfrastructure
  | AsgInfrastructure
  | GoogleCloudFunctionInfrastructure

export default function DeployInfraDefinition(props: React.PropsWithChildren<DeployInfraDefinitionProps>): JSX.Element {
  const [initialInfrastructureDefinitionValues, setInitialInfrastructureDefinitionValues] =
    React.useState<Infrastructure>({})

  const { getString } = useStrings()

  const {
    state: {
      originalPipeline,
      selectionState: { selectedStageId },
      templateServiceData
    },
    allowableTypes,
    isReadonly,
    scope,
    getStageFromPipeline,
    updateStage,
    contextType
  } = usePipelineContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = React.useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* instanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )

  const { NG_SVC_ENV_REDESIGN: isSvcEnvEnabled } = useFeatureFlags()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const { accountId } = useParams<{
    accountId: string
  }>()

  const [selectedInfrastructureType, setSelectedInfrastructureType] = React.useState<string | undefined>()

  const [selectedDeploymentType, setSelectedDeploymentType] = React.useState<
    GetExecutionStrategyYamlQueryParams['serviceDefinitionType']
  >(
    getServiceDefinitionType(stage, getStageFromPipeline, isNewServiceEnvEntity, !!isSvcEnvEnabled, templateServiceData)
  )

  const [infraGroups, setInfraGroups] = React.useState<InfrastructureGroup[]>(
    getInfraGroups(selectedDeploymentType, getString, !!isSvcEnvEnabled)
  )

  useEffect(() => {
    if (isEmpty(stage?.stage?.spec?.infrastructure) && stage?.stage?.type === StageType.DEPLOY) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec', {
            ...stage.stage?.spec,
            infrastructure: {
              environmentRef: scope === Scope.PROJECT ? '' : RUNTIME_INPUT_VALUE,
              infrastructureDefinition: {},
              allowSimultaneousDeployments: false
            }
          })
        }
      })
      debounceUpdateStage(stageData?.stage)
    } else if (
      scope !== Scope.PROJECT &&
      stage?.stage?.spec?.infrastructure &&
      isEmpty(stage?.stage?.spec?.infrastructure?.environmentRef)
    ) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.infrastructure.environmentRef', RUNTIME_INPUT_VALUE)
        }
      })
      if (stageData?.stage) {
        debounceUpdateStage(stageData?.stage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stageRef = React.useRef(stage)
  stageRef.current = stage

  const resetInfrastructureDefinition = (type?: string): void => {
    const stageData = produce(stage, draft => {
      const spec = get(draft, 'stage.spec', {})
      spec.infrastructure = {
        ...spec.infrastructure,
        infrastructureDefinition: {}
      }

      if (type) {
        spec.infrastructure.infrastructureDefinition.type = type
      }
    })

    const initialInfraDefValues = getInfrastructureDefaultValue(stageData, type)
    setInitialInfrastructureDefinitionValues(initialInfraDefValues)

    debounceUpdateStage(stageData?.stage)
    setProvisionerEnabled(false)
  }

  React.useEffect(() => {
    const newDeploymentType = getServiceDefinitionType(
      stage,
      getStageFromPipeline,
      isNewServiceEnvEntity,
      !!isSvcEnvEnabled,
      templateServiceData
    )

    // This is used to not consider the value on infradefinition.type when switching between deployment types
    let infraReset = false
    if (newDeploymentType !== selectedDeploymentType) {
      setSelectedDeploymentType(newDeploymentType)
      infraReset = true
    }

    const initialInfraGroups = getInfraGroups(newDeploymentType, getString, !!isSvcEnvEnabled)

    const filteredInfraGroups = initialInfraGroups.map(group => ({
      ...group,
      items: group.items.filter(item => !item.disabled)
    }))

    const infrastructureType =
      (!infraReset && stage?.stage?.spec?.infrastructure?.infrastructureDefinition?.type) ||
      (filteredInfraGroups.length > 1 || filteredInfraGroups[0].items.length > 1
        ? undefined
        : deploymentTypeInfraTypeMap[newDeploymentType])

    setSelectedInfrastructureType(infrastructureType)
    setInfraGroups(getInfraGroups(newDeploymentType, getString, !!isSvcEnvEnabled))

    const initialInfraDefValues = getInfrastructureDefaultValue(stage, infrastructureType)
    setInitialInfrastructureDefinitionValues(initialInfraDefValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  React.useEffect(() => {
    // explicitly setting infraDefinition.type as variables prepoluated from template
    if (selectedDeploymentType === InfraDeploymentType.CustomDeployment) {
      const stageData = produce(stage, draft => {
        !!draft && set(draft, 'stage.spec.infrastructure.infrastructureDefinition.type', selectedDeploymentType)
      })
      debounceUpdateStage(stageData?.stage)
      const initialInfraDefValues = getInfrastructureDefaultValue(stageData, selectedDeploymentType)
      setInitialInfrastructureDefinitionValues(initialInfraDefValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeploymentType])

  const onUpdateInfrastructureDefinition = (extendedSpec: InfraTypes, type: string): void => {
    if (get(stageRef.current, 'stage.spec.infrastructure', null)) {
      const stageData = produce(stageRef.current, draft => {
        const infrastructure = get(draft, 'stage.spec.infrastructure', null)
        infrastructure.infrastructureDefinition = {
          ...infrastructure.infrastructureDefinition,
          type,
          spec: omit(extendedSpec, 'allowSimultaneousDeployments')
        }
        infrastructure.allowSimultaneousDeployments = extendedSpec.allowSimultaneousDeployments ?? false
      })
      debounceUpdateStage(stageData?.stage)
    }
  }

  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(false)
  const [provisionerSnippetLoading, setProvisionerSnippetLoading] = useState<boolean>(false)
  const [provisionerType, setProvisionerType] = useState<ProvisionersOptions>('TERRAFORM')

  const isProvisionerEmpty = (stageData: StageElementWrapper): boolean => {
    const provisionerData = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    return isEmpty(provisionerData?.steps) && isEmpty(provisionerData?.rollbackSteps)
  }

  // load and apply provisioner snippet to the stage
  useEffect(() => {
    if (stage && isProvisionerEmpty(stage) && provisionerEnabled) {
      setProvisionerSnippetLoading(true)
      getProvisionerExecutionStrategyYamlPromise({
        // eslint-disable-next-line
        // @ts-ignore
        queryParams: { provisionerType: provisionerType, routingId: accountId }
      }).then(res => {
        const provisionerSnippet = YAML.parse(defaultTo(res?.data, ''))
        if (stage && isProvisionerEmpty(stage) && provisionerSnippet) {
          const stageData = produce(stage, draft => {
            set(draft, 'stage.spec.infrastructure.infrastructureDefinition.provisioner', provisionerSnippet.provisioner)
          })

          if (stageData.stage) {
            updateStage(stageData.stage).then(() => {
              setProvisionerSnippetLoading(false)
            })
          }
        }
      })
    }
  }, [provisionerEnabled])

  useEffect(() => {
    setProvisionerEnabled(!isProvisionerEmpty(defaultTo(stage, {} as StageElementWrapper)))

    return () => {
      let isChanged
      const stageData = produce(stage, draft => {
        isChanged = cleanUpEmptyProvisioner(draft)
      })

      if (stageData?.stage && isChanged) {
        updateStage(stageData?.stage)
      }
    }
  }, [])

  const getProvisionerData = (stageData: StageElementWrapper): InfraProvisioningData => {
    let provisioner = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    let originalProvisioner: InfraProvisioningData['originalProvisioner'] = undefined
    if (selectedStageId) {
      const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
      originalProvisioner = get(originalStage, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    }

    provisioner = isNil(provisioner) ? {} : { ...provisioner }

    if (isNil(provisioner.steps)) {
      provisioner.steps = []
    }
    if (isNil(provisioner.rollbackSteps)) {
      provisioner.rollbackSteps = []
    }

    return {
      provisioner: { ...provisioner },
      provisionerEnabled,
      provisionerSnippetLoading,
      originalProvisioner: { ...originalProvisioner }
    }
  }

  const customDeploymentStepKey = useMemo(() => {
    const { templateRef, versionLabel } = initialInfrastructureDefinitionValues?.customDeploymentRef ?? {}

    if (!templateRef || !versionLabel) return undefined
    return `${templateRef}-${versionLabel}`
  }, [initialInfrastructureDefinitionValues?.customDeploymentRef])

  const getClusterConfigurationStep = (type: string): React.ReactElement => {
    if (!stage?.stage) {
      return <div>Undefined deployment type</div>
    }
    switch (type) {
      case InfraDeploymentType.KubernetesDirect: {
        return (
          <StepWidget<K8SDirectInfrastructure>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as K8SDirectInfrastructure}
            type={StepType.KubernetesDirect}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.KubernetesDirect
              )
            }
          />
        )
      }
      case InfraDeploymentType.KubernetesGcp: {
        return (
          <StepWidget<GcpInfrastructureSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as GcpInfrastructureSpec}
            type={StepType.KubernetesGcp}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  cluster: value.cluster,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.KubernetesGcp
              )
            }
          />
        )
      }
      case InfraDeploymentType.KubernetesAws: {
        return (
          <StepWidget<K8sAwsInfrastructureSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as K8sAwsInfrastructureSpec}
            type={StepType.KubernetesAws}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  cluster: value.cluster,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.KubernetesAws
              )
            }
          />
        )
      }

      case InfraDeploymentType.KubernetesAzure: {
        return (
          <StepWidget<AzureInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as AzureInfrastructureSpec}
            type={StepType.KubernetesAzure}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  subscriptionId: value.subscriptionId,
                  resourceGroup: value.resourceGroup,
                  cluster: value.cluster,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.KubernetesAzure
              )
            }
          />
        )
      }
      case InfraDeploymentType.AzureWebApp: {
        return (
          <StepWidget<AzureWebAppInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as AzureWebAppInfrastructureSpec}
            type={StepType.AzureWebApp}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  subscriptionId: value.subscriptionId,
                  resourceGroup: value.resourceGroup,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.AzureWebApp
              )
            }
          />
        )
      }
      case InfraDeploymentType.ServerlessAwsLambda: {
        return (
          <StepWidget<ServerlessAwsLambdaInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as ServerlessAwsLambdaInfraSpec}
            type={StepType.ServerlessAwsInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  stage: value.stage,
                  region: value.region,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.ServerlessAwsLambda
              )
            }
            customStepProps={getCustomStepProps('ServerlessAwsLambda', getString)}
          />
        )
      }
      case InfraDeploymentType.ServerlessGoogleFunctions: {
        return (
          <StepWidget<ServerlessGCPSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as ServerlessGCPSpec}
            type={StepType.ServerlessGCP}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  stage: value.stage,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.ServerlessGoogleFunctions
              )
            }
            customStepProps={getCustomStepProps('ServerlessGoogleFunctions', getString)}
          />
        )
      }
      case InfraDeploymentType.ServerlessAzureFunctions: {
        return (
          <StepWidget<ServerlessAzureSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as ServerlessAzureSpec}
            type={StepType.ServerlessAzure}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  stage: value.stage,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.ServerlessAzureFunctions
              )
            }
            customStepProps={getCustomStepProps('ServerlessAzureFunctions', getString)}
          />
        )
      }
      case InfraDeploymentType.PDC: {
        return (
          <StepWidget<PDCInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as PDCInfrastructureSpec}
            type={StepType.PDC}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value => {
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef?.connector?.identifier || value.connectorRef,
                  credentialsRef: value.credentialsRef,
                  hostFilter: value.hostFilter,
                  hosts: value.hosts,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  delegateSelectors: value.delegateSelectors,
                  hostAttributes: value.hostAttributes,
                  hostObjectArray: value.hostObjectArray,
                  provisioner: value?.provisioner || undefined,
                  hostArrayPath: value?.hostArrayPath
                },
                InfraDeploymentType.PDC
              )
            }}
          />
        )
      }
      case InfraDeploymentType.SshWinRmAws: {
        return (
          <StepWidget<SshWinRmAwsInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as SshWinRmAwsInfrastructureSpec}
            type={StepType.SshWinRmAws}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value => {
              onUpdateInfrastructureDefinition(
                {
                  credentialsRef: value.credentialsRef,
                  connectorRef: value.connectorRef,
                  region: value.region,
                  awsInstanceFilter: value.awsInstanceFilter,
                  hostConnectionType: value.hostConnectionType,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.SshWinRmAws
              )
            }}
          />
        )
      }
      case InfraDeploymentType.SshWinRmAzure: {
        return (
          <StepWidget<SshWinRmAzureInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as SshWinRmAzureInfrastructureSpec}
            type={StepType.SshWinRmAzure}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value => {
              onUpdateInfrastructureDefinition(
                {
                  credentialsRef: value.credentialsRef,
                  connectorRef: value.connectorRef,
                  subscriptionId: value.subscriptionId,
                  resourceGroup: value.resourceGroup,
                  tags: value.tags,
                  hostConnectionType: value.hostConnectionType,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.SshWinRmAzure
              )
            }}
          />
        )
      }
      case InfraDeploymentType.ECS: {
        return (
          <StepWidget<ECSInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as ECSInfraSpec}
            type={StepType.EcsInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  region: value.region,
                  cluster: value.cluster,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner || undefined
                },
                InfraDeploymentType.ECS
              )
            }
          />
        )
      }
      case InfraDeploymentType.Asg: {
        return (
          <StepWidget<AsgInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as AsgInfraSpec}
            type={StepType.AsgInfraSpec}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  region: value.region,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.Asg
              )
            }
          />
        )
      }
      case InfraDeploymentType.CustomDeployment: {
        return (
          <StepWidget<CustomDeploymentInfrastructureSpec>
            factory={factory}
            key={customDeploymentStepKey}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as CustomDeploymentInfrastructureSpec}
            type={StepType.CustomDeployment}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  customDeploymentRef: value.customDeploymentRef,
                  variables: value.variables,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments
                },
                InfraDeploymentType.CustomDeployment
              )
            }
          />
        )
      }
      case InfraDeploymentType.Elastigroup: {
        return (
          <StepWidget<ElastigroupInfrastructureSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as ElastigroupInfrastructureSpec}
            type={StepType.Elastigroup}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  configuration: value.configuration,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.Elastigroup
              )
            }
          />
        )
      }
      case InfraDeploymentType.TAS: {
        return (
          <StepWidget<TASInfrastructureSpec>
            factory={factory}
            key={stage?.stage?.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as TASInfrastructureSpec}
            type={StepType.TasInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  organization: value.organization,
                  space: value.space,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.TAS
              )
            }
          />
        )
      }
      case InfraDeploymentType.GoogleCloudFunctions: {
        return (
          <StepWidget<GoogleCloudFunctionInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as GoogleCloudFunctionInfraSpec}
            type={StepType.GoogleCloudFunctionsInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  project: value.project,
                  region: value.region,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.GoogleCloudFunctions
              )
            }
          />
        )
      }
      case InfraDeploymentType.AwsLambda: {
        return (
          <StepWidget<AwsLambdaInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as AwsLambdaInfraSpec}
            type={StepType.AwsLambdaInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  region: value.region,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  provisioner: value?.provisioner
                },
                InfraDeploymentType.AwsLambda
              )
            }
          />
        )
      }
      case InfraDeploymentType.AwsSam: {
        return (
          <StepWidget<AwsLambdaInfraSpec>
            factory={factory}
            key={stage.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as AwsLambdaInfraSpec}
            type={StepType.AwsSamInfra}
            stepViewType={StepViewType.Edit}
            allowableTypes={allowableTypes}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  region: value.region,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments
                },
                InfraDeploymentType.AwsSam
              )
            }
          />
        )
      }
      default: {
        return <div>{getString('cd.steps.common.undefinedType')}</div>
      }
    }
  }

  const updateEnvStep = React.useCallback(
    (value: PipelineInfrastructure) => {
      const stageData = produce(stage, draft => {
        const infraObj: PipelineInfrastructure = get(draft, 'stage.spec.infrastructure', {})
        if (value.environment?.identifier) {
          infraObj.environment = value.environment
          delete infraObj.environmentRef
        } else {
          infraObj.environmentRef = value.environmentRef
          delete infraObj.environment
        }
      })
      debounceUpdateStage(stageData?.stage)
    },
    [stage, debounceUpdateStage, stage?.stage?.spec?.infrastructure?.infrastructureDefinition]
  )

  return (
    <>
      {contextType !== PipelineContextType.Standalone && (
        <>
          <div className={stageCss.tabHeading} id="environment">
            {getString('environment')}
          </div>
          <Card className={stageCss.sectionCard}>
            <StepWidget
              type={StepType.DeployEnvironment}
              readonly={isReadonly}
              initialValues={{
                environment: get(stage, 'stage.spec.infrastructure.environment', {}),
                environmentRef:
                  scope === Scope.PROJECT
                    ? get(stage, 'stage.spec.infrastructure.environmentRef', '')
                    : get(stage, 'stage.spec.infrastructure.environmentRef', '') || RUNTIME_INPUT_VALUE
              }}
              allowableTypes={
                scope === Scope.PROJECT
                  ? allowableTypes
                  : ((allowableTypes as MultiTypeInputType[]).filter(
                      item => item !== MultiTypeInputType.FIXED
                    ) as AllowedTypes)
              }
              onUpdate={val => updateEnvStep(val)}
              factory={factory}
              stepViewType={StepViewType.Edit}
            />
          </Card>
          <div className={stageCss.tabHeading} id="infrastructureDefinition">
            <StringWithTooltip
              tooltipId="pipelineStep.infrastructureDefinition"
              stringId="pipelineSteps.deploy.infrastructure.infraDefinition"
            />
          </div>
        </>
      )}
      {!(
        isAzureWebAppDeploymentType(selectedDeploymentType) ||
        isAzureWebAppInfrastructureType(selectedInfrastructureType) ||
        isElastigroupDeploymentType(selectedDeploymentType) ||
        isElastigroupInfrastructureType(selectedInfrastructureType) ||
        isCustomDeploymentInfrastructureType(selectedInfrastructureType) ||
        isTASInfrastructureType(selectedInfrastructureType) ||
        isAsgDeploymentInfrastructureType(selectedInfrastructureType)
      ) && (
        <Card className={stageCss.sectionCard}>
          {!(
            isServerlessDeploymentType(selectedDeploymentType) ||
            isServerlessInfrastructureType(selectedInfrastructureType)
          ) && (
            <Text margin={{ bottom: 'medium' }} className={stageCss.info}>
              <StringWithTooltip
                tooltipId={getInfraDefinitionMethodTooltipId(selectedDeploymentType)}
                stringId="cd.pipelineSteps.environmentTab.selectInfrastructureType"
              />
            </Text>
          )}
          <SelectInfrastructureType
            infraGroups={infraGroups}
            isReadonly={
              isReadonly ||
              !isEmpty(props?.selectedInfrastructure) ||
              (!selectedDeploymentType && selectedInfrastructureType)
            }
            selectedInfrastructureType={selectedInfrastructureType}
            onChange={deploymentType => {
              setSelectedInfrastructureType(deploymentType)
              resetInfrastructureDefinition(deploymentType)
            }}
          />
        </Card>
      )}
      {contextType !== PipelineContextType.Standalone && selectedInfrastructureType && (
        <Accordion className={stageCss.accordion} activeId="dynamicProvisioning">
          <Accordion.Panel
            id="dynamicProvisioning"
            addDomId={true}
            summary={<div className={stageCss.tabHeading}>{getString('cd.dynamicProvisioning')}</div>}
            details={
              <Card className={stageCss.sectionCard}>
                <StepWidget<InfraProvisioningData>
                  factory={factory}
                  allowableTypes={allowableTypes}
                  readonly={isReadonly}
                  key={stage?.stage?.identifier}
                  initialValues={getProvisionerData(defaultTo(stage, {} as StageElementWrapper))}
                  type={StepType.InfraProvisioning}
                  stepViewType={StepViewType.Edit}
                  onUpdate={(value: InfraProvisioningData) => {
                    if (stage) {
                      const stageData = produce(stage, draft => {
                        set(draft, 'stage.spec.infrastructure.infrastructureDefinition.provisioner', value.provisioner)
                        cleanUpEmptyProvisioner(draft)
                      })
                      if (stageData.stage) {
                        setProvisionerType(value.selectedProvisioner!)
                        updateStage(stageData.stage).then(() => {
                          setProvisionerEnabled(value.provisionerEnabled)
                        })
                      }
                    } else {
                      setProvisionerType(value.selectedProvisioner!)
                      setProvisionerEnabled(value.provisionerEnabled)
                    }
                  }}
                />
              </Card>
            }
          />
        </Accordion>
      )}
      {selectedInfrastructureType && (
        <>
          {(isAzureWebAppDeploymentType(selectedInfrastructureType) ||
            isPDCDeploymentInfrastructureType(selectedInfrastructureType) ||
            isCustomDeploymentInfrastructureType(selectedInfrastructureType)) &&
          isSvcEnvEnabled ? (
            <></>
          ) : (
            <div
              className={stageCss.tabHeading}
              id="clusterDetails"
              data-tooltip-id={getInfraDefinitionDetailsHeaderTooltipId(selectedInfrastructureType)}
            >
              {defaultTo(detailsHeaderName[selectedInfrastructureType], getString('cd.steps.common.clusterDetails'))}
              <HarnessDocTooltip
                tooltipId={getInfraDefinitionDetailsHeaderTooltipId(selectedInfrastructureType)}
                useStandAlone={true}
              />
            </div>
          )}
          <Card className={stageCss.sectionCard}>{getClusterConfigurationStep(selectedInfrastructureType)}</Card>
        </>
      )}
      <Container margin={{ top: 'xxlarge' }}>{props.children}</Container>
    </>
  )
}
