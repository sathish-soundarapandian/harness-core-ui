import React from 'react'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { get } from 'lodash-es'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { useStrings } from 'framework/strings'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { setupMode } from '../K8sServiceSpecHelper'
import type { KubernetesServiceInputFormProps } from '../K8sServiceSpecInterface'
import css from '../K8sServiceSpec.module.scss'

const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType },
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
  // Default deployment type needs to be changed to null, after native helm integration
  const deploymentType = get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', 'Kubernetes')

  return (
    <div className={css.serviceDefinition}>
      {!!deploymentType && (
        <>
          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          >
            <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="deploymentTypeManifests">
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
              <HarnessDocTooltip tooltipId="deploymentTypeManifests" useStandAlone={true} />
            </div>
            <ManifestSelection isPropagating={isPropagating} />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          >
            <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="deploymentTypeArtifacts">
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              <HarnessDocTooltip tooltipId="deploymentTypeArtifacts" useStandAlone={true} />
            </div>
            <ArtifactsSelection isPropagating={isPropagating} />
          </Card>
        </>
      )}

      <div className={css.accordionTitle}>
        <div className={css.tabHeading} id="advanced">
          {getString('advancedTitle')}
        </div>
        <Card className={css.sectionCard} id={getString('variablesText')}>
          <div className={css.tabSubHeading}>{getString('variablesText')}</div>
          <WorkflowVariables
            tabName={DeployTabs.SERVICE}
            factory={factory as any}
            isPropagating={isPropagating}
            readonly={readonly}
          />
        </Card>
      </div>
    </div>
  )
}

export default KubernetesServiceSpecEditable
