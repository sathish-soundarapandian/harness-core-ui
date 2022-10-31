/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import { FreezeWindowLevels, ResourcesInterface } from '@freeze-windows/types'

export const defaultContext = {
  state: { freezeObj: { identifier: '-1' }, isYamlEditable: false, oldFreezeObj: {}, isUpdated: false },
  updateFreeze: noop,
  view: 'VISUAL',
  setDrawerType: noop,
  isReadOnly: false,
  isActiveFreeze: false,
  setView: noop,
  setYamlHandler: noop,
  updateYamlView: noop,
  freezeWindowLevel: FreezeWindowLevels.ACCOUNT,
  loadingFreezeObj: false,
  isUpdatingFreeze: false,
  refetchFreezeObj: noop
}

export const resources: ResourcesInterface = {
  orgs: [],
  orgsMap: {},
  projects: [],
  projectsMap: {},
  services: [],
  servicesMap: {},
  freezeWindowLevel: FreezeWindowLevels.ACCOUNT,
  projectsByOrgId: {},
  fetchProjectsForOrgId: () => null
}
