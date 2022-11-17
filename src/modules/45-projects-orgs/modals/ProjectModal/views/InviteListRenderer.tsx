/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Menu } from '@blueprintjs/core'
import { SelectOption, Layout, Text, Button, Avatar, Container, ButtonVariation } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { FontVariation, Color } from '@harness/design-system'
import { Select } from '@blueprintjs/select'
import { useToaster } from '@common/exports'
import { useDeleteInvite, useUpdateInvite, Invite } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { InviteType } from '@rbac/modals/RoleAssignmentModal/views/RoleAssignmentForm'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './Steps.module.scss'

interface InviteListProps {
  user: Invite
  isCommunity?: boolean
  projectIdentifier?: string
  orgIdentifier?: string
  roles: SelectOption[]
  reload: () => void
}

const CustomSelect = Select.ofType<SelectOption>()

const InviteListRenderer: React.FC<InviteListProps> = props => {
  const { user, reload, roles, isCommunity } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const [approved, setApproved] = useState<boolean>(false)
  const { mutate: deleteInvite } = useDeleteInvite({})
  const defaultRole = {
    label: getString('customText', { text: 'Assign a role' }),
    value: ''
  }
  const [role, setRole] = useState<SelectOption>(defaultRole)
  const { mutate: updateInvite } = useUpdateInvite({ inviteId: '', queryParams: { accountIdentifier: accountId } })
  const { showSuccess, showError } = useToaster()

  const handleUpdate = async (type: InviteType): Promise<void> => {
    const dataToSubmit: Invite = {
      ...user,
      inviteType: type,
      approved: type === InviteType.USER_INITIATED ? true : false
    }
    try {
      const updated = await updateInvite(dataToSubmit, { pathParams: { inviteId: user.id } })
      /* istanbul ignore else */ if (updated) reload()
      showSuccess(getString('projectsOrgs.projectInviteSuccess'))
    } catch (err) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(err))
    }
  }

  const handleDelete = async (): Promise<void> => {
    try {
      const deleted = await deleteInvite(user.id, { headers: { 'content-type': 'application/json' } })
      /* istanbul ignore else */ if (deleted) reload()
      showSuccess(getString('projectsOrgs.projectDeleteSuccess'))
    } catch (err) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(err))
    }
  }
  return (
    <Container className={css.invites} padding={{ left: 'xsmall', top: 'medium', bottom: 'medium' }}>
      {user?.inviteType == InviteType.ADMIN_INITIATED ? (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={cx(css.align, css.pendingUser)} width="60%">
            <Avatar name={user.name || user.email} email={user.email} size="normal" />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name || user.email.split('@')[0]}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.pending)}
                  color={Color.PRIMARY_7}
                >
                  {getString('projectsOrgs.pendingInvitation')}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              {!isCommunity && (
                <Layout.Horizontal spacing="xsmall">
                  <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                    {getString('projectsOrgs.roleAssigned')}
                  </Text>
                  <Text font={{ variation: FontVariation.TINY }} className={css.role} lineClamp={1}>
                    {user?.roleBindings?.[0]?.roleName}
                  </Text>
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            <Button
              inline
              variation={ButtonVariation.ICON}
              icon="repeat"
              tooltip={getString('projectsOrgs.resendInvitation')}
              tooltipProps={{
                isDark: true
              }}
              onClick={() => {
                handleUpdate(InviteType.ADMIN_INITIATED)
              }}
            />
            <Button
              inline
              variation={ButtonVariation.ICON}
              tooltip={getString('projectsOrgs.deleteInvitation')}
              tooltipProps={{
                isDark: true
              }}
              icon="trash"
              iconProps={{ size: 20 }}
              onClick={handleDelete}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.align} width="60%">
            <Avatar name={user.name || user.email} email={user.email} size="normal" />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.request)}
                  color={Color.YELLOW_500}
                >
                  {getString('projectsOrgs.requestAccess')}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                {getString('projectsOrgs.noProjectRole')}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            {!approved ? (
              <Button
                inline
                minimal
                icon="command-approval"
                onClick={() => {
                  setApproved(true)
                }}
              />
            ) : (
              <Layout.Horizontal>
                <CustomSelect
                  items={roles}
                  filterable={false}
                  itemRenderer={(item, { handleClick }) => (
                    <div key={item.label}>
                      <Menu.Item
                        text={item.label}
                        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
                      />
                    </div>
                  )}
                  onItemSelect={item => {
                    setRole(item)
                  }}
                  popoverProps={{ minimal: true }}
                >
                  <Button inline minimal rightIcon="chevron-down" text={role.label} />
                </CustomSelect>
                <Button
                  inline
                  minimal
                  icon="command-approval"
                  disabled={role === defaultRole}
                  onClick={() => {
                    handleUpdate(InviteType.USER_INITIATED)
                  }}
                />
              </Layout.Horizontal>
            )}
            <Button inline minimal icon="remove" onClick={handleDelete} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default InviteListRenderer
