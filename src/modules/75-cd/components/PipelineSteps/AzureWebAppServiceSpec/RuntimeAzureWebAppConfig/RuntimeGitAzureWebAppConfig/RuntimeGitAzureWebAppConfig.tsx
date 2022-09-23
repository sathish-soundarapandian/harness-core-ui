/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AzureWebAppConfigBase,
  AzureWebAppConfigRenderProps
} from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigBase'
import { Connectors } from '@connectors/constants'
import GitAzureWebAppConfigContent from './RuntimeGitAzureWebAppContent'

export class GitAzureWebAppConfig extends AzureWebAppConfigBase<AzureWebAppConfigRenderProps> {
  protected azureWebAppConfigType = Connectors.GIT

  renderContent(props: AzureWebAppConfigRenderProps): JSX.Element | null {
    /* istanbul ignore next */
    if (!props.isAzureWebAppConfigRuntime) {
      return null
    }

    return <GitAzureWebAppConfigContent {...props} />
  }
}
