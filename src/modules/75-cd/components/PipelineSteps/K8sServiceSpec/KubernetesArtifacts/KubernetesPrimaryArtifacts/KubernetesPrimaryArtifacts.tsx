/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { StoreType } from '@common/constants/GitSyncTypes'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { KubernetesArtifactsProps } from '../../K8sServiceSpecInterface'
import { fromPipelineInputTriggerTab, getPrimaryInitialValues } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

export const KubernetesPrimaryArtifacts = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const {
    projectIdentifier: _projectIdentifier,
    orgIdentifier: _orgIdentifier,
    accountId,
    pipelineIdentifier: _pipelineIdentifier
  } = useParams<PipelineType<InputSetPathProps> & { accountId: string }>()
  const { repoIdentifier, repoName, branch, storeType } = useQueryParams<GitQueryParams>()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { supportingGitSimplification } = useAppStore()

  const runtimeMode = isTemplatizedView(props.stepViewType)
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)
  const artifactSource = props.type && artifactSourceBaseFactory.getArtifactSource(props.type)
  const artifact =
    props.fromTrigger && props.artifact
      ? {
          ...props.artifact,
          spec: { ...defaultTo(props.artifacts, props.template.artifacts)?.primary?.spec, ...props.artifact?.spec }
        }
      : defaultTo(props.artifacts, props.template.artifacts)?.primary
  const artifactPath = 'primary'
  const selectedStage = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId).stage
  const pipelineIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.pipelineIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.pipeline')) ?? _pipelineIdentifier
  const projectIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.projectIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.project')) ?? _projectIdentifier
  const orgIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.orgIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.org')) ?? _orgIdentifier

  useEffect(() => {
    /* istanbul ignore else */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const artifacTriggerData = getPrimaryInitialValues(
        props.initialValues,
        props.formik,
        props.stageIdentifier,
        props.artifactPath as string
      )
      !isEmpty(artifacTriggerData) &&
        props.formik.setFieldValue(`${props.path}.artifacts.${props.artifactPath}`, artifacTriggerData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return artifactSource ? (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Artifacts`}>
      <div className={css.subheading}>
        {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
      </div>
      <div className={cx(css.nestedAccordions, css.artifactsAccordion)}>
        <Text className={css.inputheader}>{getString('primaryArtifactText')}</Text>
        {artifactSource.renderContent({
          ...props,
          isArtifactsRuntime,
          isPrimaryArtifactsRuntime,
          isSidecarRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier: supportingGitSimplification && storeType === StoreType.REMOTE ? repoName : repoIdentifier,
          branch,
          artifactPath,
          isSidecar: false,
          artifact
        })}
      </div>
    </div>
  ) : null
}
