/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import { getSelectedDeploymentType, isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'
import StartupScriptSelection from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/StartupScriptSelection'
import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import VariableListReadOnlyView from '@pipeline/components/WorkflowVariablesSelection/VariableListReadOnlyView'
import { getArtifactsHeaderTooltipId } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import ConfigFilesSelection from '@pipeline/components/ConfigFilesSelection/ConfigFilesSelection'
import { useServiceContext } from '@cd/context/ServiceContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { AzureWebAppServiceSpecFormProps } from './AzureWebAppServiceSpecInterface.types'
import AzureWebAppConfigSelection from './AzureWebAppServiceConfiguration/AzureWebAppServiceConfigSelection'
import { setupMode } from '../PipelineStepsUtil'
import css from '../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

const getStartupScriptHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeStartupScript'
  }
  return 'deploymentTypeStartupScript'
}

const getAppConfigHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeApplicationConfig'
  }
  return 'deploymentTypeApplicationConfig'
}

const AzureWebAppServiceSpecEditable: React.FC<AzureWebAppServiceSpecFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const { getString } = useStrings()
  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const [loading, setLoading] = useState(false)

  const {
    state: {
      templateServiceData,
      selectionState: { selectedStageId }
    },
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { isServiceEntityPage } = useServiceContext()
  const { NG_FILE_STORE, NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)
  const isNewService = isNewServiceEnvEntity(!!NG_SVC_ENV_REDESIGN, stage?.stage as DeploymentStageElementConfig)

  const updateStageData = async (newStage: any): Promise<void> => {
    setLoading(true)
    await updateStage(newStage).then(() => setLoading(false))
  }

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} id={getString('pipeline.startupCommand.name')}>
            <div
              className={cx(css.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipeline.startupCommand.name')}
              <HarnessDocTooltip
                tooltipId={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
                useStandAlone={true}
              />
            </div>
            <StartupScriptSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={readonly || loading}
              updateStage={updateStageData}
            />
          </Card>

          <Card className={css.sectionCard} id={getString('pipeline.appServiceConfig.title')}>
            <div
              className={cx(css.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id={getAppConfigHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipeline.appServiceConfig.title')}
              <HarnessDocTooltip tooltipId={getAppConfigHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>
            <AzureWebAppConfigSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={readonly || loading}
              updateStage={updateStageData}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          >
            <div
              className={cx(css.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id={getArtifactsHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              <HarnessDocTooltip tooltipId={getArtifactsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>
            <ArtifactsSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
            />
          </Card>
          {(isNewService || isServiceEntityPage) &&
            NG_FILE_STORE && ( //Config files are only available for creation or readonly mode for service V2
              <Card className={css.sectionCard} id={getString('pipelineSteps.configFiles')}>
                <div
                  className={cx(css.tabSubHeading, 'ng-tooltip-native')}
                  data-tooltip-id={getArtifactsHeaderTooltipId(selectedDeploymentType)}
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
          <div className={css.tabSubHeading}>{getString('common.variables')}</div>
          {isReadonlyServiceMode ? (
            <VariableListReadOnlyView />
          ) : (
            <WorkflowVariables
              tabName={DeployTabs.SERVICE}
              formName={'addEditServiceCustomVariableForm'}
              factory={factory as any}
              isPropagating={isPropagating}
              readonly={!!readonly}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AzureWebAppServiceSpecEditable
