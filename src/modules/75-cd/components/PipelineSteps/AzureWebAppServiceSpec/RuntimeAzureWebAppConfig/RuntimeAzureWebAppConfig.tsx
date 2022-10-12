/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import cx from 'classnames'
import azureWebAppConfigBaseFactory from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigFactory'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StoreConfigWrapper } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { ApplicationConfigProps, AzureWebAppConfigType } from '../AzureWebAppServiceSpecInterface.types'
import { fileTypes } from '../AzureWebAppStartupScriptSelection/StartupScriptInterface.types'
import css from './RuntimeAzureWebAppConfig.module.scss'

const AzureWebAppConfigInputField = (props: ApplicationConfigProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const runtimeMode = isTemplatizedView(props.stepViewType)

  const isAzureWebAppConfigRuntime = runtimeMode && !!get(props.template, props.azureWebAppConfigPath as string, false)

  const azureWebAppConfigSource = azureWebAppConfigBaseFactory.getAzureWebAppConfig(Connectors.GIT)
  const azureWebAppConfigDefaultValue = defaultTo(
    props.azureWebAppConfig,
    get(props.template, props.type as string)
  ) as StoreConfigWrapper

  /* istanbul ignore next */
  if (!azureWebAppConfigSource) {
    return null
  }

  if (props.azureWebAppConfig?.store?.type === 'Harness') {
    if (props.azureWebAppConfig?.store.spec.secretFiles) {
      return (
        <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
          <FileStoreList
            name={`${props.path}.${props.type}.store.spec.secretFiles`}
            type={fileTypes.ENCRYPTED}
            allowOnlyOne={true}
            formik={props.formik}
          />
        </Layout.Vertical>
      )
    }
    return (
      <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
        <FileStoreList
          name={`${props.path}.${props.type}.store.spec.files`}
          type={fileTypes.FILE_STORE}
          allowOnlyOne={true}
          formik={props.formik}
        />
      </Layout.Vertical>
    )
  }
  return (
    <div>
      {azureWebAppConfigSource &&
        azureWebAppConfigSource.renderContent({
          ...props,
          isAzureWebAppConfigRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          azureWebAppConfig: azureWebAppConfigDefaultValue
        })}
    </div>
  )
}
export function ApplicationConfig(props: ApplicationConfigProps): React.ReactElement {
  const { getString } = useStrings()

  const getPathLabel = (type: AzureWebAppConfigType | undefined): string => {
    switch (type) {
      case AzureWebAppConfigType.applicationSettings:
        return getString('pipeline.appServiceConfig.applicationSettings.filePath')
      case AzureWebAppConfigType.connectionStrings:
        return getString('pipeline.appServiceConfig.connectionStrings.filePath')
      case AzureWebAppConfigType.startupCommand:
        return getString('pipeline.startupCommand.scriptFilePath')
      /* istanbul ignore next */
      default:
        return ''
    }
  }

  const getHeading = (type: AzureWebAppConfigType | undefined): string => {
    switch (type) {
      case AzureWebAppConfigType.applicationSettings:
        return getString('pipeline.appServiceConfig.applicationSettings.name')
      case AzureWebAppConfigType.connectionStrings:
        return getString('pipeline.appServiceConfig.connectionStrings.name')
      case AzureWebAppConfigType.startupCommand:
        return getString('pipeline.startupCommand.name')
      /* istanbul ignore next */
      default:
        return ''
    }
  }
  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.AzureWebAppConfig`}
    >
      {!props.fromTrigger && <div className={css.subheading}>{getHeading(props.type)}</div>}
      <AzureWebAppConfigInputField
        {...props}
        azureWebAppConfig={props.azureWebAppConfig}
        azureWebAppConfigPath={props.type}
        key={props.type}
        type={props.type}
        pathLabel={getPathLabel(props.type)}
      />
    </div>
  )
}
