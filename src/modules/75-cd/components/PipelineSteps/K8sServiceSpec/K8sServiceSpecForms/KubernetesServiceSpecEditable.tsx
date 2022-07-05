/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import {
  getSelectedDeploymentType,
  isServerlessDeploymentType,
  ServiceDeploymentType
} from '@pipeline/utils/stageHelpers'
import StartupScriptSelection from '@pipeline/components/StartupScriptSelection/StartupScriptSelection'
import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import VariableListReadOnlyView from '@pipeline/components/WorkflowVariablesSelection/VariableListReadOnlyView'
import { setupMode } from '../K8sServiceSpecHelper'
import type { KubernetesServiceInputFormProps } from '../K8sServiceSpecInterface'
import AzureWebAppConfigSelection from '../../AzureWebAppServiceConfig/AzureWebAppServiceConfigSelection'
import css from '../K8sServiceSpec.module.scss'

const getManifestsHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeManifests'
  }
  return 'deploymentTypeManifests'
}

const getStartupScriptHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeStartupScript'
  }
  return 'deploymentTypeStartupScript'
}

const getArtifactsHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeArtifacts'
  }
  return 'deploymentTypeArtifacts'
}

const getAppConfigHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  if (isServerlessDeploymentType(selectedDeploymentType)) {
    return 'serverlessDeploymentTypeApplicationConfig'
  }
  return 'deploymentTypeApplicationConfig'
}

const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const { getString } = useStrings()
  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const selectedDeploymentType = deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating)

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          >
            <div
              className={cx(css.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id={getManifestsHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
              <HarnessDocTooltip tooltipId={getManifestsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>

            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
            />
          </Card>

          {selectedDeploymentType === ServiceDeploymentType.AzureWebApps && (
            <>
              <Card className={css.sectionCard} id={getString('pipeline.startupScript.name')}>
                <div
                  className={cx(css.tabSubHeading, 'ng-tooltip-native')}
                  data-tooltip-id={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
                >
                  {getString('pipeline.startupScript.name')}
                  <HarnessDocTooltip
                    tooltipId={getStartupScriptHeaderTooltipId(selectedDeploymentType)}
                    useStandAlone={true}
                  />
                </div>
                <StartupScriptSelection
                  isPropagating={isPropagating}
                  deploymentType={selectedDeploymentType}
                  isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                  readonly={!!readonly}
                />
              </Card>
              <Card className={css.sectionCard} id={getString('pipeline.appServiceConfig.title')}>
                <div
                  className={cx(css.tabSubHeading, 'ng-tooltip-native')}
                  data-tooltip-id={getAppConfigHeaderTooltipId(selectedDeploymentType)}
                >
                  {getString('pipeline.appServiceConfig.title')}
                  <HarnessDocTooltip
                    tooltipId={getAppConfigHeaderTooltipId(selectedDeploymentType)}
                    useStandAlone={true}
                  />
                </div>
                <AzureWebAppConfigSelection
                  isPropagating={isPropagating}
                  deploymentType={selectedDeploymentType}
                  isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                  readonly={!!readonly}
                />
              </Card>
            </>
          )}

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

export default KubernetesServiceSpecEditable
