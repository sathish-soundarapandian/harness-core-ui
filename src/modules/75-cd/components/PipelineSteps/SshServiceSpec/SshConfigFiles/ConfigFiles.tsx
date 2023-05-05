/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConfigFile } from 'services/cd-ng'
import type { SshWinRmConfigFilesProps } from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpecInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import {
  fromPipelineInputTriggerTab,
  getManifestTriggerSetValues
} from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import ConfigFileSource from '../ConfigFileSource/ConfigFileSourceRuntimeFields/ConfigFileSource'
import css from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpec.module.scss'

interface ConfigFileInputFieldProps extends SshWinRmConfigFilesProps {
  configFile: ConfigFile
}
const ConfigFileInputField = (props: ConfigFileInputFieldProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isTemplatizedView(props.stepViewType)
  const isConfigFileRuntime = runtimeMode && !!get(props.template, 'configFiles', false)

  const configFileDefaultValue = props.configFiles?.find(
    configFileData => configFileData?.configFile?.identifier === props.configFile?.identifier
  )?.configFile as ConfigFile

  useEffect(() => {
    /* instanbul ignore else */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const manifestTriggerData = getManifestTriggerSetValues(
        props.initialValues,
        props.formik,
        props.stageIdentifier,
        props.configFilePath as string
      )
      !isEmpty(manifestTriggerData) &&
        props.formik.setFieldValue(`${props.path}.${props.configFilePath}`, manifestTriggerData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const commonProps = {
    projectIdentifier,
    orgIdentifier,
    accountId,
    pipelineIdentifier,
    repoIdentifier,
    branch,
    configFile: configFileDefaultValue,
    isConfigFileRuntime
  }

  return (
    <div key={props.configFile?.identifier}>
      <Text className={css.inputheader} margin={{ top: 'medium' }}>
        {!props.fromTrigger && get(props.configFile, 'identifier', '')}
      </Text>
      {isConfigFileRuntime && <ConfigFileSource {...props} {...commonProps} />}
    </div>
  )
}
export function ConfigFiles(props: SshWinRmConfigFilesProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.ConfigFiles`}>
      {!props.fromTrigger && <div className={css.subheading}> {getString('pipelineSteps.configFiles')}</div>}
      {props.template.configFiles?.map((configFileObj, index) => {
        if (!configFileObj?.configFile || !props.configFiles?.length) {
          return null
        }
        const configFilePath = `configFiles[${index}].configFile`

        return (
          <ConfigFileInputField
            {...props}
            configFile={configFileObj.configFile}
            configFilePath={configFilePath}
            key={configFileObj.configFile?.identifier}
          />
        )
      })}
    </div>
  )
}
