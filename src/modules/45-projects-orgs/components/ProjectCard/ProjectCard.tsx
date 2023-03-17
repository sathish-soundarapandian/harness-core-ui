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
  avatarClassName?: string
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
    onClick,
    avatarClassName
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
  const onDeleted = /* istanbul ignore next */ (): void => {
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
              onInteraction: /* istanbul ignore next */ nextOpenState => {
                setMenuOpen(nextOpenState)
              }
            }}
          />
        ) : null}
        <Container
          data-testid="card-content"
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
          {harnessManagedOrg || isPreview ? null : (
            <Text
              font={{ variation: FontVariation.TINY_SEMI }}
              lineClamp={1}
              color={Color.GREY_400}
              margin={{ bottom: 'small' }}
            >
              {getString('common.org')}: {organization?.name}
            </Text>
          )}
          <Text font={{ variation: FontVariation.CARD_TITLE }} lineClamp={1} color={Color.BLACK}>
            {data.name ? data.name : isPreview ? getString('projectCard.projectName') : null}
          </Text>
          <Text
            className={css.projectId}
            lineClamp={1}
            font={{ variation: FontVariation.TINY }}
            color={Color.GREY_600}
            margin={{ bottom: 'medium' }}
          >
            {getString('idLabel', { id: data.identifier })}
          </Text>
          {data.description ? (
            <Text font={{ variation: FontVariation.SMALL }} lineClamp={2} color={Color.GREY_400}>
              {data.description}
            </Text>
          ) : null}
          {data.tags && Object.keys(data.tags).length > 0 && (
            <Container margin={{ top: 'small' }}>
              <TagsRenderer tags={data.tags} length={2} width={150} tagClassName={css.tagClassName} />
            </Container>
          )}
          <Layout.Horizontal margin={{ top: 'xlarge' }}>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400} padding={{ bottom: 'small' }}>
                {getString('adminLabel')} {adminList?.length ? `(${adminList?.length})` : null}
              </Text>
              <RbacAvatarGroup
                size={'small'}
                className={css.projectAvatarGroup}
                avatarClassName={avatarClassName}
                avatars={adminList?.length ? adminList : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
                permission={{
                  ...invitePermission,
                  options: {
                    skipCondition: /* istanbul ignore next */ () => !allowInteraction
                  }
                }}
              />
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall">
              <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400} padding={{ bottom: 'small' }}>
                {getString('collaboratorsLabel')} {collaboratorsList?.length ? `(${collaboratorsList?.length})` : null}
              </Text>
              <RbacAvatarGroup
                size={'small'}
                className={css.projectAvatarGroup}
                avatarClassName={avatarClassName}
                avatars={collaboratorsList?.length ? collaboratorsList : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
                permission={{
                  ...invitePermission,
                  options: {
                    skipCondition: /* istanbul ignore next */ () => !allowInteraction
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
