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
import { Card, HarnessDocTooltip } from '@harness/uicore'

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
import { getSelectedDeploymentType, getVariablesHeaderTooltipId } from '@pipeline/utils/stageHelpers'
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

interface ASGServiceSpecInitialValues extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface ASGServiceSpecEditableProps {
  initialValues: ASGServiceSpecInitialValues
  onUpdate?: (data: ServiceSpec) => void
  readonly?: boolean
  factory?: AbstractStepFactory
}

export const ASGServiceSpecEditable: React.FC<ASGServiceSpecEditableProps> = ({
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
    stage?.stage as DeploymentStageElementConfig,
    isServiceEntityPage
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

  const scallingPolicyManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.AsgScalingPolicy)
  }, [listOfManifests])
  const launchTemplateManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.AsgLaunchTemplate)
  }, [listOfManifests])
  const configurationManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.AsgConfiguration)
  }, [listOfManifests])
  const scheduledUpdateGroupActionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.AsgScheduledUpdateGroupAction
    )
  }, [listOfManifests])

  const getListOfManifestForManifestType = useCallback(
    (manifestType?: ManifestConfig['type']): ManifestConfigWrapper[] => {
      switch (manifestType) {
        case ManifestDataType.AsgScalingPolicy:
          return scallingPolicyManifests
        case ManifestDataType.AsgLaunchTemplate:
          return launchTemplateManifests
        case ManifestDataType.AsgConfiguration:
          return configurationManifests
        case ManifestDataType.AsgScheduledUpdateGroupAction:
          return scheduledUpdateGroupActionManifests
        default:
          return listOfManifests
      }
    },
    [
      configurationManifests,
      launchTemplateManifests,
      listOfManifests,
      scallingPolicyManifests,
      scheduledUpdateGroupActionManifests
    ]
  )

  const getFinalListOfManifest = useCallback(
    (manifestListForManifestType: ManifestConfigWrapper[], manifestType?: ManifestConfig['type']) => {
      switch (manifestType) {
        case ManifestDataType.AsgLaunchTemplate:
          return [
            ...manifestListForManifestType,
            ...configurationManifests,
            ...scallingPolicyManifests,
            ...scheduledUpdateGroupActionManifests
          ]
        case ManifestDataType.AsgConfiguration:
          return [
            ...launchTemplateManifests,
            ...manifestListForManifestType,
            ...scallingPolicyManifests,
            ...scheduledUpdateGroupActionManifests
          ]
        case ManifestDataType.AsgScalingPolicy:
          return [
            ...launchTemplateManifests,
            ...configurationManifests,
            ...manifestListForManifestType,
            ...scheduledUpdateGroupActionManifests
          ]
        case ManifestDataType.AsgScheduledUpdateGroupAction:
          return [
            ...launchTemplateManifests,
            ...configurationManifests,
            ...scallingPolicyManifests,
            ...manifestListForManifestType
          ]
        default:
          return [...manifestListForManifestType]
      }
    },
    [scallingPolicyManifests, configurationManifests, scheduledUpdateGroupActionManifests, launchTemplateManifests]
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

  const deleteScallingPolicy = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.AsgScalingPolicy))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )
  const deleteLaunchTemplate = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.AsgLaunchTemplate))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )
  const deleteConfiguration = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.AsgConfiguration))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )
  const deleteScheduledUpdateGroupAction = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.AsgScheduledUpdateGroupAction))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} id={'AWS ASG Configurations'} data-testid={'aws-asg-configuations-card'}>
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_awsAsgHeader`}
            >
              {'AWS ASG Configurations'}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_awsAsgHeader`}
                useStandAlone={true}
              />
            </div>

            <Card
              className={css.nestedSectionCard}
              id={'ASG Launch Template'}
              data-testid={'launch-template-definition-card'}
            >
              <div
                className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
                data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_launchTemplate`}
              >
                {'Launch Template'}
                <HarnessDocTooltip
                  tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_launchTemplate`}
                  useStandAlone={true}
                />
              </div>
              <ManifestSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
                initialManifestList={launchTemplateManifests}
                allowOnlyOneManifest
                addManifestBtnText={getString('common.addName', {
                  name: 'Launch Template'
                })}
                updateManifestList={updateListOfManifests}
                preSelectedManifestType={ManifestDataType.AsgLaunchTemplate}
                availableManifestTypes={[ManifestDataType.AsgLaunchTemplate]}
                deleteManifest={deleteLaunchTemplate}
              />
            </Card>
            <Card
              className={css.nestedSectionCard}
              id={'ASG Configuration'}
              data-testid={'asg-configuration-definition-card'}
            >
              <div
                className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
                data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_asgConfiguration`}
              >
                {'ASG Configuration'}
                <HarnessDocTooltip
                  tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_asgConfiguration`}
                  useStandAlone={true}
                />
              </div>
              <ManifestSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
                initialManifestList={configurationManifests}
                addManifestBtnText={getString('common.addName', {
                  name: 'ASG Configuration'
                })}
                allowOnlyOneManifest
                updateManifestList={updateListOfManifests}
                preSelectedManifestType={ManifestDataType.AsgConfiguration}
                availableManifestTypes={[ManifestDataType.AsgConfiguration]}
                deleteManifest={deleteConfiguration}
              />
            </Card>
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
                header: 'Scaling Policy'
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
                name: 'Scaling Policy'
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.AsgScalingPolicy}
              availableManifestTypes={[ManifestDataType.AsgScalingPolicy]}
              deleteManifest={deleteScallingPolicy}
            />
          </Card>
          <Card
            className={css.sectionCard}
            id={'ASG Scheduled Update Group Action'}
            data-testid={'scheduled-update-group-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scheduledUpdateGroupAction`}
            >
              {getString('common.headerWithOptionalText', {
                header: 'Scheduled Update Group Action'
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scheduledUpdateGroupAction`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={scheduledUpdateGroupActionManifests}
              addManifestBtnText={getString('common.addName', {
                name: 'Scheduled Update Group Action'
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.AsgScheduledUpdateGroupAction}
              availableManifestTypes={[ManifestDataType.AsgScheduledUpdateGroupAction]}
              deleteManifest={deleteScheduledUpdateGroupAction}
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
                <HarnessDocTooltip
                  tooltipId={getConfigFilesHeaderTooltipId(selectedDeploymentType)}
                  useStandAlone={true}
                />
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
          <div
            className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
            data-tooltip-id={getVariablesHeaderTooltipId(selectedDeploymentType)}
          >
            {getString('common.variables')}
            <HarnessDocTooltip tooltipId={getVariablesHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
          </div>
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
