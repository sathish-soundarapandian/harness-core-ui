/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, Icon, Layout, Text, CardBody, useConfirmationDialog } from '@harness/uicore'
import React, { useState } from 'react'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { Menu, Classes, Intent } from '@blueprintjs/core'
import { OrganizationAggregateDTO, useDeleteOrganization } from 'services/cd-ng'

import { useToaster } from '@common/exports'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './OrganizationCard.module.scss'

interface OrganizationCardProps {
  data: OrganizationAggregateDTO
  width?: number
  isPreview?: boolean
  reloadOrgs?: () => void
  editOrg?: () => void
  inviteCollab?: () => void
  onClick?: () => void
}

export const OrganizationCard: React.FC<OrganizationCardProps> = props => {
  const { data: organizationAggregateDTO, isPreview, onClick, editOrg, reloadOrgs, inviteCollab } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const {
    organizationResponse: { organization: data, harnessManaged: isHarnessManaged },
    projectsCount,
    admins,
    collaborators
  } = organizationAggregateDTO
  const orgMembers = admins?.concat(collaborators || [])
  const [menuOpen, setMenuOpen] = useState(false)
  const { mutate: deleteOrg } = useDeleteOrganization({ queryParams: { accountIdentifier: accountId } })
  const { getString } = useStrings()
  const permissionRequest = {
    resource: {
      resourceType: ResourceType.ORGANIZATION,
      resourceIdentifier: data.identifier
    }
  }
  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: data.identifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getString('projectsOrgs.confirmDelete', { name: data.name }),
    titleText: getString('projectsOrgs.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteOrg(data.identifier, { headers: { 'content-type': 'application/json' } })
          /* istanbul ignore else */ if (deleted)
            showSuccess(getString('projectsOrgs.orgDeletedMessage', { name: data.name }))
          reloadOrgs?.()
        } catch (err) {
          showError(getRBACErrorMessage(err))
        }
      }
    }
  })

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    editOrg?.()
  }

  const handleInvite = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    inviteCollab?.()
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.identifier) return
    openDialog()
  }

  return (
    <Card
      elevation={2}
      interactive={!isPreview}
      className={css.card}
      onClick={onClick}
      data-testid={`org-card-${data.identifier}`}
    >
      <Container className={css.overflow}>
        {!isPreview ? (
          <CardBody.Menu
            menuContent={
              <Menu>
                <RbacMenuItem
                  icon="edit"
                  text={getString('edit')}
                  onClick={handleEdit}
                  disabled={isHarnessManaged}
                  permission={{
                    ...permissionRequest,
                    permission: PermissionIdentifier.UPDATE_ORG
                  }}
                />
                <RbacMenuItem
                  icon="new-person"
                  text={getString('projectsOrgs.invite')}
                  onClick={handleInvite}
                  permission={invitePermission}
                />
                <RbacMenuItem
                  icon="trash"
                  text={getString('delete')}
                  onClick={handleDelete}
                  disabled={isHarnessManaged}
                  permission={{
                    ...permissionRequest,
                    permission: PermissionIdentifier.DELETE_ORG,
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier: data.identifier
                    }
                  }}
                />
              </Menu>
            }
            menuPopoverProps={{
              className: Classes.DARK,
              isOpen: menuOpen,
              onInteraction: nextOpenState => {
                setMenuOpen(nextOpenState)
              }
            }}
            className={css.cardMenu}
          />
        ) : null}
        <Layout.Vertical className={css.title} padding={{ right: isPreview ? 'large' : undefined }}>
          <Text font="medium" color={Color.BLACK} lineClamp={1}>
            {data?.name || getString('projectsOrgs.orgName')}
          </Text>
          <Layout.Horizontal className={css.description} margin={{ bottom: 'xsmall' }}>
            {data?.description ? (
              <Text color={Color.GREY_350} lineClamp={2}>
                {data.description}
              </Text>
            ) : null}
          </Layout.Horizontal>
          <TagsRenderer tags={data.tags || {}} className={css.tags} tagClassName={css.tagText} />
          <Layout.Horizontal padding={{ top: 'xlarge' }}>
            <Layout.Vertical spacing="small">
              <Layout.Horizontal spacing="small" flex={{ align: 'center-center' }}>
                <Icon name="nav-project" size={32}></Icon>
                <Text font="medium">{projectsCount}</Text>
              </Layout.Horizontal>
              <Text font="small">{getString('projectsText')}</Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'huge' }} spacing="small" flex>
              <RbacAvatarGroup
                avatars={orgMembers?.length ? orgMembers : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  inviteCollab?.()
                }}
                restrictLengthTo={3}
                permission={{
                  ...invitePermission,
                  options: {
                    skipCondition: _permissionRequest => (isPreview ? true : false)
                  }
                }}
              />
              <Text font="small">{`${orgMembers?.length || 0} ${
                orgMembers && orgMembers?.length > 1 ? getString('members') : getString('common.member')
              }`}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    </Card>
  )
}
