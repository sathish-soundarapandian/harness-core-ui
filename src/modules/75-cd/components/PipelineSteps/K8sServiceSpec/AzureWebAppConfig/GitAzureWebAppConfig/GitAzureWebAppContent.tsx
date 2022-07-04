/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import type { AzureWebAppConfigRenderProps } from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigtBase'
import GitAzureWebAppConfigRuntimeFields from './GitAzureWebAppRuntimeFields'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const GitAzureWebAppConfigContent = (props: AzureWebAppConfigRenderProps): React.ReactElement => {
  return (
    <Layout.Vertical data-name="azureWebAppConfig" className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
      <GitAzureWebAppConfigRuntimeFields {...props} />
    </Layout.Vertical>
  )
}

export default GitAzureWebAppConfigContent
