/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect, Switch } from 'react-router-dom'
import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { requestPolicyExchange } from '@urql/exchange-request-policy'
import { get } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { MinimalLayout } from '@common/layouts'
import SessionToken from 'framework/utils/SessionToken'
// eslint-disable-next-line no-restricted-imports
import ChildAppMounter from 'microfrontends/ChildAppMounter'

import CESideNav from '@ce/components/CESideNav/CESideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { getConfig } from 'services/config'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { BannerType } from '@common/layouts/Constants'
import { FEATURE_USAGE_WARNING_LIMIT } from '@common/layouts/FeatureBanner'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import type { CCMUIAppCustomProps } from '@ce/interface/CCMUIApp.types'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import useTestConnectionModal from '@connectors/common/useTestConnectionModal/useTestConnectionModal'
import CEHomePage from './pages/home/CEHomePage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'
import CECOEditGatewayPage from './pages/co-edit-gateway/CECOEditGatewayPage'
import CECOLoadBalancersPage from './pages/co-access-points/CECOAccessPointsPage'
import CETrialHomePage from './pages/home/CETrialHomePage'

import PerspectiveDetailsPage from './pages/perspective-details/PerspectiveDetailsPage'
import CreatePerspectivePage from './pages/perspective-builder/CreatePerspectivePage'
import PerspectiveListPage from './pages/perspective-list/PerspectiveListPage'
import OverviewPage from './pages/overview/OverviewPage'
import formatCost from './utils/formatCost'
import BusinessMapping from './pages/business-mapping/BusinessMapping'
import OverviewAddCluster from './components/OverviewPage/OverviewAddCluster'
import CORuleDetailsPage from './pages/co-rule-details/CORuleDetailsPage'
import CommitmentOrchestration from './pages/CommitmentOrchestration/CommitmentOrchestration'
import CommitmentOrchestrationSetup from './pages/CommitmentOrchestration/CommitmentOrchestrationSetup'
import CloudIntegrationPage from './pages/cloud-integration/CloudIntegrationPage'
import AnomaliesFilter from './components/AnomaliesFilter/AnomaliesFilter'
import GatewayListFilters from './components/COGatewayList/GatewayListFilters'
import PerspectiveResourceModalBody from './components/ResourceGroupModals/Perspective/PerspectiveResourceModalBody'
import PerspectiveResourceRenderer from './components/ResourceGroupModals/Perspective/PerspectiveResourceRenderer'
import GovernanceRulesResourceModalBody from './components/ResourceGroupModals/GovernanceRules/GovernanceRulesResourceModalBody'
import GovernanceRulesResourceRenderer from './components/ResourceGroupModals/GovernanceRules/GovernanceRulesResourceRenderer'

RbacFactory.registerResourceCategory(ResourceCategory.CLOUD_COSTS, {
  icon: 'ccm-solid',
  label: 'common.purpose.ce.continuous'
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_OVERVIEW, {
  icon: 'ccm-solid',
  label: 'overview',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_OVERVIEW]: <LocaleString stringID="rbac.permissionLabels.view" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_PERSPECTIVE, {
  icon: 'ccm-solid',
  label: 'ce.perspectives.sideNavText',
  labelSingular: 'ce.sideNav.perspective',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_PERSPECTIVE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_PERSPECTIVE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_PERSPECTIVE]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_PERSPECTIVE_FOLDERS, {
  icon: 'ccm-solid',
  label: 'ce.perspectives.folders.customFolders',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_PERSPECTIVE_FOLDERS]: <LocaleString stringID="delete" />
  },
  addResourceModalBody: props => <PerspectiveResourceModalBody {...props} />,
  staticResourceRenderer: props => <PerspectiveResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_BUDGETS, {
  icon: 'ccm-solid',
  label: 'ce.budgets.sideNavText',
  labelSingular: 'ce.common.budget',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_BUDGET]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_BUDGET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_BUDGET]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_COST_CATEGORY, {
  icon: 'ccm-solid',
  label: 'ce.businessMapping.sideNavText',
  labelSingular: 'ce.businessMapping.costCategory',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_COST_CATEGORY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_COST_CATEGORY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_COST_CATEGORY]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTOSTOPPINGRULE, {
  icon: 'ccm-solid',
  label: 'ce.co.breadCrumb.rules',
  labelSingular: 'common.singularLabels.autoStoppingRule',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_AUTOSTOPPING_RULE]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.LOADBALANCER, {
  icon: 'ccm-solid',
  label: 'common.loadBalancer',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_LOADBALANCER]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_LOADBALANCER]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CCM_LOADBALANCER]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CURRENCYPREFERENCE, {
  icon: 'ccm-solid',
  label: 'ce.currencyPreferences.sideNavText',
  category: ResourceCategory.CLOUD_COSTS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CCM_CURRENCYPREFERENCE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CCM_CURRENCYPREFERENCE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />
  }
})

featureFactory.registerFeaturesByModule('ce', {
  features: [FeatureIdentifier.PERSPECTIVES],
  renderMessage: (_, getString, additionalLicenseProps, usageAndLimitInfo) => {
    const { isFreeEdition } = additionalLicenseProps || {}
    const { limitData, usageData } = usageAndLimitInfo || {}

    const usageCost = get(usageData, 'usage.ccm.activeSpend.count', 0)
    const limitCost = get(limitData, 'limit.ccm.totalSpendLimit', 1)

    const usagePercentage = (usageCost / limitCost) * 100

    if (usageCost >= limitCost) {
      return isFreeEdition
        ? {
            message: () =>
              getString('ce.enforcementMessage.exceededSpendLimitFreePlan', {
                usage: formatCost(Number(usageCost), {
                  shortFormat: true
                }),
                limit: formatCost(Number(limitCost), {
                  shortFormat: true
                })
              }),
            bannerType: BannerType.LEVEL_UP
          }
        : {
            message: () => getString('ce.enforcementMessage.exceededSpendLimit'),
            bannerType: BannerType.OVERUSE
          }
    }

    if (usagePercentage > FEATURE_USAGE_WARNING_LIMIT) {
      return {
        message: () =>
          getString('ce.enforcementMessage.usageInfo', {
            percentage: Math.ceil(usagePercentage)
          }),
        bannerType: BannerType.INFO
      }
    }

    return {
      message: () => '',
      bannerType: BannerType.LEVEL_UP
    }
  }
})

// eslint-disable-next-line import/no-unresolved
const CcmMicroFrontendPath = React.lazy(() => import('ccmui/MicroFrontendApp'))

AuditTrailFactory.registerResourceHandler('PERSPECTIVE', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.sideNav.perspective',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toPerspectiveDetails({
      accountId: accountIdentifier,
      perspectiveId: resource.identifier,
      perspectiveName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_BUDGET', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.budgets.perspectiveBudgets',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEBudgetDetails({
      accountId: accountIdentifier,
      budgetId: resource.identifier,
      budgetName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('BUDGET_GROUP', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.budgets.perspectiveBudgetGroup',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEBudgetDetails({
      accountId: accountIdentifier,
      budgetId: resource.identifier,
      budgetName: resource.labels?.resourceName || resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_REPORT', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.reports.perspectiveReport',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    const perspectiveId = resource.labels?.RelatedPerspectiveId

    if (perspectiveId) {
      return routes.toPerspectiveDetails({
        accountId: accountIdentifier,
        perspectiveId: perspectiveId,
        perspectiveName: perspectiveId
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler('COST_CATEGORY', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.businessMapping.costCategory'
})

AuditTrailFactory.registerResourceHandler('PERSPECTIVE_FOLDER', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.perspectives.folders.title',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEPerspectives({
      accountId: accountIdentifier
    })}?folderId="${resource.identifier}"`
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.rule',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return routes.toCEGovernanceRuleEditor({
      accountId: accountIdentifier,
      ruleId: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE_SET', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.ruleSet',
  resourceUrl: (_resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEGovernanceRules({
      accountId: accountIdentifier
    })}?tab="RuleSets"`
  }
})

AuditTrailFactory.registerResourceHandler('CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT', {
  moduleIcon: { name: 'ccm-solid' },
  moduleLabel: 'common.purpose.ce.continuous',
  resourceLabel: 'ce.governance.enforcement',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier } = resourceScope
    return `${routes.toCEGovernanceEnforcements({
      accountId: accountIdentifier
    })}?s="${resource.labels?.resourceName}"`
  }
})

const CESideNavProps: SidebarContext = {
  navComponent: CESideNav,
  subtitle: 'CLOUD COST',
  title: 'Management',
  icon: 'ce-main',
  launchButtonText: 'common.ce.visibilityLaunchButton',
  launchButtonRedirectUrl: '#/account/{replaceAccountId}/continuous-efficiency/overview'
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'ce'
      })}
    />
  )
}

const RedirectToOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toCEOverview({
        accountId
      })}
    />
  )
}

const RedirectToBudgetDetails = (): React.ReactElement => {
  const { accountId, budgetId, budgetName } = useParams<{
    accountId: string
    budgetId: string
    budgetName: string
  }>()

  return (
    <Redirect
      to={routes.toCEBudgetDetails({
        accountId,
        budgetName,
        budgetId
      })}
    />
  )
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CE.toLowerCase() as Module
      })}
    />
  )
}

const RedirectToNewNodeRecommendationDetailsRoute = (): React.ReactElement => {
  const { recommendation, recommendationName, accountId } = useParams<{
    recommendationName: string
    recommendation: string
    accountId: string
  }>()
  return (
    <Redirect
      to={routes.toCENodeRecommendationDetails({
        accountId,
        recommendationName,
        recommendation
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CCM_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

const getRequestOptions = (): Partial<RequestInit> => {
  const token = SessionToken.getToken()

  const headers: RequestInit['headers'] = {}

  if (token && token.length > 0) {
    if (!window.noAuthHeader) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return { headers }
}

const CENonMFERoutes = (
  <>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEOverview({ ...accountPathProps, ...projectPathProps })}
      pageName={PAGE_NAME.CEOverviewPage}
    >
      <OverviewPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECreatePerspective({
        ...accountPathProps,
        perspectiveId: ':perspectiveId'
      })}
      exact
      pageName={PAGE_NAME.CECreatePerspectivePage}
    >
      <CreatePerspectivePage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEPerspectives({
        ...accountPathProps
      })}
      exact
      pageName={PAGE_NAME.CEPerspectiveListPage}
    >
      <PerspectiveListPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toBusinessMapping({ ...accountPathProps })}
      exact
      pageName={PAGE_NAME.CEBusinessMapping}
    >
      <BusinessMapping />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECOCreateGateway({ ...accountPathProps, ...projectPathProps })}
      exact
      pageName={PAGE_NAME.CECOCreateGatewayPage}
    >
      <CECOCreateGatewayPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECORules({ ...accountPathProps, params: '' })}
      exact
      pageName={PAGE_NAME.CECODashboardPage}
    >
      <CECODashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECORuleDetails({ ...accountPathProps, id: ':ruleId' })}
      exact
      pageName={PAGE_NAME.CECORuleDetailsPage}
    >
      <CORuleDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toPerspectiveDetails({
        ...accountPathProps,
        perspectiveId: ':perspectiveId',
        perspectiveName: ':perspectiveName'
      })}
      exact
      pageName={PAGE_NAME.CEPerspectiveDetailsPage}
    >
      <PerspectiveDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECOAccessPoints({ ...accountPathProps, ...projectPathProps })}
      exact
      pageName={PAGE_NAME.CECOLoadBalancersPage}
    >
      <CECOLoadBalancersPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECOEditGateway({
        ...accountPathProps,
        ...projectPathProps,
        gatewayIdentifier: ':gatewayIdentifier'
      })}
      exact
      pageName={PAGE_NAME.CECOEditGatewayPage}
    >
      <CECOEditGatewayPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCommitmentOrchestration({ ...accountPathProps })}
      exact
      pageName={PAGE_NAME.CECommitmentOrchestrationPage}
    >
      <CommitmentOrchestration />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCommitmentOrchestrationSetup({ ...accountPathProps })}
      exact
      pageName={PAGE_NAME.CECommitmentOrchestrationPage}
    >
      <CommitmentOrchestrationSetup />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCECloudIntegration({ ...accountPathProps })}
      pageName={PAGE_NAME.CECloudIntegration}
      exact
    >
      <CloudIntegrationPage />
    </RouteWithLayout>
  </>
)

const CERoutes: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { CCM_MICRO_FRONTEND, CCM_ENABLE_CLOUD_ASSET_GOVERNANCE_UI } = useFeatureFlags()
  const enableMicroFrontend = CCM_MICRO_FRONTEND

  if (CCM_ENABLE_CLOUD_ASSET_GOVERNANCE_UI) {
    RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE, {
      icon: 'ccm-solid',
      label: 'ce.governance.rules',
      category: ResourceCategory.CLOUD_COSTS,
      permissionLabels: {
        [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: (
          <LocaleString stringID="rbac.permissionLabels.view" />
        ),
        [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: (
          <LocaleString stringID="rbac.permissionLabels.createEdit" />
        ),
        [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: <LocaleString stringID="delete" />,
        [PermissionIdentifier.EXECUTE_CCM_CLOUD_ASSET_GOVERNANCE_RULE]: <LocaleString stringID="common.execute" />
      },
      addResourceModalBody: props => <GovernanceRulesResourceModalBody {...props} />,
      staticResourceRenderer: props => <GovernanceRulesResourceRenderer {...props} />
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET, {
      icon: 'ccm-solid',
      label: 'ce.governance.ruleSets',
      category: ResourceCategory.CLOUD_COSTS,
      permissionLabels: {
        [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: (
          <LocaleString stringID="rbac.permissionLabels.view" />
        ),
        [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: (
          <LocaleString stringID="rbac.permissionLabels.createEdit" />
        ),
        [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET]: <LocaleString stringID="delete" />
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT, {
      icon: 'ccm-solid',
      label: 'ce.governance.enforcements',
      category: ResourceCategory.CLOUD_COSTS,
      permissionLabels: {
        [PermissionIdentifier.VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: (
          <LocaleString stringID="rbac.permissionLabels.view" />
        ),
        [PermissionIdentifier.EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: (
          <LocaleString stringID="rbac.permissionLabels.createEdit" />
        ),
        [PermissionIdentifier.DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT]: <LocaleString stringID="delete" />
      }
    })
  }

  const urqlClient = React.useMemo(() => {
    const url = getConfig(`ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`)
    return createClient({
      url: url,
      fetchOptions: getRequestOptions,
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [accountId])

  const mfePaths = enableMicroFrontend
    ? [
        routes.toCEBudgets({ ...accountPathProps }),
        routes.toCEBudgetDetails({ ...accountPathProps, budgetId: ':budgetId', budgetName: ':budgetName' }),
        routes.toCERecommendations({ ...accountPathProps, ...projectPathProps }),
        routes.toCERecommendationDetails({
          ...accountPathProps,
          ...projectPathProps,
          recommendationName: ':recommendationName',
          recommendation: ':recommendation'
        }),
        routes.toCEOverview({ ...accountPathProps }),
        routes.toCENodeRecommendationDetails({
          ...accountPathProps,
          ...projectPathProps,
          recommendationName: ':recommendationName',
          recommendation: ':recommendation'
        }),
        routes.toCEECSRecommendationDetails({
          ...accountPathProps,
          ...projectPathProps,
          recommendationName: ':recommendationName',
          recommendation: ':recommendation'
        }),
        routes.toBusinessMapping({ ...accountPathProps }),
        routes.toCEAnomalyDetection({ ...accountPathProps }),
        routes.toCEPerspectives({ ...accountPathProps }),
        routes.toCECreatePerspective({ ...accountPathProps, perspectiveId: ':perspectiveId' }),
        routes.toCECORuleDetails({ ...accountPathProps, id: ':ruleId' }),
        routes.toPerspectiveDetails({
          ...accountPathProps,
          perspectiveId: ':perspectiveId',
          perspectiveName: ':perspectiveName'
        }),
        routes.toCEPerspectiveWorkloadDetails({
          ...accountPathProps,
          perspectiveId: ':perspectiveId',
          perspectiveName: ':perspectiveName',
          clusterName: ':clusterName',
          namespace: ':namespace',
          workloadName: ':workloadName'
        }),
        routes.toCERecommendationWorkloadDetails({
          ...accountPathProps,
          recommendation: ':recommendation',
          recommendationName: ':recommendationName',
          clusterName: ':clusterName',
          namespace: ':namespace',
          workloadName: ':workloadName'
        }),
        routes.toCEPerspectiveServiceDetails({
          ...accountPathProps,
          perspectiveId: ':perspectiveId',
          perspectiveName: ':perspectiveName',
          clusterName: ':clusterName',
          serviceName: ':serviceName'
        }),
        routes.toCERecommendationServiceDetails({
          ...accountPathProps,
          recommendation: ':recommendation',
          recommendationName: ':recommendationName',
          clusterName: ':clusterName',
          serviceName: ':serviceName'
        }),
        routes.toCEPerspectiveNodeDetails({
          ...accountPathProps,
          perspectiveId: ':perspectiveId',
          perspectiveName: ':perspectiveName',
          clusterName: ':clusterName',
          nodeId: ':nodeId'
        }),
        routes.toCEDashboards({ ...accountPathProps }),
        routes.toCECOCreateGateway({ ...accountPathProps, ...projectPathProps }),
        routes.toCECOAccessPoints({ ...accountPathProps, ...projectPathProps }),
        routes.toCECOEditGateway({
          ...accountPathProps,
          ...projectPathProps,
          gatewayIdentifier: ':gatewayIdentifier'
        }),
        routes.toCECORules({ ...accountPathProps, params: '' }),
        routes.toCommitmentOrchestration({ ...accountPathProps }),
        routes.toCommitmentOrchestrationSetup({ ...accountPathProps }),
        routes.toCEGovernance({ ...accountPathProps }),
        routes.toCEGovernanceRules({ ...accountPathProps }),
        routes.toCEGovernanceEnforcements({ ...accountPathProps }),
        routes.toCEGovernanceEvaluations({ ...accountPathProps }),
        routes.toCEGovernanceRuleEditor({ ...accountPathProps, ruleId: ':ruleId' }),
        routes.toCECurrencyPreferences({ ...accountPathProps }),
        routes.toClusterOrchestrator({ ...accountPathProps }),
        routes.toClusterDetailsPage({ ...accountPathProps, id: ':id' }),
        routes.toClusterWorkloadsDetailsPage({ ...accountPathProps, id: ':id' }),
        routes.toClusterNodepoolDetailsPage({ ...accountPathProps, id: ':id' }),
        routes.toComputeGroupsSetup({ ...accountPathProps, id: ':id' }),
        routes.toCECloudIntegration({ ...accountPathProps })
      ]
    : []

  return (
    <Provider value={urqlClient}>
      <Switch>
        <RouteWithLayout
          layout={MinimalLayout}
          path={routes.toModuleTrialHome({ ...accountPathProps, module: 'ce' })}
          exact
          pageName={PAGE_NAME.CETrialHomePage}
        >
          <CETrialHomePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          path={routes.toCEHome({ ...accountPathProps })}
          exact
          pageName={PAGE_NAME.CEHomePage}
        >
          <CEHomePage />
        </RouteWithLayout>
        <RouteWithLayout licenseRedirectData={licenseRedirectData} path={routes.toCE({ ...accountPathProps })} exact>
          <RedirectToOverviewPage />
        </RouteWithLayout>

        {!enableMicroFrontend && CENonMFERoutes.props.children}

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEBudgetDetailsOld({
            ...accountPathProps,
            budgetId: ':budgetId',
            budgetName: ':budgetName'
          })}
          pageName={PAGE_NAME.CEBudgetDetails}
        >
          <RedirectToBudgetDetails />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toOldCENodeRecommendationDetails({
            ...accountPathProps,
            ...projectPathProps,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <RedirectToNewNodeRecommendationDetailsRoute />
        </RouteWithLayout>
        {enableMicroFrontend ? (
          <RouteWithLayout path={[...mfePaths, routes.toCCMMFE({ ...accountPathProps })]} sidebarProps={CESideNavProps}>
            <ChildAppMounter<CCMUIAppCustomProps>
              customComponents={{
                OverviewAddCluster,
                AnomaliesFilter,
                ConnectorReferenceField,
                GatewayListFilters,
                FeatureWarningBanner,
                FeatureWarningTooltip
              }}
              customHooks={{
                useTestConnectionModal
              }}
              ChildApp={CcmMicroFrontendPath}
            />
          </RouteWithLayout>
        ) : null}

        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export default CERoutes
