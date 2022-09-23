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
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { SidecarArtifact } from 'services/cd-ng'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import type { KubernetesArtifactsProps } from '../../K8sServiceSpecInterface'
import { fromPipelineInputTriggerTab, getSidecarInitialValues } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

const ArtifactInputField = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const artifactSource = props.artifact ? artifactSourceBaseFactory.getArtifactSource(props.artifact.type) : null
  const runtimeMode = isTemplatizedView(props.stepViewType)
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)

  const artifactDefaultValue = defaultTo(props.artifacts, props.template.artifacts)?.sidecars?.find(
    artifactData => artifactData.sidecar?.identifier === (props.artifact as SidecarArtifact).identifier
  )?.sidecar

  useEffect(() => {
    /* instanbul ignore else */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const artifacTriggerData = getSidecarInitialValues(
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

  if (!artifactSource) {
    return null
  }
  return (
    <div key={(props.artifact as SidecarArtifact).identifier}>
      <Text className={css.inputheader}>{get(props.artifact, 'identifier', '')}</Text>
      {artifactSource &&
        artifactSource.renderContent({
          ...props,
          isArtifactsRuntime,
          isPrimaryArtifactsRuntime,
          isSidecarRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          isSidecar: true,
          artifact: artifactDefaultValue
        })}
    </div>
  )
}

export const KubernetesSidecarArtifacts = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const { getString } = useStrings()

  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.Artifacts.Sidecars`}
    >
      {!!props.template?.artifacts?.sidecars?.length && (
        <>
          <Text className={css.inputheader}>{getString('sidecarArtifactText')}</Text>
          {props.template?.artifacts?.sidecars?.map((sidecarObj, index) => {
            if (!sidecarObj?.sidecar) {
              return null
            }

            const artifactPath = `sidecars[${index}].sidecar`
            return (
              <ArtifactInputField
                {...props}
                artifact={sidecarObj.sidecar}
                artifactPath={artifactPath}
                key={sidecarObj.sidecar?.identifier}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
