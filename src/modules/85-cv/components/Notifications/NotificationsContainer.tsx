/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Container, Icon, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { CompositeSLOContext } from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/CompositeSLOContext'
import SRMNotificationTable from '@cv/components/Notifications/components/SRMNotificationTable/SRMNotificationTable'
import { GET_NOTIFICATIONS_PAGE_SIZE } from './NotificationsContainer.constants'
import { NotificationsContainerProps, SRMNotificationType } from './NotificationsContainer.types'
import { getErrorMessage } from '../ExecutionVerification/components/DeploymentMetrics/DeploymentMetrics.utils'
import css from './NotificationsContainer.module.scss'

export default function NotificationsContainer(props: NotificationsContainerProps): JSX.Element {
  const {
    children,
    type,
    handleDeleteNotification,
    handleCreateNotification,
    handleToggleNotification,
    notificationsInTable,
    setPage,
    loading,
    error,
    page,
    getNotifications
  } = props

  const { getString } = useStrings()
  const { renderInsideCompositeSLO } = useContext(CompositeSLOContext)
  const containerBorder = renderInsideCompositeSLO ? false : { top: true, bottom: true }

  const renderContent = (): JSX.Element => {
    if (loading) {
      return (
        <Container
          height={200}
          flex={{ justifyContent: 'center' }}
          border={containerBorder}
          style={{ overflow: 'auto' }}
        >
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    }
    if (error) {
      return (
        <Container height={200} border={containerBorder} style={{ overflow: 'auto' }}>
          <PageError width={400} message={getErrorMessage(error)} onClick={() => getNotifications()} />
        </Container>
      )
    }
    return (
      <SRMNotificationTable
        handleDeleteNotification={handleDeleteNotification}
        handleCreateNotification={handleCreateNotification}
        handleToggleNotification={handleToggleNotification}
        data={notificationsInTable?.slice(page * GET_NOTIFICATIONS_PAGE_SIZE, (page + 1) * GET_NOTIFICATIONS_PAGE_SIZE)}
        notificationRulesComponent={children}
        pageIndex={page}
        totalPages={Math.ceil(notificationsInTable.length / GET_NOTIFICATIONS_PAGE_SIZE)}
        pageItemCount={GET_NOTIFICATIONS_PAGE_SIZE}
        pageSize={GET_NOTIFICATIONS_PAGE_SIZE}
        totalItems={notificationsInTable.length}
        gotoPage={(index: number) => {
          setPage(index)
        }}
      />
    )
  }

  if (renderInsideCompositeSLO) {
    return renderContent()
  }

  return (
    <CardWithOuterTitle className={css.notificationsContainer}>
      <Text tooltipProps={{ dataTooltipId: 'healthSourcesLabel' }} className={css.tableTitle}>
        {type == SRMNotificationType.SERVICE_LEVEL_OBJECTIVE
          ? getString('cv.notifications.errorBudgetPolicies')
          : getString('rbac.notifications.name')}
      </Text>
      {renderContent()}
    </CardWithOuterTitle>
  )
}
