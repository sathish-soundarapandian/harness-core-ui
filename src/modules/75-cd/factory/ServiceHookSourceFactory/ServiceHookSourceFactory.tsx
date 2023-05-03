/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { InlineServiceHookSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ServiceHookSource/InlineServiceHookSource'
import type { ServiceHookSourceBase } from './ServiceHookSourceBase'

export class ServiceHookSourceBaseFactory {
  protected serviceHookSourceDict: Map<string, ServiceHookSourceBase<unknown>>

  constructor() {
    this.serviceHookSourceDict = new Map()
  }

  getServiceHookSource<T>(serviceHookSourceType: string): ServiceHookSourceBase<T> | undefined {
    if (serviceHookSourceType) {
      return this.serviceHookSourceDict.get(serviceHookSourceType) as ServiceHookSourceBase<T>
    }
  }

  registerServiceHookSource<T>(serviceHookSource: ServiceHookSourceBase<T>): void {
    this.serviceHookSourceDict.set(serviceHookSource.getServiceHookSourceType(), serviceHookSource)
  }

  deRegisterServiceHookSource(serviceHookSourceType: string): void {
    this.serviceHookSourceDict.delete(serviceHookSourceType)
  }
}

const serviceHookSourceBaseFactory = new ServiceHookSourceBaseFactory()
serviceHookSourceBaseFactory.registerServiceHookSource(new InlineServiceHookSource())

export default serviceHookSourceBaseFactory
