/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { GitStartupScript } from '@cd/components/PipelineSteps/K8sServiceSpec/StartupScripts/GitStartupScript/GitStartupScript'
import type { StartupScriptBase } from './StartupScriptBase'

export class StartupScriptBaseFactory {
  protected startupScriptDict: Map<string, StartupScriptBase<unknown>>

  constructor() {
    this.startupScriptDict = new Map()
  }

  getStartupScript<T>(startupScriptType: string): StartupScriptBase<T> | undefined {
    if (startupScriptType) {
      return this.startupScriptDict.get(startupScriptType) as StartupScriptBase<T>
    }
  }

  registerStartupScript<T>(startupScript: StartupScriptBase<T>): void {
    this.startupScriptDict.set(startupScript.getStartupScriptType(), startupScript)
  }

  deRegisterStartupScript(startupScriptType: string): void {
    this.startupScriptDict.delete(startupScriptType)
  }
}

const startupScriptBaseFactory = new StartupScriptBaseFactory()
startupScriptBaseFactory.registerStartupScript(new GitStartupScript())
export default startupScriptBaseFactory
