/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Layout, Avatar, Icon, PageError, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetAggregatedUser } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageSpinner } from '@common/components'
import type { PipelineType, ProjectPathProps, UserPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import ScopeFilter, { UserDetailsViews } from './views/ScopeFilter'
import css from './UserDetails.module.scss'

const UserDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userIdentifier } =
    useParams<PipelineType<ProjectPathProps & UserPathProps>>()
  const [view, setView] = useState<UserDetailsViews>(UserDetailsViews.MEMBERSHIPS)
  const { data, loading, error, refetch } = useGetAggregatedUser({
    userId: userIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { getRBACErrorMessage } = useRBACError()

  const user = data?.data?.user

  useDocumentTitle([user?.name || '', getString('users')])

  if (loading) {
    return <PageSpinner />
  }
  if (error) {
    return <PageError message={getRBACErrorMessage(error)} onClick={() => refetch()} />
  }
  if (!data?.data || !user) {
    return <></>
  }
  return (
    <>
      <Page.Header
        size="xlarge"
        className={css.header}
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
                label: `${getString('accessControl')}: ${getString('users')}`
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
            {user.locked ? (
              <Icon
                name="lock"
                border
                className={css.lockIcon}
                width={72}
                height={72}
                size={32}
                color={Color.WHITE}
                background={Color.GREY_300}
                flex={{ align: 'center-center' }}
                margin={{ left: 'xsmall', right: 'xsmall' }}
              />
            ) : (
              <Avatar name={user.name || user.email} email={user.email} size="large" hoverCard={false} />
            )}

            <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
              <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {user.name}
                </Text>
                {user.locked ? <Text color={Color.GREY_400}>{getString('rbac.usersPage.lockedOutLabel')}</Text> : null}
              </Layout.Horizontal>
              <Text>{user.email}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
      />
      <Layout.Horizontal
        flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}
        spacing="small"
        className={css.tabs}
      >
        <Button
          text={getString('rbac.userDetails.groupMemberships')}
          minimal
          className={cx(css.tabButton, { [css.selectedTabs]: view == UserDetailsViews.MEMBERSHIPS })}
          onClick={() => setView(UserDetailsViews.MEMBERSHIPS)}
        />
        <Button
          text={getString('rbac.roleBindings')}
          minimal
          className={cx({ [css.selectedTabs]: view === UserDetailsViews.ROLE_BINDING }, css.tabButton)}
          onClick={() => setView(UserDetailsViews.ROLE_BINDING)}
        />
      </Layout.Horizontal>

      <ScopeFilter view={view} userData={data.data} />
    </>
  )
}

export default UserDetails
