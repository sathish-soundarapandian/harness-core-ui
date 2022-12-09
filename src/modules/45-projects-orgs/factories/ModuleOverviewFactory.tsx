/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ModuleOverviewBaseProps } from '@projects-orgs/pages/LandingDashboardPageV2/ModuleOverview/Grid/ModuleOverviewGrid'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'

export interface ModuleSelectionPanelProps {
  projectData?: Project
}

export type ModuleTileOverview = React.ComponentType<ModuleOverviewBaseProps>

class ModuleOverviewFactory {
  private readonly moduleMap: Map<ModuleName, React.ComponentType<ModuleOverviewBaseProps>>

  constructor() {
    this.moduleMap = new Map()
  }

  registerModule(moduleName: NavModuleName, panel: ModuleTileOverview): void {
    this.moduleMap.set(moduleName, panel)
  }

  getModuleOverview(moduleName: NavModuleName) {
    return this.moduleMap.get(moduleName)
  }

  clear(): void {
    this.moduleMap.clear()
  }
}

export default new ModuleOverviewFactory()
