/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode } from 'react'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'

export interface ModuleSelectionPanelProps {
  projectData?: Project
}

export type ModuleSelectionPanel = FC<ModuleSelectionPanelProps>

class ModuleSelectionFactory {
  private readonly moduleSelectionMap: Map<ModuleName, ModuleSelectionPanel>

  constructor() {
    this.moduleSelectionMap = new Map()
  }

  registerModuleSelection(moduleName: ModuleName, panel: ModuleSelectionPanel): void {
    this.moduleSelectionMap.set(moduleName, panel)
  }

  getModuleSelectionPanel(moduleName: ModuleName, projectData?: Project): ReactNode {
    const Panel = this.moduleSelectionMap.get(moduleName)

    return Panel && <Panel projectData={projectData} />
  }

  clear(): void {
    this.moduleSelectionMap.clear()
  }
}

export default new ModuleSelectionFactory()
