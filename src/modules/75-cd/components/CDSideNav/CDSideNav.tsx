/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, useRouteMatch, matchPath, useLocation } from 'react-router-dom'
import { Layout, useToaster } from '@harness/uicore'
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
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { isOnPrem, useGetCommunity } from '@common/utils/utils'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import type { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { SettingType } from '@common/constants/Utils'
import { useGetSettingValue } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

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
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { GITOPS_ONPREM_ENABLED, CDS_SERVICE_OVERRIDES_2_0 } = useFeatureFlags()
  const { getString } = useStrings()
  const { experience } = useQueryParams<{ experience?: ModuleLicenseType }>()
  const isCommunity = useGetCommunity()
  const { showGetStartedTabInMainMenu, setShowGetStartedTabInMainMenu } = useSideNavContext()

  // Get and set the visibility of the "cd" getStarted link
  const isCDGetStartedVisible = showGetStartedTabInMainMenu['cd']
  const setCDGetStartedVisible = (shouldShow: boolean): void => setShowGetStartedTabInMainMenu('cd', shouldShow)
  const gitopsOnPremEnabled = GITOPS_ONPREM_ENABLED ? true : false
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
    lazy: true,
    size: 1
  })

  const { data: enableServiceOverrideSettings, error: enableServiceOverrideSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: false
  })

  React.useEffect(() => {
    if (enableServiceOverrideSettingsError) {
      showError(getRBACErrorMessage(enableServiceOverrideSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableServiceOverrideSettingsError])

  React.useEffect(() => {
    if (selectedProject?.identifier) {
      fetchPipelines()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.identifier])

  React.useEffect(() => {
    /* istanbul ignore else */
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      const isGettingStartedEnabled =
        status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0
      setCDGetStartedVisible(isGettingStartedEnabled)
      /* istanbul ignore else */
      if (isGettingStartedEnabled) {
        isOverviewPage && history.replace(routes.toGetStartedWithCD({ ...params, module }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPipelinesData])

  const hideGitopsOnPrem = !gitopsOnPremEnabled && isOnPrem()
  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CD}
        onSelect={data => {
          setCDGetStartedVisible(false)
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
            if (!isCDGetStartedVisible) {
              history.push(
                compile(routeMatch.path)({
                  ...routeMatch.params,
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier
                })
              )
            } else {
              // If redirecting from blank project to populated project, move to deployments
              history.push(
                routes.toDeployments({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier as string,
                  accountId,
                  module
                })
              )
            }
          } else if (experience) {
            // when it's on trial page, forward to get-started (behind FF)/ pipeline
            history.push({
              pathname: routes.toCDOnboardingWizard({
                orgIdentifier: data.orgIdentifier || '',
                projectIdentifier: data.identifier || '',
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
          {isCDGetStartedVisible && (
            <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithCD({ ...params, module })} />
          )}
          {!isCommunity && !isCDGetStartedVisible && (
            <SidebarLink label={getString('overview')} to={routes.toProjectOverview({ ...params, module })} />
          )}
          <SidebarLink label={getString('deploymentsText')} to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label={getString('pipelines')} to={routes.toPipelines({ ...params, module })} />
          <SidebarLink label={getString('services')} to={routes.toServices({ ...params, module })} />
          <SidebarLink label={getString('environments')} to={routes.toEnvironment({ ...params, module })} />
          {isServiceOverridesEnabled && (
            <SidebarLink label={getString('common.overrides')} to={routes.toServiceOverrides({ ...params, module })} />
          )}
          {!isCommunity && !hideGitopsOnPrem ? (
            <SidebarLink label={getString('cd.gitOps')} to={routes.toGitOps({ ...params, module })} />
          ) : null}
          <ProjectSetupMenu module={module} />
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}
