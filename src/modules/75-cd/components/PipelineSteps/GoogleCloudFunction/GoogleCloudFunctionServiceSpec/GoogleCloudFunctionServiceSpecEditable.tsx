/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { Card, Container, CopyToClipboard, HarnessDocTooltip, Icon, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ServiceDefinition, ServiceSpec, ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { getSelectedDeploymentType, getVariablesHeaderTooltipId } from '@pipeline/utils/stageHelpers'
import {
  allowedManifestTypes,
  getManifestsHeaderTooltipId,
  getManifestsFirstStepTooltipId,
  getManifestsSecondStepTooltipId
} from '@pipeline/components/ManifestSelection/Manifesthelper'
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
import { isMultiArtifactSourceEnabled, setupMode } from '../../PipelineStepsUtil'
import css from './GoogleCloudFunctionServiceSpec.module.scss'

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

const initialSuggestedManifest = {
  functionName: '<+service.name>',
  runtime: 'node.js16.x',
  functionHandler: '/hello/world',
  region: 'us-east',
  bucket: 'https://gcs/bucket_name/function.zip',
  image: 'Docker',
  layers: {
    layer1: 's3layer'
  }
}

const initialSuggestedManifestYaml =
  `# Following are the minimum set of parameters required to create a Google Cloud Function.
# Please make sure your uploaded manifest file includes all of them.

` + yamlStringify(initialSuggestedManifest)

const manifestFileName = 'Google-cloud-function-manifest.yaml'

const GoogleCloudFunctionServiceSpecEditable: React.FC<GoogleCloudFunctionServiceSpecEditableProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
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
  const { showError } = useToaster()
  const linkRef = React.useRef<HTMLAnchorElement>(null)

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
  const manifestList: ManifestConfigWrapper[] = useMemo(() => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const onDownload = () => {
    try {
      const errorMap = yamlHandler?.getYAMLValidationErrorMap()
      if (errorMap?.size) {
        throw new Error(errorMap.entries().next().value)
      }
      const content = new Blob([yamlHandler?.getLatestYaml() as BlobPart], { type: 'data:text/plain;charset=utf-8' })
      if (linkRef?.current) {
        linkRef.current.href = window.URL.createObjectURL(content)
        linkRef.current.download = manifestFileName
        linkRef.current.click()
      }
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <>
      <div className={css.serviceDefinition}>
        {!!selectedDeploymentType && (
          <>
            <Card className={css.sectionCard} data-testid={'function-definition-card'}>
              <div
                className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
                data-tooltip-id={getManifestsHeaderTooltipId(selectedDeploymentType)}
              >
                {getString('cd.pipelineSteps.serviceTab.manifest.functionDefinition')}
                <HarnessDocTooltip
                  tooltipId={getManifestsHeaderTooltipId(selectedDeploymentType)}
                  useStandAlone={true}
                />
              </div>
              {!manifestList.length && (
                <Container>
                  <Container className={css.manifestStepContainer} data-tool>
                    <div className={css.manifestStepNumberContainer}>1</div>
                    <div
                      className={css.manifestStepTitle}
                      data-tooltip-id={getManifestsFirstStepTooltipId(selectedDeploymentType)}
                    >
                      {getString('cd.pipelineSteps.serviceTab.manifest.manifestFirstStepTitle')}
                      <HarnessDocTooltip
                        tooltipId={getManifestsFirstStepTooltipId(selectedDeploymentType)}
                        useStandAlone={true}
                      />
                    </div>
                  </Container>
                  <Container className={css.yamlBuilderContainer}>
                    <YamlBuilderMemo
                      fileName={manifestFileName}
                      existingYaml={initialSuggestedManifestYaml}
                      bind={setYamlHandler}
                      yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
                      height="200px"
                      renderCustomHeader={() => (
                        <div className={css.yamlEditorHeader}>
                          <Text font={{ variation: FontVariation.BODY2 }}>{'Google-cloud-function-manifest.yaml'}</Text>
                          <Container flex margin={{ right: 'small' }}>
                            <CopyToClipboard
                              content={defaultTo(yamlHandler?.getLatestYaml(), '')}
                              showFeedback={true}
                            />
                            <Icon
                              name={'download'}
                              onClick={onDownload}
                              className={css.icon}
                              color={Color.PRIMARY_7}
                              title={getString('delegates.downloadYAMLFile')}
                            ></Icon>
                          </Container>
                        </div>
                      )}
                    />
                  </Container>
                  <Container className={cx(css.manifestStepContainer, css.manifestSecondStepContainer)}>
                    <div className={css.manifestStepNumberContainer}>2</div>
                    <div
                      className={css.manifestStepTitle}
                      data-tooltip-id={getManifestsSecondStepTooltipId(selectedDeploymentType)}
                    >
                      {getString('cd.pipelineSteps.serviceTab.manifest.manifestSecondStepTitle')}
                      <HarnessDocTooltip
                        tooltipId={getManifestsSecondStepTooltipId(selectedDeploymentType)}
                        useStandAlone={true}
                      />
                    </div>
                  </Container>
                </Container>
              )}
              <ManifestSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
                allowOnlyOneManifest={true}
                availableManifestTypes={allowedManifestTypes[selectedDeploymentType]}
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
                <HarnessDocTooltip
                  tooltipId={getArtifactsHeaderTooltipId(selectedDeploymentType)}
                  useStandAlone={true}
                />
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
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}

export default GoogleCloudFunctionServiceSpecEditable
