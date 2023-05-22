/*
 * Copyright 2023 Harness Inc. All rights reserved.
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
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
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
import { AddManifestSteps } from '@cd/components/CommonComponents/AddManifestSteps/AddManifestSteps'
import { isMultiArtifactSourceEnabled, setupMode } from '../../PipelineStepsUtil'
import css from '../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface AwsLambdaServiceSpecInitialValues extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface AwsLambdaServiceSpecEditableProps {
  initialValues: AwsLambdaServiceSpecInitialValues
  onUpdate?: (data: ServiceSpec) => void
  readonly?: boolean
  factory?: AbstractStepFactory
}

const suggestedFunctionDefinition = {
  functionName: '<function name>',
  handler: 'handler.hello',
  role: '<arn-role>',
  runtime: 'nodejs16.x'
}

const suggestedFunctionAliasDefinition = {
  description: 'creating alias',
  name: 'test-alias-2'
}

const suggestedFunctionDefinitionYaml =
  `# Following are the minimum set of parameters required to create an AWS Lambda Function Definition.
# Please make sure your uploaded manifest file includes all of them.

` + yamlStringify(suggestedFunctionDefinition)

const suggestedFunctionAliasDefinitionYaml =
  `# Following are the minimum set of parameters required to create an AWS Lambda Function Alias Definition.
# Please make sure your uploaded manifest file includes all of them.

` + yamlStringify(suggestedFunctionAliasDefinition)

const functionDefinitionFileName = 'AWS-Lambda-Function-Definition.yaml'

const functionAliasDefinitionFileName = 'AWS-Lambda-Function-Alias-Definition.yaml'

export const AwsLambdaServiceSpecEditable: React.FC<AwsLambdaServiceSpecEditableProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const {
    state: {
      templateServiceData,
      selectionState: { selectedStageId }
    },
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { getString } = useStrings()
  const { isServiceEntityPage } = useServiceContext()
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)

  const manifestsFieldPath = isPropagating
    ? 'stage.spec.serviceConfig.stageOverrides.manifests'
    : 'stage.spec.serviceConfig.serviceDefinition.spec.manifests'

  const isPrimaryArtifactSources = isMultiArtifactSourceEnabled(
    !!isSvcEnvEnabled,
    stage?.stage as DeploymentStageElementConfig,
    isServiceEntityPage
  )
  const isNewService = isNewServiceEnvEntity(!!isSvcEnvEnabled, stage?.stage as DeploymentStageElementConfig)

  const listOfManifests: ManifestConfigWrapper[] = useMemo(() => {
    /* istanbul ignore next */
    /* istanbul ignore else */
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const functionDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.AwsLambdaFunctionDefinition
    )
  }, [listOfManifests])

  const functionAliasDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.AwsLambdaFunctionAliasDefinition
    )
  }, [listOfManifests])

  const getListOfManifestForManifestType = useCallback(
    (manifestType?: ManifestConfig['type']): ManifestConfigWrapper[] => {
      switch (manifestType) {
        case ManifestDataType.AwsLambdaFunctionDefinition:
          return functionDefinitionManifests
        case ManifestDataType.AwsLambdaFunctionAliasDefinition:
          return functionAliasDefinitionManifests
        default:
          return listOfManifests
      }
    },
    [functionDefinitionManifests, functionAliasDefinitionManifests, listOfManifests]
  )

  const getFinalListOfManifest = useCallback(
    (manifestListForManifestType: ManifestConfigWrapper[], manifestType?: ManifestConfig['type']) => {
      switch (manifestType) {
        case ManifestDataType.AwsLambdaFunctionDefinition:
          return [...manifestListForManifestType, ...functionAliasDefinitionManifests]
        case ManifestDataType.AwsLambdaFunctionAliasDefinition:
          return [...functionDefinitionManifests, ...manifestListForManifestType]
        default:
          return [...manifestListForManifestType]
      }
    },
    [functionDefinitionManifests, functionAliasDefinitionManifests]
  )

  const updateStageData = useCallback(
    (updatedManifestList: ManifestConfigWrapper[]): void => {
      if (stage) {
        updateStage(
          produce(stage, draft => {
            set(draft, manifestsFieldPath, updatedManifestList)
          }).stage as StageElementConfig
        )
      }
    },
    [manifestsFieldPath, stage, updateStage]
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
    [isPropagating, updateStageData, getFinalListOfManifest, getListOfManifestForManifestType]
  )

  const deleteFunctionDefinition = React.useCallback(
    (index: number) => {
      functionDefinitionManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(functionDefinitionManifests, ManifestDataType.AwsLambdaFunctionDefinition))
    },
    [functionDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteFunctionAliasDefinition = React.useCallback(
    (index: number) => {
      functionAliasDefinitionManifests.splice(index, 1)
      updateStageData(
        getFinalListOfManifest(functionAliasDefinitionManifests, ManifestDataType.AwsLambdaFunctionAliasDefinition)
      )
    },
    [functionAliasDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} data-testid={'aws-lambda-function-definition-card'}>
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_awsLambdaFunctionDefinition`}
              data-testid={'function-definition-header-container'}
            >
              {getString('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_awsLambdaFunctionDefinition`}
                useStandAlone={true}
              />
            </div>
            {!functionDefinitionManifests.length && (
              <AddManifestSteps
                selectedDeploymentType={selectedDeploymentType}
                manifestType={ManifestDataType.AwsLambdaFunctionDefinition}
                manifestFileName={functionDefinitionFileName}
                suggestedManifestYaml={suggestedFunctionDefinitionYaml}
              />
            )}
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={functionDefinitionManifests}
              allowOnlyOneManifest={true}
              addManifestBtnText={getString('common.addName', {
                name: getString('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.AwsLambdaFunctionDefinition}
              availableManifestTypes={[ManifestDataType.AwsLambdaFunctionDefinition]}
              deleteManifest={deleteFunctionDefinition}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipeline.manifestTypeLabels.AwsLambdaFunctionAliasDefinition')}
            data-testid={'aws-lambda-function-alias-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(
                selectedDeploymentType
              )}_awsLambdaFunctionAliasDefinition`}
              data-testid={'function-alias-definition-header-container'}
            >
              {getString('common.headerWithOptionalText', {
                header: getString('pipeline.manifestTypeLabels.AwsLambdaFunctionAliasDefinition')
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_awsLambdaFunctionAliasDefinition`}
                useStandAlone={true}
              />
            </div>
            {!functionAliasDefinitionManifests.length && (
              <AddManifestSteps
                selectedDeploymentType={selectedDeploymentType}
                manifestType={ManifestDataType.AwsLambdaFunctionAliasDefinition}
                manifestFileName={functionAliasDefinitionFileName}
                suggestedManifestYaml={suggestedFunctionAliasDefinitionYaml}
              />
            )}
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={functionAliasDefinitionManifests}
              addManifestBtnText={getString('common.addName', {
                name: getString('pipeline.manifestTypeLabels.AwsLambdaFunctionAliasDefinition')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.AwsLambdaFunctionAliasDefinition}
              availableManifestTypes={[ManifestDataType.AwsLambdaFunctionAliasDefinition]}
              deleteManifest={deleteFunctionAliasDefinition}
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
            factory={factory as AbstractStepFactory}
            isPropagating={isPropagating}
            readonly={!!readonly}
          />
        </Card>
      </div>
    </div>
  )
}
