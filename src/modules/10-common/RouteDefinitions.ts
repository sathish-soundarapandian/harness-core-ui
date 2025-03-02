/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import qs from 'qs'
import { omit as _omit } from 'lodash-es'
import { getEnvServiceRoute, getScopeBasedRoute, withAccountId } from '@common/utils/routeUtils'
import type {
  OrgPathProps,
  ConnectorPathProps,
  SecretsPathProps,
  DelegatePathProps,
  DelegateConfigProps,
  ProjectPathProps,
  PipelinePathProps,
  TriggerPathProps,
  GitOpsAppPathProps,
  GitOpsAppQueryParams,
  ExecutionPathProps,
  FeatureFlagPathProps,
  BuildPathProps,
  CVDataSourceTypePathProps,
  EnvironmentPathProps,
  AccountPathProps,
  SegmentPathProps,
  PipelineType,
  InputSetPathProps,
  TargetPathProps,
  ModulePathParams,
  RolePathProps,
  ResourceGroupPathProps,
  UserGroupPathProps,
  UserPathProps,
  PipelineStudioQueryParams,
  RunPipelineQueryParams,
  GitQueryParams,
  ModuleHomeParams,
  InputSetGitQueryParams,
  SubscriptionQueryParams,
  ServiceAccountPathProps,
  ServicePathProps,
  TemplateStudioPathProps,
  TemplateStudioQueryParams,
  GovernancePathProps,
  PipelineLogsPathProps,
  EnvironmentGroupPathProps,
  EnvironmentGroupQueryParams,
  VariablesPathProps,
  EnvironmentQueryParams,
  AccountLevelGitOpsPathProps,
  TemplateType,
  AccountRoutePlacement,
  ExecutionQueryParams,
  ServiceOverridesQueryParams
} from '@common/interfaces/RouteInterfaces'

const CV_HOME = `/cv/home`

const routes = {
  toMainDashboard: withAccountId(() => '/main-dashboard'),
  toHome: withAccountId(() => '/home'),
  toGenericError: withAccountId(() => '/error'),
  toSetup: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: ''
      })
    }
  ),
  toDefaultSettings: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/default-settings`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toFreezeWindows: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `freeze-windows`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toFreezeWindowStudio: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      accountId: _accountId,
      windowIdentifier,
      ...rest
    }: Partial<{ windowIdentifier: string; sectionId?: string } & ProjectPathProps & ModulePathParams>) => {
      // TemplateStudioPathProps
      const queryString = qs.stringify(rest, { skipNulls: true })
      let path
      if (queryString.length > 0) {
        path = `freeze-windows/studio/window/${windowIdentifier}/?${queryString}`
      } else {
        path = `freeze-windows/studio/window/${windowIdentifier}/`
      }
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toUser: withAccountId(() => '/user'),
  toBilling: withAccountId(() => '/settings/billing'),
  toSubscriptions: withAccountId(({ moduleCard, tab }: SubscriptionQueryParams) => {
    const url = '/settings/subscriptions'
    if (moduleCard && tab) {
      return url.concat(`?moduleCard=${moduleCard}&&tab=${tab}`)
    }
    if (moduleCard) {
      return url.concat(`?moduleCard=${moduleCard}`)
    }
    if (tab) {
      return url.concat(`?tab=${tab}`)
    }
    return url
  }),
  toAccountSettings: withAccountId(() => '/settings'),
  toAccountSettingsOverview: withAccountId(() => '/settings/overview'),
  toAuthenticationSettings: withAccountId(() => '/settings/authentication'),
  toAccountConfiguration: withAccountId(() => '/settings/authentication/configuration'),
  toAccountActivityLog: withAccountId(() => '/settings/authentication/activity-log'),
  toAccountTicketSettings: withAccountId(() => `/settings/tickets`),

  // Governance
  toGovernance: withAccountId(({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier,
        module
      },
      path: 'governance'
    })
  ),
  toGovernancePolicyDashboard: withAccountId(({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier,
        module
      },
      path: 'governance/dashboard'
    })
  ),
  toGovernancePolicyListing: withAccountId(({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier,
        module
      },
      path: 'governance/policies'
    })
  ),
  toGovernanceNewPolicy: withAccountId(({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier,
        module
      },
      path: 'governance/policies/new'
    })
  ),
  toGovernanceEditPolicy: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      policyIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams> & {
      policyIdentifier: string
    }) =>
      getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `governance/policies/edit/${policyIdentifier}`
      })
  ),
  toGovernanceViewPolicy: withAccountId(
    ({ orgIdentifier, projectIdentifier, policyIdentifier, module }: GovernancePathProps) =>
      getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `governance/policies/view/${policyIdentifier}`
      })
  ),
  toGovernancePolicySetsListing: withAccountId(({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier
      },
      path: 'governance/policy-sets'
    })
  ),
  toGovernancePolicySetDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, policySetIdentifier, module }: GovernancePathProps) =>
      getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `governance/policy-sets/${policySetIdentifier}`
      })
  ),
  toGovernanceEvaluationsListing: withAccountId(({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    getScopeBasedRoute({
      scope: {
        orgIdentifier,
        projectIdentifier,
        module
      },
      path: 'governance/policy-evaluations'
    })
  ),
  toGovernanceEvaluationDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, evaluationId, module }: GovernancePathProps) =>
      getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `governance/policy-evaluations/${evaluationId}`
      })
  ),

  toLogin: (): string => '/login',
  toRedirect: (): string => `/redirect`,
  toSignup: (): string => '/signup',
  toPurpose: withAccountId(() => '/purpose'),
  //user profile
  toUserProfile: withAccountId(() => '/user/profile'),
  toUserPreferences: withAccountId(() => '/user/preferences'),
  // account resources
  toCreateConnectorFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/connectors/yaml/create-connector`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toAccountResources: withAccountId(() => 'settings/resources'),
  toAccountSMTP: withAccountId(() => 'settings/resources/smtp'),
  toConnectors: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/connectors`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toConnectorDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      connectorId,
      module
    }: Partial<ProjectPathProps & ModulePathParams & ConnectorPathProps>) => {
      const path = `resources/connectors/${connectorId}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toFileStore: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/file-store`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toVariables: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/variables`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toVariableDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      variableId
    }: Partial<ProjectPathProps & ModulePathParams & VariablesPathProps>) => {
      const path = `resources/variables/${variableId}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toSecrets: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/secrets`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  toSecretDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegates: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/delegates`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegateList: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/delegates/list`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegatesDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegatePathProps>) => {
      const path = `resources/delegate/${delegateIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegateConfigs: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/delegates/configs`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegateConfigsDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateConfigIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegateConfigProps>) => {
      const path = `resources/delegates/configs/${delegateConfigIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toDelegateTokens: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = 'resources/delegates/tokens'
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toEditDelegateConfigsDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      delegateConfigIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & DelegateConfigProps>) => {
      const path = `resources/delegates/configs/${delegateConfigIdentifier}/edit`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toAccessControl: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toAuditTrail: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `audit-trail`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toServiceAccounts: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/service-accounts`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toServiceAccountDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      serviceAccountIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & ServiceAccountPathProps>) => {
      const path = `access-control/service-accounts/${serviceAccountIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUsers: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/users`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      userIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & UserPathProps>) => {
      const path = `access-control/users/${userIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserGroups: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/user-groups`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toUserGroupDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      userGroupIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & UserGroupPathProps>) => {
      const path = `access-control/user-groups/${userGroupIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourceGroups: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/resource-groups`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toRoles: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `access-control/roles`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toRoleDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      roleIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & RolePathProps>) => {
      const path = `access-control/roles/${roleIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toResourceGroupDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      resourceGroupIdentifier
    }: Partial<ProjectPathProps & ModulePathParams & ResourceGroupPathProps>) => {
      const path = `access-control/resource-groups/${resourceGroupIdentifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toOrganizations: withAccountId(() => `/settings/organizations`),
  toOrganizationDetails: withAccountId(
    ({ orgIdentifier }: OrgPathProps) => `/settings/organizations/${orgIdentifier}/details`
  ),
  toOrganizationTicketSettings: withAccountId(
    ({ orgIdentifier }: OrgPathProps) => `/settings/organizations/${orgIdentifier}/setup/tickets`
  ),
  toCreateSecretFromYaml: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/secrets/yaml/create-secret`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toSecretDetailsOverview: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}/overview`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toSecretDetailsReferences: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      secretId
    }: Partial<ProjectPathProps & ModulePathParams & SecretsPathProps>) => {
      const path = `resources/secrets/${secretId}/references`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),

  /********************************************************************************************************************/
  toCD: withAccountId(() => `/cd`),
  toCDDashboard: withAccountId(() => `/cd`),
  toModuleHome: withAccountId(({ module, source }: ModuleHomeParams) => {
    if (source) {
      return `/${module}/home?source=${source}`
    }
    return `/${module}/home`
  }),
  toModuleTrialHome: withAccountId(({ module, source }: ModuleHomeParams) => {
    if (source) {
      return `/${module}/home/trial?source=${source}`
    }
    return `/${module}/home/trial`
  }),
  toCDHome: withAccountId(() => `/cd/home`),
  toCDProject: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps & ModulePathParams>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toDeployments: withAccountId(({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) => {
    const basePath = module || 'home'
    return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/deployments`
  }),
  toGetStartedWithCI: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/get-started`
  ),
  toGetStartedWithCD: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/get-started`
  ),
  toCDOnboardingWizard: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/cd-onboarding`
  ),
  toPipelineStudio: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & PipelineStudioQueryParams & RunPipelineQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      const basePath = module || 'home'

      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio/?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio/`
      }
    }
  ),
  toPipelineStudioV1: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & PipelineStudioQueryParams & RunPipelineQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      const basePath = module || 'home'

      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio-v1/?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/pipeline-studio-v1`
      }
    }
  ),
  toPipelines: withAccountId(({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) => {
    return module
      ? `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines`
      : `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines`
  }),
  toGitOps: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: PipelineType<ProjectPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/gitops`
  ),
  toAccountResourcesGitOps: withAccountId(({ entity }: AccountLevelGitOpsPathProps) => {
    const path = `resources/gitops/${entity}`
    return getScopeBasedRoute({
      scope: {},
      path
    })
  }),
  toGitOpsApplication: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      applicationId,
      ...rest
    }: GitOpsAppPathProps & ModulePathParams & GitOpsAppQueryParams) => {
      const queryString = qs.stringify(_omit(rest, 'accountId'), { skipNulls: true })
      if (queryString.length > 0) {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/gitops/applications/${applicationId}?${queryString}`
      } else {
        return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/gitops/applications/${applicationId}`
      }
    }
  ),
  toServices: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      accountRoutePlacement
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }>) => {
      return getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: 'services',
        accountRoutePlacement
      })
    }
  ),
  toMonitoredServices: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }>) => {
      return module
        ? `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoredservices`
        : `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoredservices`
    }
  ),
  toMonitoredServicesConfigurations: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      identifier
    }: Partial<
      ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement; identifier: string }
    >) => {
      return module
        ? `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoredservices/configurations/${identifier}`
        : `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoredservices/configurations/${identifier}`
    }
  ),
  toServiceStudio: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      serviceId,
      module,
      accountRoutePlacement
    }: Partial<
      ProjectPathProps & ModulePathParams & ServicePathProps & { accountRoutePlacement?: AccountRoutePlacement }
    >) => {
      return getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `services/${serviceId}`,
        accountRoutePlacement
      })
    }
  ),
  toEnvironment: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      accountRoutePlacement
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }>) => {
      return getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: 'environments',
        accountRoutePlacement
      })
    }
  ),
  toEnvironmentGroups: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      accountRoutePlacement
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }>) => {
      return getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: 'environments/groups',
        accountRoutePlacement
      })
    }
  ),
  toEnvironmentDetails: withAccountId(
    ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      environmentIdentifier,
      accountRoutePlacement,
      ...rest
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }> &
      EnvironmentQueryParams &
      EnvironmentPathProps) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      const routePath = getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `environments/${environmentIdentifier}/details`,
        accountRoutePlacement
      })

      return queryString.length > 0 ? `${routePath}?${queryString}` : routePath
    }
  ),
  toEnvironmentGroupDetails: withAccountId(
    ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      environmentGroupIdentifier,
      accountRoutePlacement,
      ...rest
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }> &
      EnvironmentGroupQueryParams &
      EnvironmentGroupPathProps) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      const routePath = getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: `environments/groups/${environmentGroupIdentifier}/details`,
        accountRoutePlacement
      })

      return queryString.length > 0 ? `${routePath}?${queryString}` : routePath
    }
  ),
  toServiceOverrides: withAccountId(
    ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      accountRoutePlacement,
      ...rest
    }: Partial<ProjectPathProps & ModulePathParams & { accountRoutePlacement?: AccountRoutePlacement }> &
      ServiceOverridesQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })

      const routePath = getEnvServiceRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path: 'serviceOverrides',
        accountRoutePlacement
      })

      return queryString.length > 0 ? `${routePath}?${queryString}` : routePath
    }
  ),
  toPipelineDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, pipelineIdentifier, module }: PipelineType<PipelinePathProps>) => {
      const basePath = module || 'home'

      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}`
    }
  ),

  toPipelineLogs: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      module,
      executionIdentifier,
      stageIdentifier,
      stepIndentifier: stepIndenitifer
    }: PipelineType<PipelineLogsPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/execution/${executionIdentifier}/logs/${stageIdentifier}/${stepIndenitifer}`
    }
  ),
  toInputSetList: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      const basePath = module || 'home'
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets`
      }
    }
  ),
  toInputSetForm: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<InputSetPathProps> & InputSetGitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets/${inputSetIdentifier}?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets/${inputSetIdentifier}`
      }
    }
  ),
  toInputSetFormV1: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<InputSetPathProps> & InputSetGitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets-v1/${inputSetIdentifier}?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/input-sets-v1/${inputSetIdentifier}`
      }
    }
  ),
  toTriggersPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers`
      }
    }
  ),
  toTriggersWizardPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      triggerType,
      sourceRepo,
      manifestType,
      artifactType,
      scheduleType,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<TriggerPathProps> & GitQueryParams) => {
      const isNewTrigger = triggerIdentifier === 'new'
      const queryParams = {
        ...rest,
        ...(isNewTrigger && triggerType && { triggerType }),
        ...(isNewTrigger && sourceRepo && { sourceRepo }),
        ...(isNewTrigger && manifestType && { manifestType }),
        ...(isNewTrigger && artifactType && { artifactType }),
        ...(isNewTrigger && scheduleType && { scheduleType })
      }
      const basePath = module || 'home'
      const queryString = qs.stringify(queryParams, { skipNulls: true })
      if (queryString.length > 0) {
        return `${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}?${queryString}`
      } else {
        return `${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}`
      }
    }
  ),
  toPipelineDeploymentList: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<PipelinePathProps> & GitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions`
      }
    }
  ),
  toTriggersDetailPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<TriggerPathProps> & GitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/detail?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/detail`
      }
    }
  ),
  toTriggersActivityHistoryPage: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      triggerIdentifier,
      accountId: _accountId,
      module,
      ...rest
    }: PipelineType<TriggerPathProps> & GitQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/activity-history?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${triggerIdentifier}/activity-history`
      }
    }
  ),
  toExecution: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}`
    }
  ),
  toExecutionPipelineView: withAccountId(
    ({
      accountId: _accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source,
      ...rest
    }: PipelineType<ExecutionPathProps> & GitQueryParams & ExecutionQueryParams) => {
      const basePath = module || 'home'
      const queryString = qs.stringify(rest, { skipNulls: true })
      if (queryString.length > 0) {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/pipeline?${queryString}`
      } else {
        return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/pipeline`
      }
    }
  ),
  toExecutionInputsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/inputs`
    }
  ),
  toExecutionArtifactsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/artifacts`
    }
  ),
  toExecutionTestsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/tests`
    }
  ),
  toExecutionCommitsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/commits`
  ),
  toExecutionPolicyEvaluationsView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/policy-evaluations`
    }
  ),
  toExecutionSecurityView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/security`
    }
  ),
  toExecutionErrorTrackingView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/cet`
    }
  ),
  toResilienceView: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      module,
      source
    }: PipelineType<ExecutionPathProps>) => {
      const basePath = module || 'home'
      return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/resilience`
    }
  ),
  /********************************************************************************************************************/
  toTemplates: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      templateType
    }: Partial<(ProjectPathProps & ModulePathParams) & { templateType?: TemplateType }>) => {
      const path = templateType ? `resources/templates?templateType=${templateType}` : 'resources/templates'
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toTemplateStudio: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      accountId: _accountId,
      templateType,
      templateIdentifier,
      ...rest
    }: Partial<TemplateStudioPathProps & ModulePathParams & TemplateStudioQueryParams>) => {
      const queryString = qs.stringify(rest, { skipNulls: true })
      let path
      if (queryString.length > 0) {
        path = `resources/template-studio/${templateType}/template/${templateIdentifier}/?${queryString}`
      } else {
        path = `resources/template-studio/${templateType}/template/${templateIdentifier}/`
      }
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  /********************************************************************************************************************/
  toCI: withAccountId(() => `/ci`),
  toCIHome: withAccountId(() => `/ci/home`),
  toCIProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCIPipelineDeploymentList: withAccountId(
    ({ projectIdentifier, orgIdentifier, pipelineIdentifier }: PipelinePathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions`
  ),
  toCIBuilds: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds`
  ),
  toCIBuildPipelineGraph: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/pipeline/graph`
  ),
  toCIBuildPipelineLog: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/pipeline/log`
  ),
  toCIBuildInputs: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/inputs`
  ),

  toCIBuildCommits: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/commits`
  ),

  toCIBuildTests: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/tests`
  ),
  toCIBuildArtifacts: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}/artifacts`
  ),
  toCIBuild: withAccountId(
    ({ orgIdentifier, projectIdentifier, buildIdentifier }: BuildPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/builds/${buildIdentifier}`
  ),
  toCIAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCIAdminBuildSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/build-settings`
  ),
  toCIAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/ci/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  //git-sync at project scope
  toGitSyncAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncReposAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/repos`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncEntitiesAdmin: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/entities`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncErrors: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/errors`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toGitSyncConfig: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `git-sync/config`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  /********************************************************************************************************************/
  toCF: (params: Partial<ProjectPathProps>) =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCFProject(params as ProjectPathProps)
      : routes.toCFDashboard(params as AccountPathProps),
  toCFDashboard: withAccountId(() => `/cf`),
  toCFHome: withAccountId(() => `/cf/home`),
  toCFProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCFProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCFFeatureFlags: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/feature-flags`
  ),
  toCFFeatureFlagsDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier, featureFlagIdentifier }: ProjectPathProps & FeatureFlagPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/feature-flags/${featureFlagIdentifier}`
  ),
  toCFTargetManagement: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management`
  ),
  toCFSegments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/target-groups`
  ),
  toCFTargets: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/targets`
  ),
  toCFSegmentDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, segmentIdentifier }: ProjectPathProps & SegmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/target-groups/${segmentIdentifier}`
  ),
  toCFSegmentDetailsWithEnv: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      segmentIdentifier,
      environmentIdentifier
    }: ProjectPathProps & SegmentPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/target-groups/${segmentIdentifier}?activeEnvironment=${environmentIdentifier}`
  ),
  toCFTargetDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, targetIdentifier }: ProjectPathProps & TargetPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/target-management/targets/${targetIdentifier}`
  ),
  toCFEnvironments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments`
  ),
  toCFEnvironmentDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier, environmentIdentifier }: ProjectPathProps & EnvironmentPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments/${environmentIdentifier}`
  ),
  toCFWorkflows: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/workflows`
  ),
  toCFAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),
  toCFAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCFOnboarding: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding`
  ),

  toCFOnboardingDetail: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding/detail`
  ),
  toCFConfigurePath: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cf/orgs/${orgIdentifier}/projects/${projectIdentifier}/configurePath`
  ),

  toCODE: withAccountId(() => `/code`),
  toCODEHome: withAccountId(() => `/code/home`),

  /********************************************************************************************************************/
  toCV: (params: Partial<ProjectPathProps>): string =>
    params.orgIdentifier && params.projectIdentifier
      ? routes.toCVProject(params as ProjectPathProps)
      : routes.toCVDashboard(params as AccountPathProps),
  toCVDashboard: withAccountId(() => `/cv`),
  toCVHome: withAccountId(() => `/cv/home`),
  toCVProject: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  ),
  toCVProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard`
  ),
  toCVDeploymentPage: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      deploymentTag,
      serviceIdentifier,
      activityId
    }: Partial<ProjectPathProps & { activityId: string }> & Record<'deploymentTag' | 'serviceIdentifier', string>) =>
      !projectIdentifier || !orgIdentifier
        ? CV_HOME
        : activityId
        ? `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/deployment/${deploymentTag}/service/${serviceIdentifier}?activityId=${activityId}`
        : `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/deployment/${deploymentTag}/service/${serviceIdentifier}`
  ),
  toCVActivityChangesPage: withAccountId(
    ({ activityId, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { activityId: string }>) =>
      !activityId || !projectIdentifier || !orgIdentifier
        ? CV_HOME
        : `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/dashboard/activity-changes/${activityId}`
  ),
  toCVDataSources: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/datasources`
  ),
  toCVServices: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/services`
  ),

  toCVChanges: withAccountId(
    ({ projectIdentifier, orgIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/changes`
  ),

  toCVMonitoringServices: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices`
    }
  ),

  toCVCodeErrors: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/eventsummary`
  ),

  toCVCodeErrorsAgents: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/agents`
  ),

  toCVCodeErrorsAgentsTokens: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/tokens`
  ),

  toCVCodeErrorsCriticalEvents: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/criticalevents`
  ),

  toCVCodeErrorsSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),

  toCVMonitoringServicesInputSets: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservicesinputset`
    }
  ),
  toCVSLOs: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/slos`
    }
  ),
  toAccountCVSLOs: withAccountId(() => {
    return `/cv/slos`
  }),
  toCVSLODetailsPage: withAccountId(
    ({
      module = 'cv',
      identifier,
      orgIdentifier,
      projectIdentifier
    }: Partial<ProjectPathProps & { identifier: string; module: string }>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/slos/${identifier}`
  ),
  toAccountCVSLODetailsPage: withAccountId(
    ({ module = 'cv', identifier }: { identifier: string; module?: string }) => `/${module}/slos/${identifier}`
  ),
  toErrorTracking: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/cet`
    }
  ),
  toCVCreateSLOs: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/slos/create`
    }
  ),
  toCVCreateCompositeSLOs: withAccountId(
    ({ orgIdentifier, projectIdentifier, module = 'cv' }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/slos/create/composite`
    }
  ),
  toAccountCVCreateCompositeSLOs: withAccountId(({ module = 'cv' }: { module?: string }) => {
    return `/${module}/slos/create/composite`
  }),
  toCVSLODowntime: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/slo-downtime`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toCVCreateSLODowntime: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `resources/slo-downtime/create`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toCVEditSLODowntime: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      module,
      identifier
    }: Partial<ProjectPathProps & ModulePathParams & { identifier: string }>) => {
      const path = `resources/slo-downtime/edit/${identifier}`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toCVAddMonitoringServicesSetup: withAccountId(
    ({ projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { identifier: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/setup`
  ),
  toAddMonitoredServices: withAccountId(
    ({ projectIdentifier, orgIdentifier, module }: Partial<ProjectPathProps & { module: string }>) => {
      return module
        ? `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/setup`
        : `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/setup`
    }
  ),
  toCVAddMonitoringServicesEdit: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      identifier,
      module = 'cv'
    }: Partial<ProjectPathProps & { identifier: string; module: string }>) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/monitoringservices/edit/${identifier}`
  ),
  toCVOnBoardingSetup: withAccountId(
    ({ dataSourceType, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & CVDataSourceTypePathProps>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/onboarding/${dataSourceType}/setup`
  ),
  toCVActivitySourceSetup: withAccountId(
    ({ activitySource, projectIdentifier, orgIdentifier }: Partial<ProjectPathProps & { activitySource?: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/activity-source-setup/${activitySource}`
  ),
  toCVActivitySourceEditSetup: withAccountId(
    ({
      activitySource,
      projectIdentifier,
      orgIdentifier,
      activitySourceId
    }: Partial<ProjectPathProps & { activitySource?: string; activitySourceId: string }>) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/activity-source-setup/${activitySource}/activity-sourceId/${activitySourceId}`
  ),
  toCVActivityDashboard: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/dashboard`
  ),
  toCVAdminActivitySources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/activity-sources`
  ),
  toCVAdminMonitoringSources: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/monitoring-sources`
  ),
  toCVAdminVerificationJobs: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/verification-jobs`
  ),
  toCVActivityDetails: withAccountId(
    ({ activityType, orgIdentifier, projectIdentifier }: ProjectPathProps & { activityType: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/activities/admin/${activityType}`
  ),
  toCVAdminGeneralSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/general-settings`
  ),
  toCVAdminGovernance: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance`
  ),
  toCVAdminSetup: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup`
  ),
  toCVAdminSetupMonitoringSource: withAccountId(
    ({ projectIdentifier, orgIdentifier, monitoringSource }: ProjectPathProps & { monitoringSource: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/monitoring-source/${monitoringSource}`
  ),
  toCVAdmin: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin`
  ),
  toCVAdminSetupMonitoringSourceEdit: withAccountId(
    ({
      projectIdentifier,
      orgIdentifier,
      monitoringSource,
      identifier
    }: ProjectPathProps & { monitoringSource: string; identifier: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/monitoring-source/${monitoringSource}/${identifier}`
  ),
  toCVAdminSetupVerificationJob: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/verification-job`
  ),
  toCVAdminSetupVerificationJobEdit: withAccountId(
    ({ projectIdentifier, orgIdentifier, verificationId }: ProjectPathProps & { verificationId: string }) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/setup/verification-job/verificationId/${verificationId}`
  ),
  toCVAdminAccessControl: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/access-control`
  ),
  toCVAdminNotifications: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/admin/notifications`
  ),
  /********************************************************************************************************************/
  toProjectDetails: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/details`
  ),
  toProjects: withAccountId(() => '/home/projects'),
  toAllProjects: withAccountId(() => '/home/projects/all'),
  toLandingDashboard: withAccountId(() => '/home/get-started'),
  /********************************************************************************************************************/
  toCE: withAccountId(() => `/ce`),
  // toCEDashboard: withAccountId(() => `/ce`),
  toCEHome: withAccountId(() => '/ce/home'),
  // toCEProject: withAccountId(
  //   ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
  //     `/ce/orgs/${orgIdentifier}/projects/${projectIdentifier}`
  // ),
  toCEProjectOverview: withAccountId(() => `/ce/dashboard`),
  toCECODashboard: withAccountId(() => `/ce/dashboard`),
  toCECOCreateGateway: withAccountId(() => `/ce/autostopping-rules/create`),
  toCECOEditGateway: withAccountId(
    ({ gatewayIdentifier }: { gatewayIdentifier: string }) => `/ce/autostopping-rules/edit/${gatewayIdentifier}`
  ),
  toCECOAccessPoints: withAccountId(() => `/ce/access-points`),
  toCECORules: withAccountId(
    ({ params }: { params: string }) => `/ce/autostopping-rules` + (params ? `?${params}` : '')
  ),
  toCECORuleDetails: withAccountId(({ id }: { id: string }) => `/ce/autostopping-rules/rule/${id}`),
  toCERecommendations: withAccountId(() => `/ce/recommendations`),
  toCERecommendationDetails: withAccountId(
    ({ recommendation, recommendationName }: { recommendation: string; recommendationName: string }) =>
      `/ce/recommendations/${recommendation}/name/${recommendationName}/details`
  ),
  toOldCENodeRecommendationDetails: withAccountId(
    ({ recommendation, recommendationName }: { recommendation: string; recommendationName: string }) =>
      `/ce/node-recommendations/${recommendation}/name/${recommendationName}/details`
  ),
  toCENodeRecommendationDetails: withAccountId(
    ({ recommendation, recommendationName }: { recommendation: string; recommendationName: string }) =>
      `/ce/recommendations/node/${recommendation}/name/${recommendationName}/details`
  ),
  toCERecommendationWorkloadDetails: withAccountId(
    ({
      recommendation,
      clusterName,
      namespace,
      workloadName,
      recommendationName
    }: {
      recommendation: string
      workloadName: string
      clusterName: string
      namespace: string
      recommendationName: string
    }) =>
      `/ce/recommendations/${recommendation}/name/${recommendationName}/cluster/${clusterName}/namespace/${namespace}/workload/${workloadName}/details`
  ),
  toCERecommendationServiceDetails: withAccountId(
    ({
      recommendation,
      clusterName,
      serviceName,
      recommendationName
    }: {
      recommendation: string
      serviceName: string
      clusterName: string
      recommendationName: string
    }) =>
      `/ce/recommendations/${recommendation}/name/${recommendationName}/cluster/${clusterName}/service/${serviceName}/details`
  ),
  toPerspectiveDetails: withAccountId(
    ({ perspectiveId, perspectiveName }: AccountPathProps & { perspectiveId: string; perspectiveName: string }) =>
      `/ce/perspectives/${perspectiveId}/name/${perspectiveName}`
  ),
  toCECreatePerspective: withAccountId(
    ({ perspectiveId }: AccountPathProps & { perspectiveId: string }) => `/ce/perspectives/${perspectiveId}/create`
  ),
  toCEPerspectives: withAccountId(() => `/ce/perspectives`),
  toCEBudgets: withAccountId(() => '/ce/budgets'),
  toCEBudgetDetailsOld: withAccountId(
    ({
      budgetId,
      budgetName
    }: AccountPathProps & {
      budgetId: string
      budgetName: string
    }) => `/ce/budget/${budgetId}/${budgetName}`
  ),
  toCEBudgetDetails: withAccountId(
    ({
      budgetId,
      budgetName
    }: AccountPathProps & {
      budgetId: string
      budgetName: string
    }) => `/ce/budgets/${budgetId}/${budgetName}`
  ),
  toCEPerspectiveWorkloadDetails: withAccountId(
    ({
      perspectiveId,
      perspectiveName,
      clusterName,
      namespace,
      workloadName
    }: AccountPathProps & {
      perspectiveId: string
      perspectiveName: string
      clusterName: string
      namespace: string
      workloadName: string
    }) =>
      `/ce/perspectives/${perspectiveId}/name/${perspectiveName}/cluster/${clusterName}/namespace/${namespace}/workload/${workloadName}/details`
  ),
  toCEPerspectiveNodeDetails: withAccountId(
    ({
      perspectiveId,
      perspectiveName,
      clusterName,
      nodeId
    }: AccountPathProps & {
      perspectiveId: string
      perspectiveName: string
      clusterName: string
      nodeId: string
    }) => `/ce/perspectives/${perspectiveId}/name/${perspectiveName}/cluster/${clusterName}/node/${nodeId}/details`
  ),
  toCEPerspectiveServiceDetails: withAccountId(
    ({
      perspectiveId,
      perspectiveName,
      clusterName,
      serviceName
    }: AccountPathProps & {
      perspectiveId: string
      perspectiveName: string
      clusterName: string
      serviceName: string
    }) =>
      `/ce/perspectives/${perspectiveId}/name/${perspectiveName}/cluster/${clusterName}/service/${serviceName}/details`
  ),
  toCEOverview: withAccountId(() => '/ce/overview'),
  toCEPerspectiveDashboard: withAccountId(() => `/ce/perspective`),
  toCEAnomalyDetection: withAccountId(() => `/ce/anomaly-detection`),
  toBusinessMapping: withAccountId(() => `/ce/cost-categories/`),
  toCEECSRecommendationDetails: withAccountId(
    ({ recommendation, recommendationName }: { recommendation: string; recommendationName: string }) =>
      `/ce/recommendations/ecs/${recommendation}/name/${recommendationName}/details`
  ),
  toCEDashboards: withAccountId(() => '/ce/bi-dashboards'),
  toCommitmentOrchestration: withAccountId(() => `/ce/commitment-orchestration`),
  toCommitmentOrchestrationSetup: withAccountId(() => `/ce/commitment-orchestration/setup`),
  toCECloudIntegration: withAccountId(() => `/ce/cloud-integrations/`),
  toCEGovernance: withAccountId(() => `/ce/governance/`),
  toCEGovernanceRules: withAccountId(() => `/ce/governance/rules/`),
  toCEGovernanceEnforcements: withAccountId(() => `/ce/governance/enforcements/`),
  toCEGovernanceEvaluations: withAccountId(() => `/ce/governance/evaluations/`),
  toCEGovernanceRuleEditor: withAccountId(
    ({ ruleId }: { ruleId: string }) => `/ce/governance/rules/${ruleId}/rule-editor/`
  ),
  toClusterOrchestrator: withAccountId(() => '/ce/compute-groups'),
  toClusterDetailsPage: withAccountId(({ id }: { id: string }) => `/ce/compute-groups/${id}/overview`),
  toClusterWorkloadsDetailsPage: withAccountId(({ id }: { id: string }) => `/ce/compute-groups/${id}/workloads`),
  toClusterNodepoolDetailsPage: withAccountId(({ id }: { id: string }) => `/ce/compute-groups/${id}/nodepool`),
  toComputeGroupsSetup: withAccountId(({ id }: { id: string }) => `/ce/compute-groups/setup/steps/${id}`),
  toCECurrencyPreferences: withAccountId(() => `/ce/currency-preferences`),
  toCEManagedServiceProvider: withAccountId(() => `/ce/managed-service-provider`),
  toCCMMFE: withAccountId(() => `/ce/new`),
  /********************************************************************************************************************/
  toSTO: withAccountId(() => `/sto`),
  toSTOHome: withAccountId(() => `/sto/home`),
  toSTOOverview: withAccountId(() => '/sto/overview'),
  toSTOProjectOverview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/sto/orgs/${orgIdentifier}/projects/${projectIdentifier}/overview`
  ),
  toSTOTargets: withAccountId(() => '/sto/targets'),
  toSTOProjectTargets: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/sto/orgs/${orgIdentifier}/projects/${projectIdentifier}/targets`
  ),
  toSTOSecurityReview: withAccountId(() => '/sto/security-review'),
  toSTOProjectSecurityReview: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/sto/orgs/${orgIdentifier}/projects/${projectIdentifier}/security-review`
  ),
  toSTOGettingStarted: withAccountId(() => '/sto/getting-started'),
  toSTOProjectGettingStarted: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/sto/orgs/${orgIdentifier}/projects/${projectIdentifier}/getting-started`
  ),
  toSTOProjectTicketSummary: withAccountId(
    ({ orgIdentifier, projectIdentifier, issueId }: ProjectPathProps & { issueId: string }) =>
      `/sto/orgs/${orgIdentifier}/projects/${projectIdentifier}/ticket-summary/${issueId}`
  ),
  toProjectTicketSettings: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: ProjectPathProps & ModulePathParams) =>
      `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/tickets`
  ),
  /********************************************************************************************************************/
  toOldCustomDashboard: withAccountId(() => '/home/dashboards*'),
  toCustomDashboard: withAccountId(() => '/dashboards'),
  toCustomDashboardHome: withAccountId(
    ({ folderId }: { folderId?: string }) => `/dashboards/folder/${folderId ? folderId : 'shared'}`
  ),
  toViewCustomDashboard: withAccountId(
    ({ viewId, folderId }: { viewId: string; folderId: string }) =>
      `/dashboards/folder/${folderId ? folderId : 'shared'}/view/${viewId}`
  ),
  toCustomFolderHome: withAccountId(() => '/dashboards/folders'),
  toViewCustomFolder: withAccountId(({ folderId }: { folderId: string }) => `/dashboards/folder/${folderId}`),

  /****************** Secret Usage************************************************************************************/

  /****************** Chaos Module ************************************************************************************/
  toChaos: withAccountId(() => `/chaos`),
  toChaosMicroFrontend: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/`
  ),

  // These RoutesDestinations are defined in the MicroFrontend
  toChaosExperiments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/experiments`
  ),
  toChaosExperiment: withAccountId(
    ({ orgIdentifier, projectIdentifier, identifier }: Partial<ProjectPathProps> & { identifier: string }) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/experiments/${identifier}/chaos-studio`
  ),
  toNewChaosExperiment: withAccountId(
    ({ orgIdentifier, projectIdentifier, identifier }: Partial<ProjectPathProps> & { identifier: string }) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/experiments/new/${identifier}/chaos-studio`
  ),
  toChaosExperimentRun: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      expIdentifier,
      expRunIdentifier
    }: Partial<ProjectPathProps> & { expIdentifier: string; expRunIdentifier: string }) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/experiments/${expIdentifier}/runs/${expRunIdentifier}`
  ),
  toChaosHubs: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/chaos-hubs`
  ),
  toChaosHub: withAccountId(
    ({ orgIdentifier, projectIdentifier, identifier }: Partial<ProjectPathProps> & { identifier: string }) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/chaos-hubs/${identifier}`
  ),
  toChaosProbes: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/probes`
  ),
  toChaosGameDays: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/gamedays`
  ),
  toChaosDashboards: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/chaos-dashboards`
  ),

  // chaos enviroments
  toChaosEnvironments: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments`
  ),
  toChaosEnvironmentDetails: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }: Partial<ProjectPathProps> & { environmentIdentifier: string }) =>
      `/chaos/orgs/${orgIdentifier}/projects/${projectIdentifier}/environments/${environmentIdentifier}`
  ),

  /*********************** IACM */
  toIACM: withAccountId(() => `/iacm`),
  toIACMOverview: withAccountId(() => `/iacm/overview`),
  toIACMMicroFrontend: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/iacm/orgs/${orgIdentifier}/projects/${projectIdentifier}/`
  ),
  toIACMWorkspaces: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/iacm/orgs/${orgIdentifier}/projects/${projectIdentifier}/workspaces`
  ),
  toIACMSetup: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/iacm/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/`
  ),
  toIACMPipelines: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps>) =>
      `/iacm/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines`
  ),
  toIACMPipelineResources: withAccountId(
    ({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      executionIdentifier,
      source
    }: PipelineType<ExecutionPathProps>) => {
      return `/iacm/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/${source}/${executionIdentifier}/resources`
    }
  ),
  // SSCA
  toSSCA: withAccountId(() => '/ssca'),
  toSSCAOverview: withAccountId(() => '/ssca/overview'),
  toAllowDenyList: withAccountId(
    ({ orgIdentifier, projectIdentifier, module }: Partial<ProjectPathProps & ModulePathParams>) => {
      const path = `allow-deny-list`
      return getScopeBasedRoute({
        scope: {
          orgIdentifier,
          projectIdentifier,
          module
        },
        path
      })
    }
  ),
  toSSCAGettingStarted: withAccountId(() => '/ssca/getting-started'),
  // IDP
  toIDPDefaultPath: withAccountId(() => '/idp-default'),
  toIDP: withAccountId(() => '/idp'),
  toIDPAdmin: withAccountId(() => '/idp-admin'),
  toGetStartedWithIDP: withAccountId(() => '/idp-admin/get-started'),
  toAdminHome: withAccountId(() => '/idp-admin/home'),
  toPluginsPage: withAccountId(() => '/idp-admin/plugins'),
  toConfigurations: withAccountId(() => '/idp-admin/configurations'),
  toLayoutConfig: withAccountId(() => '/idp-admin/layout'),
  toIDPAccessControl: withAccountId(() => '/idp-admin/access-control'),
  toConnectorsPage: withAccountId(() => '/idp-admin/connectors'),
  toIDPOAuthConfig: withAccountId(() => '/idp-admin/oauth'),

  // Error Tracking
  toCET: withAccountId(() => '/cet'),
  toCETHome: withAccountId(() => '/cet/home'),
  toCETHomeTrial: withAccountId(() => '/cet/home/trial'),
  toCETEventsSummary: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/eventsummary`
  ),

  toCETMonitoredServices: withAccountId(
    ({ orgIdentifier, projectIdentifier }: Partial<ProjectPathProps & { module?: string }>) => {
      return `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/etmonitoredservices`
    }
  ),

  toCETAgents: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/agents`
  ),

  toCETAgentsTokens: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/tokens`
  ),

  toCETCriticalEvents: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/criticalevents`
  ),

  toCETSettings: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup`
  ),

  toCETDefaultSettings: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/default-settings`
  ),

  toCETConnectors: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/connectors`
  ),

  toCETSecrets: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/secrets`
  ),

  toCETAccessControl: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/access-control`
  ),

  toCETDelegates: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/resources/delegates`
  ),

  toCETPolicies: withAccountId(
    ({ orgIdentifier, projectIdentifier }: ProjectPathProps) =>
      `/cet/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/governance/dashboard`
  ),

  toCETEventSummaryOldNotifLink: withAccountId(
    ({ projectIdentifier, orgIdentifier }: ProjectPathProps) =>
      `/cv/orgs/${orgIdentifier}/projects/${projectIdentifier}/et/eventsummary`
  )
}

export default routes
