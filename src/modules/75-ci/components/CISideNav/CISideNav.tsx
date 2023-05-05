/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@harness/uicore'
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
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useGetPipelines } from '@pipeline/hooks/useGetPipelines'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import type { PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'

export default function CISideNav(): React.ReactElement {
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
  const module = 'ci'
  const { updateAppStore, selectedProject } = useAppStore()
  const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
  const { experience } = useQueryParams<{ experience?: ModuleLicenseType }>()
  const { getString } = useStrings()
  const { showGetStartedTabInMainMenu, setShowGetStartedTabInMainMenu } = useSideNavContext()
  // Get and set the visibility of the "ci" module
  const isCIGetStartedVisible = showGetStartedTabInMainMenu['ci']
  const setCIGetStartedVisible = (shouldShow: boolean): void => setShowGetStartedTabInMainMenu('ci', shouldShow)

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

  useEffect(() => {
    if (enabledHostedBuildsForFreeUsers && selectedProject?.identifier) {
      fetchPipelines()
    }
  }, [selectedProject?.identifier])

  useEffect(() => {
    if (!fetchingPipelines && fetchPipelinesData) {
      const { data, status } = fetchPipelinesData
      setCIGetStartedVisible(status === 'SUCCESS' && (data as PagePMSPipelineSummaryResponse)?.totalElements === 0)
    }
  }, [fetchPipelinesData])

  useEffect(() => {
    if (isCIGetStartedVisible) {
      history.replace(
        routes.toGetStartedWithCI({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module
        })
      )
    }
  }, [isCIGetStartedVisible, history, module, accountId, orgIdentifier, projectIdentifier])

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CI}
        onSelect={data => {
          setCIGetStartedVisible(false)
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
            if (!isCIGetStartedVisible) {
              history.push(
                compile(routeMatch.path)({
                  ...routeMatch.params,
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier
                })
              )
            } else {
              history.push(
                routes.toDeployments({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier as string,
                  accountId,
                  module
                })
              )
            }
          } else {
            // when it's on trial page, forward to pipeline
            if (experience) {
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
              return
            }

            history.push(
              routes.toProjectOverview({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || '',
                accountId,
                module
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {isCIGetStartedVisible && (
            <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithCI({ ...params, module })} />
          )}
          {!(fetchingPipelines || isCIGetStartedVisible) && (
            <>
              <SidebarLink label={getString('overview')} to={routes.toProjectOverview({ ...params, module })} />
              <SidebarLink label={getString('buildsText')} to={routes.toDeployments({ ...params, module })} />
              <SidebarLink label={getString('pipelines')} to={routes.toPipelines({ ...params, module })} />
              <ProjectSetupMenu module={module} />
            </>
          )}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}
