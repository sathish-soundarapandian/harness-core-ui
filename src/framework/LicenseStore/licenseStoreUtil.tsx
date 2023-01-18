/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Editions } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import type { Module, ModuleName } from 'framework/types/ModuleName'

export interface VersionMap {
  [key: string]: number
}

export enum LICENSE_STATE_VALUES {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED',
  NOT_STARTED = 'NOT_STARTED'
}

export const defaultLicensesByModule: {
  [key in ModuleName]?: {
    edition: Editions
  }
} = {
  CD: {
    edition: Editions.FREE
  },
  CI: {
    edition: Editions.FREE
  },
  CF: {
    edition: Editions.FREE
  },
  CE: {
    edition: Editions.FREE
  },
  // TODO: change to free when free plan is supported
  CHAOS: {
    edition: Editions.ENTERPRISE
  },
  CV: {
    edition: Editions.FREE
  }
}

export const getLicenseStateNameByModuleType = (moduleName: Module): string =>
  `${moduleName.toUpperCase()}_LICENSE_STATE`

const DEFAULT_PROJECT_ID = 'default_project'
const DEFAULT_ORG = 'default'
export const getModuleToDefaultURLMap = (accountId: string, module: Module): { [key: string]: string } => ({
  ci: routes.toGetStartedWithCI({
    accountId,
    module,
    projectIdentifier: DEFAULT_PROJECT_ID,
    orgIdentifier: DEFAULT_ORG
  }),
  cd: routes.toGetStartedWithCD({
    accountId,
    module,
    projectIdentifier: DEFAULT_PROJECT_ID,
    orgIdentifier: DEFAULT_ORG
  }),
  cf: routes.toCFOnboarding({
    accountId,
    projectIdentifier: DEFAULT_PROJECT_ID,
    orgIdentifier: DEFAULT_ORG
  }),
  ce: routes.toCEOverview({
    accountId
  }),
  cv: routes.toCVHome({
    accountId
  }),
  chaos: routes.toModuleHome({
    accountId,
    module
  })
})
