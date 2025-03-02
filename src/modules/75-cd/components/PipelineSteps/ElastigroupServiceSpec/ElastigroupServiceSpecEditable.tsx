/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, HarnessDocTooltip } from '@harness/uicore'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import { getSelectedDeploymentType, getVariablesHeaderTooltipId } from '@pipeline/utils/stageHelpers'
import StartupScriptSelection from '@pipeline/components/StartupScriptSelection/StartupScriptSelection'
import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getArtifactsHeaderTooltipId } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import ServiceV2ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ServiceV2ArtifactsSelection'
import { getConfigFilesHeaderTooltipId } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import ConfigFilesSelection from '@pipeline/components/ConfigFilesSelection/ConfigFilesSelection'
import { useServiceContext } from '@cd/context/ServiceContext'
import { FeatureFlag } from '@common/featureFlags'
import { isMultiArtifactSourceEnabled, setupMode } from '../PipelineStepsUtil'
import type { ElastigroupServiceSpecFormProps } from './ElastigroupServiceSpecInterface'
import css from '../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

const getStartupScriptHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  return `${selectedDeploymentType}StartupScript`
}

const ElastigroupServiceSpecEditable: React.FC<ElastigroupServiceSpecFormProps> = ({
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
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)
  const isPrimaryArtifactSources = isMultiArtifactSourceEnabled(
    !!isSvcEnvEnabled,
    stage?.stage as DeploymentStageElementConfig,
    isServiceEntityPage
  )
  const isNewService = isNewServiceEnvEntity(!!isSvcEnvEnabled, stage?.stage as DeploymentStageElementConfig)

  const updateStageData = async (newStage: any): Promise<void> => {
    await updateStage(newStage)
  }

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} id={getString('pipeline.startup.script.name')}>
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('optionalField', {
                name: getString('pipeline.startup.script.name')
              })}
              <HarnessDocTooltip
                tooltipId={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
                useStandAlone={true}
              />
            </div>
            <StartupScriptSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={defaultTo(readonly, true)}
              updateStage={updateStageData}
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

export default ElastigroupServiceSpecEditable
