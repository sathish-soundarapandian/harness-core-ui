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
import manifestSourceBaseFactory from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ManifestConfig } from 'services/cd-ng'
import type { KubernetesManifestsProps } from '../K8sServiceSpecInterface'
import { isRuntimeMode } from '../K8sServiceSpecHelper'
import { fromPipelineInputTriggerTab, getManifestTriggerSetValues } from '../ManifestSource/ManifestSourceUtils'
import css from './KubernetesManifests.module.scss'

interface ManifestInputFieldProps extends KubernetesManifestsProps {
  manifest: ManifestConfig
}
const ManifestInputField = (props: ManifestInputFieldProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isManifestsRuntime = runtimeMode && !!get(props.template, 'manifests', false)

  const manifestSource = manifestSourceBaseFactory.getManifestSource(props.manifest.type)
  const manifestDefaultValue = defaultTo(props.manifests, props.template.manifests)?.find(
    manifestData => manifestData?.manifest?.identifier === props.manifest?.identifier
  )?.manifest as ManifestConfig

  useEffect(() => {
    /* instanbul ignore else */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const manifestTriggerData = getManifestTriggerSetValues(
        props.initialValues,
        props.formik,
        props.stageIdentifier,
        props.manifestPath as string
      )
      !isEmpty(manifestTriggerData) &&
        props.formik.setFieldValue(`${props.path}.${props.manifestPath}`, manifestTriggerData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!manifestSource) {
    return null
  }
  return (
    <div key={props.manifest?.identifier}>
      <Text className={css.inputheader} margin={{ top: 'medium' }}>
        {!props.fromTrigger && get(props.manifest, 'identifier', '')}
      </Text>
      {manifestSource &&
        manifestSource.renderContent({
          ...props,
          isManifestsRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          manifest: manifestDefaultValue
        })}
    </div>
  )
}
export function KubernetesManifests(props: KubernetesManifestsProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Manifests`}>
      {!props.fromTrigger && (
        <div className={css.subheading}>
          {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        </div>
      )}
      {props.template.manifests?.map((manifestObj, index) => {
        if (!manifestObj?.manifest || !props.template.manifests?.length) {
          return null
        }
        const manifestPath = `manifests[${index}].manifest`

        return (
          <ManifestInputField
            {...props}
            manifest={manifestObj.manifest}
            manifestPath={manifestPath}
            key={manifestObj.manifest?.identifier}
          />
        )
      })}
    </div>
  )
}
