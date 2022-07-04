/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StartupScriptBase, StartupScriptRenderProps } from '@cd/factory/StartupScriptFactory/StartupScriptBase'
import { Connectors } from '@connectors/constants'
import GitStartupScriptContent from './GitStartupScriptContent'

export class GitStartupScript extends StartupScriptBase<StartupScriptRenderProps> {
  protected startupScriptType = Connectors.GIT

  renderContent(props: StartupScriptRenderProps): JSX.Element | null {
    if (!props.isStartupScriptRuntime) {
      return null
    }

    return <GitStartupScriptContent {...props} />
  }
}
