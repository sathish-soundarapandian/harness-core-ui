/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { GitAzureWebAppConfig } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/RuntimeAzureWebAppConfig/RuntimeGitAzureWebAppConfig/RuntimeGitAzureWebAppConfig'
import type { AzureWebAppConfigBase } from './AzureWebAppConfigBase'

export class AzureWebAppConfigBaseFactory {
  protected azureWebAppConfigDict: Map<string, AzureWebAppConfigBase<unknown>>

  constructor() {
    this.azureWebAppConfigDict = new Map()
  }

  getAzureWebAppConfig<T>(azureWebAppConfigType: string): AzureWebAppConfigBase<T> | undefined {
    if (azureWebAppConfigType) {
      return this.azureWebAppConfigDict.get(azureWebAppConfigType) as AzureWebAppConfigBase<T>
    }
  }

  registerAzureWebAppConfig<T>(azureWebAppConfig: AzureWebAppConfigBase<T>): void {
    this.azureWebAppConfigDict.set(azureWebAppConfig.getAzureWebAppConfigType(), azureWebAppConfig)
  }

  deRegisterAzureWebAppConfig(azureWebAppConfigType: string): void {
    this.azureWebAppConfigDict.delete(azureWebAppConfigType)
  }
}

const azureWebAppConfigBaseFactory = new AzureWebAppConfigBaseFactory()
azureWebAppConfigBaseFactory.registerAzureWebAppConfig(new GitAzureWebAppConfig())
export default azureWebAppConfigBaseFactory
