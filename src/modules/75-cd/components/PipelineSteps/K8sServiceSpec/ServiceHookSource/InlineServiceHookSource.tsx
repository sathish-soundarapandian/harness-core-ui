/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import {
  ServiceHookSourceBase,
  ServiceHookSourceRenderProps
} from '@cd/factory/ServiceHookSourceFactory/ServiceHookSourceBase'
import { ServiceHooksMap } from '@pipeline/components/ServiceHooks/ServiceHooksHelper'
import ServiceHookFileContent from './ServiceHooksSourceContent'

export class InlineServiceHookSource extends ServiceHookSourceBase<ServiceHookSourceRenderProps> {
  protected serviceHookType = ServiceHooksMap.Inline

  renderContent(props: ServiceHookSourceRenderProps): JSX.Element | null {
    /* istanbul ignore next */
    if (!props.isServiceHookRuntime) {
      return null
    }
    return <ServiceHookFileContent {...props} />
  }
}
