/* eslint-disable no-restricted-imports */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  ApplicationConfigBase,
  ApplicationConfigRenderProps
} from '@cd/factory/ApplicationConfigFactory/ApplicationConfigBase'
import { Connectors } from '@connectors/constants'
import RuntimeGitApplicationConfigContent from './RuntimeGitApplicationConfigContent'

export class GitApplicationConfig extends ApplicationConfigBase<ApplicationConfigRenderProps> {
  protected applicationConfigType = Connectors.GIT

  renderContent(props: ApplicationConfigRenderProps): JSX.Element | null {
    /* istanbul ignore next */
    if (!props.isApplicationConfigRuntime) {
      return null
    }

    return <RuntimeGitApplicationConfigContent {...props} />
  }
}
