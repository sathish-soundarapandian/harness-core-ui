/*
 * Copyright 2021 Harness Inc. All rights reserved.
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
import configFileSourceBaseFactory from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConfigFile } from 'services/cd-ng'
import type { KubernetesConfigFilesProps } from '../K8sServiceSpecInterface'
import { isRuntimeMode } from '../K8sServiceSpecHelper'
import { fromPipelineInputTriggerTab, getManifestTriggerSetValues } from '../ManifestSource/ManifestSourceUtils'
import css from '../KubernetesManifests/KubernetesManifests.module.scss'

interface ConfigFileInputFieldProps extends KubernetesConfigFilesProps {
  configFile: ConfigFile
}
const ConfigFileInputField = (props: ConfigFileInputFieldProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isConfigFileRuntime = runtimeMode && !!get(props.template, 'configFiles', false)

  const configFileSource = configFileSourceBaseFactory.getConfigFileSource(props?.configFile?.spec?.store?.type)
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

  if (!configFileSource) {
    return null
  }
  return (
    <div key={props.configFile?.identifier}>
      <Text className={css.inputheader} margin={{ top: 'medium' }}>
        {!props.fromTrigger && get(props.configFile, 'identifier', '')}
      </Text>
      {configFileSource &&
        configFileSource.renderContent({
          ...props,
          isConfigFileRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          configFile: configFileDefaultValue
        })}
    </div>
  )
}
export function KubernetesConfigFiles(props: KubernetesConfigFilesProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Manifests`}>
      {!props.fromTrigger && (
        <div className={css.subheading}>
          123
          {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        </div>
      )}
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
