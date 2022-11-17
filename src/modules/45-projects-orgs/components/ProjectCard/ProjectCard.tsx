/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Card, Text, Layout, CardBody, Container } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { FontVariation, Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { Project, ProjectAggregateDTO } from 'services/cd-ng'
import DefaultRenderer from '@projects-orgs/components/ModuleRenderer/DefaultRenderer'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import routes from '@common/RouteDefinitions'
import useDeleteProjectDialog from '@projects-orgs/pages/projects/DeleteProject'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import css from './ProjectCard.module.scss'

export interface ProjectCardProps {
  data: ProjectAggregateDTO
  isPreview?: boolean
  minimal?: boolean
  selected?: boolean
  onClick?: () => void
  className?: string
  reloadProjects?: () => Promise<void>
  editProject?: (project: Project) => void
  handleInviteCollaborators?: (project: Project) => void
}

const ProjectCard: React.FC<ProjectCardProps> = props => {
  const {
    data: projectAggregateDTO,
    isPreview,
    reloadProjects,
    editProject,
    handleInviteCollaborators,
    minimal,
    selected,
    onClick
  } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const {
    projectResponse,
    organization,
    admins: adminList,
    collaborators: collaboratorsList,
    harnessManagedOrg
  } = projectAggregateDTO
  const data = projectResponse.project || null
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const allowInteraction = !isPreview && !minimal
  const history = useHistory()
  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: data.orgIdentifier,
      projectIdentifier: data.identifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }
  const onDeleted = (): void => {
    reloadProjects?.()
  }
  const { openDialog } = useDeleteProjectDialog(data, onDeleted)
  return (
    <Card
      className={cx(css.projectCard, { [css.previewProjectCard]: isPreview }, props.className)}
      data-testid={`project-card-${data.identifier + data.orgIdentifier}`}
      onClick={onClick}
      selected={selected}
      interactive={!isPreview}
    >
      <Container padding="xlarge" className={css.projectInfo}>
        {allowInteraction ? (
          <CardBody.Menu
            menuContent={
              <ContextMenu
                project={data}
                reloadProjects={reloadProjects}
                editProject={editProject}
                collaborators={handleInviteCollaborators}
                openDialog={openDialog}
                setMenuOpen={setMenuOpen}
              />
            }
            menuPopoverProps={{
              className: Classes.DARK,
              isOpen: menuOpen,
              onInteraction: nextOpenState => {
                setMenuOpen(nextOpenState)
              }
            }}
          />
        ) : null}
        <Container
          onClick={() => {
            allowInteraction &&
              history.push({
                pathname: routes.toProjectDetails({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                  accountId
                })
              })
          }}
        >
          <div className={css.colorBar} style={{ backgroundColor: data.color }} />
          {data.name ? (
            <Text font="medium" lineClamp={1} color={Color.BLACK}>
              {data.name}
            </Text>
          ) : isPreview ? (
            <Text font="medium" lineClamp={1} color={Color.BLACK}>
              {getString('projectCard.projectName')}
            </Text>
          ) : null}
          <Text
            className={css.projectId}
            lineClamp={1}
            font={{ variation: FontVariation.SMALL }}
            margin={{ top: 'xsmall' }}
            color={Color.GREY_700}
          >
            {getString('idLabel', { id: data.identifier })}
          </Text>
          {harnessManagedOrg || isPreview ? null : (
            <Container margin={{ top: 'small', bottom: 'small' }}>
              <Text
                font={{ size: 'small', weight: 'semi-bold' }}
                icon="union"
                lineClamp={1}
                iconProps={{ padding: { right: 'small' } }}
              >
                {organization?.name}
              </Text>
            </Container>
          )}
          {data.description ? (
            <Text font="small" lineClamp={2} padding={{ top: 'small' }}>
              {data.description}
            </Text>
          ) : null}
          {data.tags && (
            <Container padding={{ top: 'small' }}>
              <TagsRenderer tags={data.tags} length={2} width={150} tagClassName={css.tagClassName} />
            </Container>
          )}

          <Layout.Horizontal padding={{ top: 'medium' }}>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <Text font={{ size: 'small', weight: 'semi-bold' }} padding={{ bottom: 'small' }}>{`${getString(
                'adminLabel'
              )} ${adminList?.length ? `(${adminList?.length})` : ``}`}</Text>
              <RbacAvatarGroup
                className={css.projectAvatarGroup}
                avatars={adminList?.length ? adminList : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
                permission={{
                  ...invitePermission,
                  options: {
                    skipCondition: () => !allowInteraction
                  }
                }}
              />
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall">
              <Text font={{ size: 'small', weight: 'semi-bold' }} padding={{ bottom: 'small' }}>{`${getString(
                'collaboratorsLabel'
              )} ${collaboratorsList?.length ? `(${collaboratorsList?.length})` : ``}`}</Text>
              <RbacAvatarGroup
                className={css.projectAvatarGroup}
                avatars={collaboratorsList?.length ? collaboratorsList : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
                permission={{
                  ...invitePermission,
                  options: {
                    skipCondition: () => !allowInteraction
                  }
                }}
              />
            </Layout.Vertical>
          </Layout.Horizontal>

          <DefaultRenderer />
        </Container>
      </Container>
    </Card>
  )
}

export default ProjectCard
