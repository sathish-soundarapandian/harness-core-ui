/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { Card, HarnessDocTooltip } from '@harness/uicore'

import type { ServiceDefinition, ServiceSpec, ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import {
  getSelectedDeploymentType,
  getVariablesHeaderTooltipId,
  GoogleCloudFunctionsEnvType
} from '@pipeline/utils/stageHelpers'
import {
  allowedManifestTypes,
  getManifestsHeaderTooltipId,
  ManifestDataType
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  allowedArtifactTypes,
  ENABLED_ARTIFACT_TYPES,
  getArtifactsHeaderTooltipId
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
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
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useServiceContext } from '@cd/context/ServiceContext'
import { AddManifestSteps } from '@cd/components/CommonComponents/AddManifestSteps/AddManifestSteps'
import { isMultiArtifactSourceEnabled, setupMode } from '../../PipelineStepsUtil'
import css from '../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface GoogleCloudFunctionServiceSpecInitialValues extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface GoogleCloudFunctionServiceSpecEditableProps {
  initialValues: GoogleCloudFunctionServiceSpecInitialValues
  onUpdate?: (data: ServiceSpec) => void
  readonly?: boolean
  factory?: AbstractStepFactory
}

const suggestedManifestGenOne = {
  function: {
    name: '<functionName>',
    runtime: 'nodejs18',
    entryPoint: 'helloGET',
    httpsTrigger: {
      securityLevel: 'SECURE_OPTIONAL'
    }
  }
}

const suggestedManifestGenTwo = {
  function: {
    name: '<functionName>',
    buildConfig: {
      runtime: 'nodejs18',
      entryPoint: 'helloGET'
    }
  }
}

const getSuggestedManifestYaml = (enviromentType: GoogleCloudFunctionsEnvType) => {
  const suggestedManifestYamlComment = `# Following are the minimum set of parameters required to create a Google Cloud Function.
# Please make sure your uploaded manifest file includes all of them.

`
  if (enviromentType === GoogleCloudFunctionsEnvType.GenOne) {
    return suggestedManifestYamlComment + yamlStringify(suggestedManifestGenOne)
  }
  return suggestedManifestYamlComment + yamlStringify(suggestedManifestGenTwo)
}

const manifestFileName = 'Google-cloud-function-manifest.yaml'

const GoogleCloudFunctionServiceSpecEditable: React.FC<GoogleCloudFunctionServiceSpecEditableProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const {
    state: {
      templateServiceData,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { getString } = useStrings()
  const { isServiceEntityPage } = useServiceContext()
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)
  const isNewService = isNewServiceEnvEntity(!!isSvcEnvEnabled, stage?.stage as DeploymentStageElementConfig)
  const isPrimaryArtifactSources = isMultiArtifactSourceEnabled(
    !!isSvcEnvEnabled,
    stage?.stage as DeploymentStageElementConfig,
    isServiceEntityPage
  )
  const environmentType = get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.environmentType')

  const manifestList: ManifestConfigWrapper[] = useMemo(() => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const getAllowedManifestTypes = (): ManifestTypes[] => {
    if (environmentType === GoogleCloudFunctionsEnvType.GenOne) {
      return [ManifestDataType.GoogleCloudFunctionGenOneDefinition]
    }
    return allowedManifestTypes[selectedDeploymentType]
  }

  const getAllowedArtifactTypes = (): ArtifactType[] => {
    if (environmentType === GoogleCloudFunctionsEnvType.GenOne) {
      return [ENABLED_ARTIFACT_TYPES.GoogleCloudStorage, ENABLED_ARTIFACT_TYPES.GoogleCloudSource]
    }
    return allowedArtifactTypes[selectedDeploymentType]
  }

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} data-testid={'function-definition-card'}>
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={getManifestsHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('cd.pipelineSteps.serviceTab.manifest.functionDefinition')}
              <HarnessDocTooltip tooltipId={getManifestsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>
            {!manifestList.length && (
              <AddManifestSteps
                selectedDeploymentType={selectedDeploymentType}
                manifestFileName={manifestFileName}
                suggestedManifestYaml={getSuggestedManifestYaml(environmentType)}
              />
            )}
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              allowOnlyOneManifest={true}
              availableManifestTypes={getAllowedManifestTypes()}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.functionDefinition')
              })}
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
                availableArtifactTypes={getAllowedArtifactTypes()}
              />
            ) : (
              <ArtifactsSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
                availableArtifactTypes={getAllowedArtifactTypes()}
              />
            )}
          </Card>
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
            factory={factory as AbstractStepFactory}
            isPropagating={isPropagating}
            readonly={!!readonly}
          />
        </Card>

        {(isNewService || isServiceEntityPage) && ( //Config files are only available for creation or readonly mode for service V2
          <Card className={css.sectionCard} id={getString('pipelineSteps.configFiles')}>
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
      </div>
    </div>
  )
}

export default GoogleCloudFunctionServiceSpecEditable
