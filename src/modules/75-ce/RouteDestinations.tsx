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
import AuditTrailFactory, { ResourceScope } from '@audit-trail/factories/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import RecommendationFilters from '@ce/components/RecommendationFilters'
import type { CCMUIAppCustomProps } from '@ce/interface/CCMUIApp.types'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import CEHomePage from './pages/home/CEHomePage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'
import CECOEditGatewayPage from './pages/co-edit-gateway/CECOEditGatewayPage'
import CECOLoadBalancersPage from './pages/co-access-points/CECOAccessPointsPage'
import Budgets from './pages/budgets/Budgets'
import CETrialHomePage from './pages/home/CETrialHomePage'

import RecommendationList from './pages/recommendationList/RecommendationList'
import RecommendationDetailsPage from './pages/recommendationDetails/RecommendationDetailsPage'
import PerspectiveDetailsPage from './pages/perspective-details/PerspectiveDetailsPage'
import CreatePerspectivePage from './pages/perspective-builder/CreatePerspectivePage'
import PerspectiveListPage from './pages/perspective-list/PerspectiveListPage'
import WorkloadDetailsPage from './pages/workload-details/WorkloadDetailsPage'
import OverviewPage from './pages/overview/OverviewPage'
import NodeRecommendationDetailsPage from './pages/node-recommendation-details/NodeRecommendationDetailsPage'
import BudgetDetails from './pages/budget-details/BudgetDetails'
import NodeDetailsPage from './pages/node-details/NodeDetailsPage'
import AnomaliesOverviewPage from './pages/anomalies-overview/AnomaliesOverviewPage'
import formatCost from './utils/formatCost'
import BusinessMapping from './pages/business-mapping/BusinessMapping'
import ECSRecommendationDetailsPage from './pages/ecs-recommendation-details/ECSRecommendationDetailsPage'
import OverviewAddCluster from './components/OverviewPage/OverviewAddCluster'
import BIDashboard from './pages/bi-dashboards/BIDashboard'
import CORuleDetailsPage from './pages/co-rule-details/CORuleDetailsPage'
import CommitmentOrchestration from './pages/CommitmentOrchestration/CommitmentOrchestration'
import CommitmentOrchestrationSetup from './pages/CommitmentOrchestration/CommitmentOrchestrationSetup'
import CloudIntegrationPage from './pages/cloud-integration/CloudIntegrationPage'
import ServiceDetailsPage from './pages/service-details/ServiceDetailsPage'
import AnomaliesFilter from './components/AnomaliesFilter/AnomaliesFilter'
import GatewayListFilters from './components/COGatewayList/GatewayListFilters'

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
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.CCM_BUDGETS, {
  icon: 'ccm-solid',
  label: 'ce.budgets.sideNavText',
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

const CESideNavProps: SidebarContext = {
  navComponent: CESideNav,
  subtitle: 'CLOUD COST',
  title: 'Management',
  icon: 'ce-main'
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
    headers.Authorization = `Bearer ${token}`
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
      path={routes.toCEBudgets({ ...accountPathProps })}
      pageName={PAGE_NAME.CEBudgets}
      exact
    >
      <Budgets />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEBudgetDetails({
        ...accountPathProps,
        budgetId: ':budgetId',
        budgetName: ':budgetName'
      })}
      pageName={PAGE_NAME.CEBudgetDetails}
    >
      <BudgetDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendations({ ...accountPathProps, ...projectPathProps })}
      exact
      pageName={PAGE_NAME.CERecommendationList}
    >
      <RecommendationList />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendationDetails({
        ...accountPathProps,
        ...projectPathProps,
        recommendationName: ':recommendationName',
        recommendation: ':recommendation'
      })}
      exact
      pageName={PAGE_NAME.CERecommendationDetailsPage}
    >
      <RecommendationDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCENodeRecommendationDetails({
        ...accountPathProps,
        ...projectPathProps,
        recommendationName: ':recommendationName',
        recommendation: ':recommendation'
      })}
      exact
      pageName={PAGE_NAME.CENodeRecommendationDetailsPage}
    >
      <NodeRecommendationDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEECSRecommendationDetails({
        ...accountPathProps,
        ...projectPathProps,
        recommendationName: ':recommendationName',
        recommendation: ':recommendation'
      })}
      exact
      pageName={PAGE_NAME.CEECSRecommendationDetailsPage}
    >
      <ECSRecommendationDetailsPage />
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
      path={routes.toCEAnomalyDetection({
        ...accountPathProps
      })}
      exact
      pageName={PAGE_NAME.CEAnomaliesOverviewPage}
    >
      <AnomaliesOverviewPage />
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
      path={routes.toCEPerspectiveWorkloadDetails({
        ...accountPathProps,
        perspectiveId: ':perspectiveId',
        perspectiveName: ':perspectiveName',
        clusterName: ':clusterName',
        namespace: ':namespace',
        workloadName: ':workloadName'
      })}
      exact
      pageName={PAGE_NAME.CEWorkloadDetailsPage}
    >
      <WorkloadDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendationWorkloadDetails({
        ...accountPathProps,
        recommendation: ':recommendation',
        recommendationName: ':recommendationName',
        clusterName: ':clusterName',
        namespace: ':namespace',
        workloadName: ':workloadName'
      })}
      exact
      pageName={PAGE_NAME.CEWorkloadDetailsPage}
    >
      <WorkloadDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEPerspectiveServiceDetails({
        ...accountPathProps,
        perspectiveId: ':perspectiveId',
        perspectiveName: ':perspectiveName',
        clusterName: ':clusterName',
        serviceName: ':serviceName'
      })}
      exact
      pageName={PAGE_NAME.CEServiceDetailsPage}
    >
      <ServiceDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendationServiceDetails({
        ...accountPathProps,
        recommendation: ':recommendation',
        recommendationName: ':recommendationName',
        clusterName: ':clusterName',
        serviceName: ':serviceName'
      })}
      exact
      pageName={PAGE_NAME.CEServiceDetailsPage}
    >
      <ServiceDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEPerspectiveNodeDetails({
        ...accountPathProps,
        perspectiveId: ':perspectiveId',
        perspectiveName: ':perspectiveName',
        clusterName: ':clusterName',
        nodeId: ':nodeId'
      })}
      exact
      pageName={PAGE_NAME.CENodeDetailsPage}
    >
      <NodeDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CESideNavProps}
      path={routes.toCEDashboards({ ...accountPathProps })}
      exact
      pageName={PAGE_NAME.CEDashboards}
    >
      <BIDashboard />
    </RouteWithLayout>
  </>
)

const CERoutes: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { CCM_MICRO_FRONTEND } = useFeatureFlags()
  const enableMicroFrontend = CCM_MICRO_FRONTEND

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
        routes.toCEDashboards({ ...accountPathProps })
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
          path={routes.toCECORules({ ...accountPathProps, params: '' })}
          exact
          pageName={PAGE_NAME.CECODashboardPage}
        >
          <CECODashboardPage />
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
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECloudIntegration({ ...accountPathProps })}
          pageName={PAGE_NAME.CECloudIntegration}
          exact
        >
          <CloudIntegrationPage />
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

        {enableMicroFrontend ? (
          <RouteWithLayout path={[...mfePaths, routes.toCCMMFE({ ...accountPathProps })]} sidebarProps={CESideNavProps}>
            <ChildAppMounter<CCMUIAppCustomProps>
              customComponents={{
                OverviewAddCluster,
                RecommendationFilters,
                AnomaliesFilter,
                ConnectorReferenceField,
                GatewayListFilters
              }}
              ChildApp={CcmMicroFrontendPath}
            />
          </RouteWithLayout>
        ) : null}

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

        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export default CERoutes
