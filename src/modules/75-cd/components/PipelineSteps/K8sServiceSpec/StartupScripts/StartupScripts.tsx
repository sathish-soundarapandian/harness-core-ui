/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text } from '@harness/uicore'
import startupScriptBaseFactory from '@cd/factory/StartupScriptFactory/StartupScriptFactory'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StoreConfigWrapper } from 'services/cd-ng'
import type { StartupScriptsProps } from '../K8sServiceSpecInterface'
import { isRuntimeMode } from '../K8sServiceSpecHelper'
import css from '../KubernetesManifests/KubernetesManifests.module.scss'

const StartupScriptInputField = (props: StartupScriptsProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isStartupScriptRuntime = runtimeMode && !!get(props.template, 'startupScript', false)

  const startupScriptSource = startupScriptBaseFactory.getStartupScript(props.startupScript?.type as string)
  const startupScriptDefaultValue = defaultTo(props.startupScript, props.template.startupScript) as StoreConfigWrapper

  if (!startupScriptSource) {
    return null
  }
  return (
    <div>
      <Text className={css.inputheader} margin={{ top: 'medium' }}>
        {!props.fromTrigger && get(props.startupScript, 'identifier', '')}
      </Text>
      {startupScriptSource &&
        startupScriptSource.renderContent({
          ...props,
          isStartupScriptRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          startupScript: startupScriptDefaultValue
        })}
    </div>
  )
}
export function StartupScripts(props: StartupScriptsProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.StartupScripts`}
    >
      {!props.fromTrigger && <div className={css.subheading}>{getString('pipeline.startupScript.name')}</div>}
      <StartupScriptInputField
        {...props}
        startupScript={props.startupScript}
        startupScriptPath={'startupScript'}
        key={'startupScript'}
      />
    </div>
  )
}
