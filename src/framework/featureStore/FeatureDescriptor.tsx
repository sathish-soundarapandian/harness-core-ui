/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { String } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'

export const FeatureDescriptor: { [key: string]: React.ReactElement } = {
  MULTIPLE_ORGANIZATIONS: <String stringID="projectsOrgs.multipleOrganizations" />,
  MULTIPLE_PROJECTS: <String stringID="projectsOrgs.multipleProjects" />,
  SECRET_MANAGERS: <String stringID="secretManagers" />,
  TEMPLATE_SERVICE: <String stringID="templatesLibrary.addNewTemplate" />,
  SAML_SUPPORT: <String stringID="authSettings.samlSupport" />,
  OAUTH_SUPPORT: <String stringID="authSettings.oauthSupport" />,
  TWO_FACTOR_AUTH_SUPPORT: <String stringID="authSettings.twoFactorAuthSupport" />,
  CUSTOM_ROLES: <String stringID="rbac.customRoles" />,
  CUSTOM_RESOURCE_GROUPS: <String stringID="rbac.customResourceGroups" />,
  DEPLOYMENTS_PER_MONTH: <String stringID="deploymentsText" />,
  INTEGRATED_APPROVALS_WITH_JIRA: <String stringID="pipeline.featureRestriction.integratedApprovalsJira" />
}

const CustomFeatureDescriptorMap: Record<string, keyof StringsMap> = {
  BUILDS: 'pipeline.featureRestriction.maxBuildsPerMonth100PercentLimit',
  MONTHLY_ACTIVE_USERS: 'cf.planEnforcement.upgradeRequiredMau',
  DEVELOPERS: 'cf.planEnforcement.upgradeRequiredDev',
  CCM_AUTOSTOPPING_RULES: 'ce.enforcementMessage.autoStoppingRules',
  PERSPECTIVES: 'ce.enforcementMessage.perspectivesLimitMsg'
}

export const customFeatureDescriptor: (
  key: string,
  getString: UseStringsReturn['getString'],
  args?: Record<string, any>
) => string = (key, getString, args) => {
  return CustomFeatureDescriptorMap[key] ? getString(CustomFeatureDescriptorMap[key], args) : ''
}
