/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { defaultTo, get, set } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type {
  ManifestConfigWrapper,
  ServiceDefinition,
  ServiceSpec,
  StageElementConfig,
  ManifestConfig
} from 'services/cd-ng'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { getSelectedDeploymentType } from '@pipeline/utils/stageHelpers'
import { getManifestsHeaderTooltipId, ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { getArtifactsHeaderTooltipId } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import ServiceV2ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ServiceV2ArtifactsSelection'
import { getConfigFilesHeaderTooltipId } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import ConfigFilesSelection from '@pipeline/components/ConfigFilesSelection/ConfigFilesSelection'
import { useServiceContext } from '@cd/context/ServiceContext'
import { isMultiArtifactSourceEnabled, setupMode } from '../PipelineStepsUtil'
import css from '../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface ECSServiceSpecInitialValues extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface ECSServiceSpecEditableProps {
  initialValues: ECSServiceSpecInitialValues
  onUpdate?: (data: ServiceSpec) => void
  readonly?: boolean
  factory?: AbstractStepFactory
}

export const ECSServiceSpecEditable: React.FC<ECSServiceSpecEditableProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const { getString } = useStrings()
  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const {
    state: {
      templateServiceData,
      selectionState: { selectedStageId }
    },
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { isServiceEntityPage } = useServiceContext()
  const { NG_SVC_ENV_REDESIGN, NG_ARTIFACT_SOURCES } = useFeatureFlags()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)

  const isPrimaryArtifactSources = isMultiArtifactSourceEnabled(
    !!NG_ARTIFACT_SOURCES,
    stage?.stage as DeploymentStageElementConfig
  )
  const isNewService = isNewServiceEnvEntity(!!NG_SVC_ENV_REDESIGN, stage?.stage as DeploymentStageElementConfig)

  const listOfManifests: ManifestConfigWrapper[] = useMemo(() => {
    /* istanbul ignore next */
    /* istanbul ignore else */
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const taskDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.EcsTaskDefinition)
  }, [listOfManifests])

  const serviceDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.EcsServiceDefinition)
  }, [listOfManifests])

  const scallingPolicyManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.EcsScalingPolicyDefinition
    )
  }, [listOfManifests])

  const scalableTargetManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.EcsScalableTargetDefinition
    )
  }, [listOfManifests])

  const getListOfManifestForManifestType = useCallback(
    (manifestType?: ManifestConfig['type']): ManifestConfigWrapper[] => {
      switch (manifestType) {
        case ManifestDataType.EcsTaskDefinition:
          return taskDefinitionManifests
        case ManifestDataType.EcsServiceDefinition:
          return serviceDefinitionManifests
        case ManifestDataType.EcsScalingPolicyDefinition:
          return scallingPolicyManifests
        case ManifestDataType.EcsScalableTargetDefinition:
          return scalableTargetManifests
        default:
          return listOfManifests
      }
    },
    [
      taskDefinitionManifests,
      serviceDefinitionManifests,
      scallingPolicyManifests,
      scalableTargetManifests,
      listOfManifests
    ]
  )

  const getFinalListOfManifest = useCallback(
    (manifestListForManifestType: ManifestConfigWrapper[], manifestType?: ManifestConfig['type']) => {
      switch (manifestType) {
        case ManifestDataType.EcsTaskDefinition:
          return [
            ...manifestListForManifestType,
            ...serviceDefinitionManifests,
            ...scallingPolicyManifests,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsServiceDefinition:
          return [
            ...taskDefinitionManifests,
            ...manifestListForManifestType,
            ...scallingPolicyManifests,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsScalingPolicyDefinition:
          return [
            ...taskDefinitionManifests,
            ...serviceDefinitionManifests,
            ...manifestListForManifestType,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsScalableTargetDefinition:
          return [
            ...taskDefinitionManifests,
            ...serviceDefinitionManifests,
            ...scallingPolicyManifests,
            ...manifestListForManifestType
          ]
        default:
          return [...manifestListForManifestType]
      }
    },
    [
      taskDefinitionManifests,
      serviceDefinitionManifests,
      scallingPolicyManifests,
      scalableTargetManifests,
      listOfManifests
    ]
  )

  const updateStageData = useCallback(
    (updatedManifestList: ManifestConfigWrapper[]): void => {
      const path = isPropagating
        ? 'stage.spec.serviceConfig.stageOverrides.manifests'
        : 'stage.spec.serviceConfig.serviceDefinition.spec.manifests'
      if (stage) {
        updateStage(
          produce(stage, draft => {
            set(draft, path, updatedManifestList)
          }).stage as StageElementConfig
        )
      }
    },
    [isPropagating, stage, updateStage]
  )

  const updateListOfManifests = useCallback(
    (manifestObj: ManifestConfigWrapper, manifestIndex: number): void => {
      const manifestType = manifestObj.manifest?.type
      const manifestListForManifestType = getListOfManifestForManifestType(manifestType)
      if (manifestListForManifestType.length > 0) {
        manifestListForManifestType.splice(manifestIndex, 1, manifestObj)
      } else {
        manifestListForManifestType.push(manifestObj)
      }
      const manifestListToUpdate = getFinalListOfManifest(manifestListForManifestType, manifestType)
      updateStageData(manifestListToUpdate)
    },
    [isPropagating, updateStageData]
  )

  const deleteTaskDefinition = React.useCallback(
    (index: number) => {
      taskDefinitionManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(taskDefinitionManifests, ManifestDataType.EcsTaskDefinition))
    },
    [taskDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteServiceDefinition = React.useCallback(
    (index: number) => {
      serviceDefinitionManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(serviceDefinitionManifests, ManifestDataType.EcsServiceDefinition))
    },
    [serviceDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteScallingPolicy = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.EcsScalingPolicyDefinition))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteScalableTarget = React.useCallback(
    (index: number) => {
      scalableTargetManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scalableTargetManifests, ManifestDataType.EcsScalableTargetDefinition))
    },
    [scalableTargetManifests, updateStageData, getFinalListOfManifest]
  )

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')}
            data-testid={'task-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_taskDefinition`}
            >
              {getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_taskDefinition`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={taskDefinitionManifests}
              allowOnlyOneManifest={true}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsTaskDefinition}
              availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
              deleteManifest={deleteTaskDefinition}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
            data-testid={'service-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_serviceDefinition`}
            >
              {getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_serviceDefinition`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={serviceDefinitionManifests}
              allowOnlyOneManifest={true}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsServiceDefinition}
              availableManifestTypes={[ManifestDataType.EcsServiceDefinition]}
              deleteManifest={deleteServiceDefinition}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')}
            data-testid={'scalable-target-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalableTarget`}
            >
              {getString('common.headerWithOptionalText', {
                header: getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalableTarget`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={scalableTargetManifests}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsScalableTargetDefinition}
              availableManifestTypes={[ManifestDataType.EcsScalableTargetDefinition]}
              deleteManifest={deleteScalableTarget}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')}
            data-testid={'scaling-policy-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalingPolicy`}
            >
              {getString('common.headerWithOptionalText', {
                header: getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalingPolicy`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={scallingPolicyManifests}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsScalingPolicyDefinition}
              availableManifestTypes={[ManifestDataType.EcsScalingPolicyDefinition]}
              deleteManifest={deleteScallingPolicy}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={getArtifactsHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              <HarnessDocTooltip tooltipId={getArtifactsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>
            {isPrimaryArtifactSources ? (
              <ServiceV2ArtifactsSelection
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
              />
            ) : (
              <ArtifactsSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
              />
            )}
          </Card>
          {(isNewService || isServiceEntityPage) && ( //Config files are only available for creation or readonly mode for service V2
            <Card
              className={css.sectionCard}
              id={getString('pipelineSteps.configFiles')}
              data-testid={'configFiles-card'}
            >
              <div
                className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
                data-tooltip-id={getConfigFilesHeaderTooltipId(selectedDeploymentType)}
              >
                {getString('pipelineSteps.configFiles')}
              </div>
              <ConfigFilesSelection
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                readonly={!!readonly}
              />
            </Card>
          )}
        </>
      )}

      <div className={css.accordionTitle}>
        <div className={css.tabHeading} id="advanced">
          {getString('advancedTitle')}
        </div>
        <Card className={css.sectionCard} id={getString('common.variables')}>
          <div className={cx(css.tabSubHeading, css.listHeader)}>{getString('common.variables')}</div>
          <WorkflowVariables
            tabName={DeployTabs.SERVICE}
            formName={'addEditServiceCustomVariableForm'}
            factory={factory as any}
            isPropagating={isPropagating}
            readonly={!!readonly}
          />
        </Card>
      </div>
    </div>
  )
}
