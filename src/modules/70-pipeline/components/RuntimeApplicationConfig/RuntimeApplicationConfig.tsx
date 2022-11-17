/* eslint-disable no-restricted-imports */
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
import applicationConfigBaseFactory from '@cd/factory/ApplicationConfigFactory/ApplicationConfigFactory'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StoreConfigWrapper } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import {
  ApplicationConfigProps,
  ApplicationConfigType
} from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceSpecInterface.types'
import { fileTypes } from '../StartupScriptSelection/StartupScriptInterface.types'
import css from './RuntimeApplicationConfig.module.scss'

function AzureWebAppConfigInputField(props: ApplicationConfigProps): React.ReactElement | null {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const runtimeMode = isTemplatizedView(props.stepViewType)

  const isApplicationConfigRuntime = runtimeMode && !!get(props.template, props.applicationConfigPath as string, false)

  const applicationConfigSource = applicationConfigBaseFactory.getApplicationConfig(Connectors.GIT)
  const applicationConfigDefaultValue = defaultTo(
    props.applicationConfig,
    get(props.template, props.type as string)
  ) as StoreConfigWrapper

  /* istanbul ignore next */
  if (!applicationConfigSource) {
    return null
  }

  if (props.applicationConfig?.store?.type === 'Harness') {
    if (props.applicationConfig?.store.spec.secretFiles) {
      return (
        <Layout.Vertical className={cx(css.inputWidth, css.fileStoreVerticalSpacing)}>
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
      <Layout.Vertical className={cx(css.inputWidth, css.fileStoreVerticalSpacing)}>
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
      {applicationConfigSource &&
        applicationConfigSource.renderContent({
          ...props,
          isApplicationConfigRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          applicationConfig: applicationConfigDefaultValue
        })}
    </div>
  )
}
export function RuntimeApplicationConfig(props: ApplicationConfigProps): React.ReactElement {
  const { getString } = useStrings()

  const getPathLabel = (type: ApplicationConfigType | undefined): string => {
    switch (type) {
      case ApplicationConfigType.applicationSettings:
        return getString('pipeline.appServiceConfig.applicationSettings.filePath')
      case ApplicationConfigType.connectionStrings:
        return getString('pipeline.appServiceConfig.connectionStrings.filePath')
      case ApplicationConfigType.startupCommand:
      case ApplicationConfigType.startupScript:
        return getString('pipeline.startup.scriptFilePath')
      /* istanbul ignore next */
      default:
        return ''
    }
  }

  const getHeading = (type: ApplicationConfigType | undefined): string => {
    switch (type) {
      case ApplicationConfigType.applicationSettings:
        return getString('pipeline.appServiceConfig.applicationSettings.name')
      case ApplicationConfigType.connectionStrings:
        return getString('pipeline.appServiceConfig.connectionStrings.name')
      case ApplicationConfigType.startupCommand:
        return getString('pipeline.startup.command.name')
      case ApplicationConfigType.startupScript:
        return getString('pipeline.startup.script.name')
      /* istanbul ignore next */
      default:
        return ''
    }
  }
  return (
    <div
      className={cx(css.nopadLeft, css.configSection)}
      id={`Stage.${props.stageIdentifier}.Service.AzureWebAppConfig`}
    >
      {!props.fromTrigger && <div className={css.subheading}>{getHeading(props.type)}</div>}
      <AzureWebAppConfigInputField
        {...props}
        applicationConfig={props.applicationConfig}
        applicationConfigPath={props.type}
        key={props.type}
        type={props.type}
        pathLabel={getPathLabel(props.type)}
      />
    </div>
  )
}
