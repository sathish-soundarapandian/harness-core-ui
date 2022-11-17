/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { GitApplicationConfig } from '@pipeline/components/RuntimeApplicationConfig/RuntimeGitApplicationConfig/RuntimeGitApplicationConfig'
import type { ApplicationConfigBase } from './ApplicationConfigBase'

export class ApplicationConfigBaseFactory {
  protected applicationConfigDict: Map<string, ApplicationConfigBase<unknown>>

  constructor() {
    this.applicationConfigDict = new Map()
  }

  getApplicationConfig<T>(applicationConfigType: string): ApplicationConfigBase<T> | undefined {
    if (applicationConfigType) {
      return this.applicationConfigDict.get(applicationConfigType) as ApplicationConfigBase<T>
    }
  }

  registerApplicationConfig<T>(applicationConfig: ApplicationConfigBase<T>): void {
    this.applicationConfigDict.set(applicationConfig.getApplicationConfigType(), applicationConfig)
  }

  deRegisterApplicationConfig(applicationConfigType: string): void {
    this.applicationConfigDict.delete(applicationConfigType)
  }
}

const applicationConfigBaseFactory = new ApplicationConfigBaseFactory()
applicationConfigBaseFactory.registerApplicationConfig(new GitApplicationConfig())
export default applicationConfigBaseFactory
