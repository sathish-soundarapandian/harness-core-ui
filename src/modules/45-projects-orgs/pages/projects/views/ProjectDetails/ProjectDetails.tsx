/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container, Icon, Layout, Popover, Text } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { FontVariation, Color } from '@harness/design-system'
import { Classes, Position } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectAggregateDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ModuleListCard from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import OverviewGlanceCards, {
  OverviewGalanceCard
} from '@projects-orgs/components/OverviewGlanceCards/OverviewGlanceCards'
import { useGetCounts } from 'services/dashboard-service'
import LandingDashboardFactory from '@common/factories/LandingDashboardFactory'
import LandingDashboardWidgetWrapper from '@projects-orgs/components/LandingDashboardWidgetWrapper/LandingDashboardWidgetWrapper'
import { DASHBOARD_MODULES } from '@projects-orgs/pages/LandingDashboardPage/LandingDashboardPage'
import {
  TimeRangeToDays,
  useLandingDashboardContext,
  LandingDashboardContextProvider
} from '@common/factories/LandingDashboardContext'
import TimeRangeSelect from '@projects-orgs/components/TimeRangeSelect/TimeRangeSelect'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import DeprecatedCallout from '@gitsync/components/DeprecatedCallout/DeprecatedCallout'
import { isOnPrem } from '@common/utils/utils'
import useDeleteProjectDialog from '../../DeleteProject'
import css from './ProjectDetails.module.scss'

const ProjectDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { selectedTimeRange } = useLandingDashboardContext()
  const [range] = useState([Date.now() - TimeRangeToDays[selectedTimeRange] * 24 * 60 * 60000, Date.now()])
  const { CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED, NEW_LEFT_NAVBAR_SETTINGS } = useFeatureFlags()
  const showProjectOverview = NEW_LEFT_NAVBAR_SETTINGS && !isOnPrem()
  const { licenseInformation } = useLicenseStore()
  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }
  const { data, loading, error, refetch } = useGetProjectAggregateDTO({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier
    }
  })

  const { data: countData } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1],
      projectIdentifier,
      orgIdentifier
    }
  })

  const projectData = data?.data?.projectResponse.project
  const refetchProject = (): void => {
    refetch()
  }

  const { openProjectModal } = useProjectModal({
    onSuccess: refetchProject
  })

  const showEditProject = (project: Project): void => {
    openProjectModal(project)
  }

  const { openCollaboratorModal } = useCollaboratorModal()

  const showCollaborators = (project: Project): void => {
    openCollaboratorModal({
      projectIdentifier: project.identifier,
      orgIdentifier: project.orgIdentifier || 'default'
    })
  }

  const history = useHistory()
  const onDeleted = (): void => {
    history.push(routes.toProjects({ accountId }))
  }
  const { openDialog } = useDeleteProjectDialog(projectData || { identifier: '', name: '' }, onDeleted)
  useDocumentTitle(getString('projectsText'))
  const { shouldVisible } = useNavModuleInfo(ModuleName.CD)
  const getModuleInfoCards = (): React.ReactElement | React.ReactElement[] => {
    if (!projectData?.modules?.length) {
      return (
        <Layout.Vertical padding="huge" flex={{ align: 'center-center' }} spacing="huge">
          <Icon name="nav-project" size={70} />
          <Text font="medium">{getString('projectsOrgs.noModules')}</Text>
        </Layout.Vertical>
      )
    }

    const infoCards = []

    if (shouldVisible && projectData.modules.includes(ModuleName.CD)) infoCards.push(ModuleName.CD)
    if (CING_ENABLED && projectData.modules.includes(ModuleName.CI)) infoCards.push(ModuleName.CI)
    if (CFNG_ENABLED && projectData.modules.includes(ModuleName.CF)) infoCards.push(ModuleName.CF)
    if (CENG_ENABLED && projectData.modules.includes(ModuleName.CE)) infoCards.push(ModuleName.CE)
    if (CVNG_ENABLED && projectData.modules.includes(ModuleName.CV)) infoCards.push(ModuleName.CV)
    if (licenseInformation['STO']?.status === 'ACTIVE' && projectData.modules.includes(ModuleName.STO))
      infoCards.push(ModuleName.STO)

    return infoCards.map(module => (
      <ModuleListCard
        module={module as ModuleName}
        key={module}
        projectIdentifier={projectData.identifier}
        orgIdentifier={projectData.orgIdentifier || ''}
        accountId={accountId}
      />
    ))
  }

  /* istanbul ignore next */ if (loading) return <Page.Spinner />
  /* istanbul ignore next */ if (error)
    return <Page.Error message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  /* istanbul ignore next */ if (!projectData) return <></>
  return (
    <>
      {isGitSyncEnabled && <DeprecatedCallout />}
      <Page.Header
        size={projectData.description || !isEmpty(projectData.tags) ? 'xxlarge' : 'xlarge'}
        breadcrumbs={
          <NGBreadcrumbs
            links={
              !showProjectOverview
                ? [
                    {
                      url: routes.toProjects({ accountId }),
                      label: getString('projectsText')
                    }
                  ]
                : []
            }
          />
        }
        title={
          <Layout.Vertical spacing="small" padding={{ top: 'small' }} className={css.title}>
            <Layout.Horizontal
              spacing="medium"
              margin={{ bottom: 'medium' }}
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <div className={css.colorBar} style={{ backgroundColor: projectData.color }} />
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                {getString('idLabel', { id: projectData.identifier })}
              </Text>
              <div className={css.divider} />
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                {`${getString('orgLabel')}: ${projectData.orgIdentifier}`}
              </Text>
              <div className={css.divider} />
              {data?.data?.projectResponse.lastModifiedAt ? (
                <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                  {`${getString('common.modified')} `}
                  <ReactTimeago date={data?.data?.projectResponse.lastModifiedAt} />
                </Text>
              ) : null}
            </Layout.Horizontal>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H4 }} lineClamp={1} padding={{ right: 'xlarge' }}>
                {projectData.name}
              </Text>
            </Layout.Horizontal>
            {projectData.description ? (
              <Text font="small" color={Color.BLACK} lineClamp={1}>
                {projectData.description}
              </Text>
            ) : null}
            {projectData.tags && !isEmpty(projectData.tags) ? (
              <Layout.Horizontal padding={{ top: 'medium' }}>
                <TagsRenderer tags={projectData.tags} length={6} tagClassName={css.tags} />
              </Layout.Horizontal>
            ) : null}
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Vertical
            padding={{ top: 'small' }}
            flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}
          >
            <Popover
              isOpen={menuOpen}
              onInteraction={nextOpenState => {
                setMenuOpen(nextOpenState)
              }}
              className={Classes.DARK}
              position={Position.BOTTOM_RIGHT}
            >
              <Button
                minimal
                icon="Options"
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <ContextMenu
                project={projectData as Project}
                reloadProjects={refetch}
                editProject={showEditProject}
                collaborators={showCollaborators}
                setMenuOpen={setMenuOpen}
                openDialog={openDialog}
              />
            </Popover>
            <Layout.Horizontal padding={{ right: 'huge' }} margin={{ right: 'huge' }}>
              <Layout.Vertical padding={{ right: 'xlarge' }}>
                <Text font="xsmall" color={Color.GREY_400} padding={{ left: 'xsmall', bottom: 'small' }}>
                  {`${getString('adminLabel')} ${data?.data?.admins?.length ? `(${data?.data?.admins?.length})` : ``}`}
                </Text>
                <RbacAvatarGroup
                  className={css.projectDetailsAvatarGroup}
                  avatars={data?.data?.admins?.length ? data?.data?.admins : [{}]}
                  onAdd={event => {
                    event.stopPropagation()
                    showCollaborators(projectData as Project)
                  }}
                  restrictLengthTo={6}
                  permission={invitePermission}
                />
              </Layout.Vertical>
              <Layout.Vertical>
                <Text font="xsmall" color={Color.GREY_400} padding={{ left: 'xsmall', bottom: 'small' }}>{`${getString(
                  'collaboratorsLabel'
                )} ${data?.data?.collaborators?.length ? `(${data?.data?.collaborators?.length})` : ``}`}</Text>
                <RbacAvatarGroup
                  className={css.projectDetailsAvatarGroup}
                  avatars={data?.data?.collaborators?.length ? data?.data?.collaborators : [{}]}
                  onAdd={event => {
                    event.stopPropagation()
                    showCollaborators(projectData as Project)
                  }}
                  restrictLengthTo={6}
                  permission={invitePermission}
                />
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        className={css.header}
      />
      <Page.Body>
        <Layout.Horizontal>
          <Container padding="xxlarge" className={cx(css.enabledModules, { [css.fullWidth]: showProjectOverview })}>
            <Layout.Vertical padding="small" spacing="large">
              {!showProjectOverview && (
                <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('modules')}
                </Text>
              )}
              {showProjectOverview ? (
                <LandingDashboardContextProvider>
                  <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                    <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
                      {getString('projectsOrgs.landingDashboard.atAGlance')}
                    </Text>
                    <TimeRangeSelect className={css.timeRangeSelect} />
                  </Layout.Horizontal>
                  {countData && (
                    <>
                      <OverviewGlanceCards
                        glanceCardData={countData}
                        hideCards={[OverviewGalanceCard.PROJECT]}
                        className={css.glanceCardContainer}
                        glanceCardProps={{ className: css.glanceCard }}
                      />
                    </>
                  )}
                  <Layout.Vertical spacing="large" padding={{ top: 'huge' }}>
                    {DASHBOARD_MODULES.map(moduleName => {
                      const moduleHandler = LandingDashboardFactory.getModuleDashboardHandler(moduleName)
                      return moduleHandler ? (
                        <LandingDashboardWidgetWrapper
                          icon={moduleHandler?.icon}
                          title={moduleHandler?.label}
                          iconProps={moduleHandler?.iconProps}
                          key={moduleName}
                        >
                          {moduleHandler.moduleDashboardRenderer?.()}
                        </LandingDashboardWidgetWrapper>
                      ) : null
                    })}
                  </Layout.Vertical>
                </LandingDashboardContextProvider>
              ) : (
                getModuleInfoCards()
              )}
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default ProjectDetails
