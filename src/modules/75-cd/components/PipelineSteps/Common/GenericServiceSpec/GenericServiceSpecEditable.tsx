/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { getSelectedDeploymentType, isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import VariableListReadOnlyView from '@pipeline/components/WorkflowVariablesSelection/VariableListReadOnlyView'
import { getManifestsHeaderTooltipId } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { getArtifactsHeaderTooltipId } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import ConfigFilesSelection from '@pipeline/components/ConfigFilesSelection/ConfigFilesSelection'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useServiceContext } from '@cd/context/ServiceContext'
import type { KubernetesServiceInputFormProps } from '../../K8sServiceSpec/K8sServiceSpecInterface'
import { setupMode } from '../../PipelineStepsUtil'
import css from './GenericServiceSpec.module.scss'

const GenericServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
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
    getStageFromPipeline
  } = usePipelineContext()
  const { isServiceEntityPage } = useServiceContext()
  const { NG_FILE_STORE, NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)
  const isNewService = isNewServiceEnvEntity(!!NG_SVC_ENV_REDESIGN, stage?.stage as DeploymentStageElementConfig)

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
              allowOnlyOneManifest={isServerlessDeploymentType(selectedDeploymentType)}
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

export default GenericServiceSpecEditable
