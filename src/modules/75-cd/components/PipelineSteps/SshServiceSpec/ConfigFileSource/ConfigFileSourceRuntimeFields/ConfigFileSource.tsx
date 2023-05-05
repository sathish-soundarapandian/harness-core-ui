/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { ConfigFilesMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import GitConfigFileStoreRuntimeFields from './GitConfigFileRuntimeField'
import HarnessFSConfigFileRuntimeField from './HarnessFSConfigFileRuntimeField'
import css from './GitConfigFileRuntimeField.module.scss'

interface ConfigFileValuesYamlConfigFileRenderProps extends ConfigFileSourceRenderProps {
  formik?: any
}
const ConfigFileSource = (props: ConfigFileValuesYamlConfigFileRenderProps): React.ReactElement => {
  return (
    <Layout.Vertical
      data-name="config-files"
      key={props.configFile?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {props.configFile?.spec.store.type === ConfigFilesMap.Harness ? (
        <HarnessFSConfigFileRuntimeField {...props} />
      ) : (
        <GitConfigFileStoreRuntimeFields {...props} />
      )}
    </Layout.Vertical>
  )
}

export default ConfigFileSource
