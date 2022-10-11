/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, useRouteMatch, matchPath, useLocation } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type {
  ConnectorPathProps,
  PipelinePathProps,
  TemplateStudioPathProps,
  ResourceGroupPathProps,
  RolePathProps,
  SecretsPathProps,
  UserGroupPathProps,
  UserPathProps
} from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { LaunchButton } from '@common/components/LaunchButton/LaunchButton'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useGetCommunity, isOnPrem } from '@common/utils/utils'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import type { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'

export default function CDSideNav(): React.ReactElement {
  const params = useParams<
    PipelinePathProps &
      TemplateStudioPathProps &
      ConnectorPathProps &
      SecretsPathProps &
      UserPathProps &
      UserGroupPathProps &
      ResourceGroupPathProps &
      RolePathProps
  >()
  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    templateIdentifier,
    connectorId,
    secretId,
    userIdentifier,
    userGroupIdentifier,
    roleIdentifier,
    resourceGroupIdentifier
  } = params
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const location = useLocation()
  const module = 'cd'
  const { updateAppStore, selectedProject } = useAppStore()
  const { CD_ONBOARDING_ENABLED } = useFeatureFlags()
  const { getString } = useStrings()
  const { experience } = useQueryParams<{ experience?: ModuleLicenseType }>()
  const isCommunity = useGetCommunity()
  const { showGetStartedCDTabInMainMenu, setShowGetStartedCDTabInMainMenu } = useSideNavContext()
  const isOverviewPage = !!matchPath(location.pathname, {
    path: routes.toProjectOverview({ ...params, module })
  })
  const {
    data: fetchPipelinesData,
    loading: fetchingPipelines,
    refetch: fetchPipelines
  } = useGetPipelines({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    module,
    lazy: true,
    size: 1
  })

  React.useEffect(() => {
    if (CD_ONBOARDING_ENABLED && selectedProject?.identifier) {
      fetchPipelines()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.identifier])

  React.useEffect(() => {
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      const isGettingStartedEnabled =
        status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0
      setShowGetStartedCDTabInMainMenu(isGettingStartedEnabled)
      if (isGettingStartedEnabled) {
        isOverviewPage && history.replace(routes.toGetStartedWithCD({ ...params, module }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPipelinesData])

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CD}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          if (connectorId) {
            history.push(
              routes.toConnectors({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (secretId) {
            history.push(
              routes.toSecrets({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (userIdentifier) {
            history.push(
              routes.toUsers({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (roleIdentifier) {
            history.push(
              routes.toRoles({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (resourceGroupIdentifier) {
            history.push(
              routes.toResourceGroups({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (userGroupIdentifier) {
            history.push(
              routes.toUserGroups({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (templateIdentifier) {
            history.push(
              routes.toTemplates({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (projectIdentifier && !pipelineIdentifier) {
            // changing project
            history.push(
              compile(routeMatch.path)({
                ...routeMatch.params,
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier
              })
            )
          } else if (experience) {
            // when it's on trial page, forward to pipeline
            history.push({
              pathname: routes.toPipelineStudio({
                orgIdentifier: data.orgIdentifier || '',
                projectIdentifier: data.identifier || '',
                pipelineIdentifier: '-1',
                accountId,
                module
              }),
              search: `?modal=${experience}`
            })
          } else {
            history.push(
              routes.toProjectOverview({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {showGetStartedCDTabInMainMenu && CD_ONBOARDING_ENABLED && (
            <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithCD({ ...params, module })} />
          )}
          {!isCommunity && (!CD_ONBOARDING_ENABLED || !showGetStartedCDTabInMainMenu) && (
            <SidebarLink label="Overview" to={routes.toProjectOverview({ ...params, module })} />
          )}
          <SidebarLink label="Deployments" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />
          <SidebarLink label="Services" to={routes.toServices({ ...params, module })} />
          <SidebarLink label="Environments" to={routes.toEnvironment({ ...params, module })} />
          {!isCommunity && !isOnPrem() ? (
            <SidebarLink label={getString('cd.gitOps')} to={routes.toGitOps({ ...params, module })} />
          ) : null}
          <ProjectSetupMenu module={module} />
        </React.Fragment>
      ) : null}
      <LaunchButton
        launchButtonText={getString('cd.cdLaunchText')}
        redirectUrl={returnLaunchUrl(`#/account/${params.accountId}/dashboard`)}
      />
    </Layout.Vertical>
  )
}
