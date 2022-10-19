/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isEqual } from 'lodash-es'
import type { CellProps, Renderer } from 'react-table'
import { useStrings } from 'framework/strings'
import { NotificationsHeader } from '@pipeline/components/Notifications/NotificationHeader'
import NotificationTable, {
  NotificationRulesItem as _NotificationRulesItem,
  RenderColumnEventsContent
} from '@pipeline/components/Notifications/NotificationTable'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import type { FreezeNotificationRules } from '@freeze-windows/types'
import { FreezeEvents } from './FreezeEvents'
import css from '@pipeline/components/PipelineStudio/PipelineNotifications/PipelineNotifications.module.scss'
import notificationCss from '@pipeline/components/Notifications/NotificationTable.module.scss'

const PAGE_SIZE = 10

export interface NotificationRulesItem {
  index: number
  notificationRules: FreezeNotificationRules
}

const RenderColumnEvents: Renderer<CellProps<NotificationRulesItem>> = ({ row }) => {
  const data = row.original.notificationRules.events?.map(event => event.type)
  return <RenderColumnEventsContent data={data as any} />
}

export const FreezeNotifications = () => {
  const { getString } = useStrings()
  const {
    isReadOnly,
    state: { freezeObj },
    updateFreeze: updateFreezeInContext,
    setDrawerType
  } = React.useContext(FreezeWindowContext)
  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = React.useState(0)
  // Notification component rules
  const [initialNotificatioRules] = React.useState(freezeObj.notificationRules)
  const [notificationRulesInState, setNotificationRulesInState] = React.useState<FreezeNotificationRules[]>(
    (freezeObj.notificationRules || []) as FreezeNotificationRules[]
  )

  const eventsColumnConfig = {
    Header: getString('conditions').toUpperCase(),
    id: 'events',
    className: notificationCss.notificationTableHeader,
    accessor: (row: NotificationRulesItem) => row.notificationRules.events,
    width: '35%',
    Cell: RenderColumnEvents,
    disableSortBy: true
  }

  const applyChanges = async () => {
    await updateFreezeInContext({ notificationRules: notificationRulesInState })
    setDrawerType()
  }

  const allRowsData: NotificationRulesItem[] = (notificationRulesInState || []).map(
    (notificationRules: FreezeNotificationRules, index: number) => ({
      index,
      notificationRules
    })
  )

  // filter table data
  let data = allRowsData
  if (selectedNotificationTypeFilter) {
    data = allRowsData.filter(
      item => item.notificationRules.notificationMethod?.type === selectedNotificationTypeFilter
    )
  }

  const isUpdated = React.useMemo(() => {
    return !isEqual(initialNotificatioRules || [], notificationRulesInState)
  }, [initialNotificatioRules, notificationRulesInState])

  return (
    <>
      <NotificationsHeader
        isReadonly={isReadOnly}
        applyChanges={applyChanges}
        discardChanges={() => setDrawerType()}
        name={freezeObj.name as string}
        isUpdated={isUpdated}
      />
      <div className={css.pipelineNotifications}>
        <NotificationTable
          // getExistingNotificationNames
          data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          onUpdate={(notificationItem?: _NotificationRulesItem, action?: Actions, closeModal?: () => void) => {
            const index = notificationItem?.index
            const notification: FreezeNotificationRules = notificationItem?.notificationRules as FreezeNotificationRules

            if (action === Actions.Delete) {
              setNotificationRulesInState((notificationRules: FreezeNotificationRules[]) => {
                const updatedNotifications = [...notificationRules]
                updatedNotifications?.splice(index || 0, 1)
                return [...updatedNotifications]
              })
            } else if (action === Actions.Added && notification) {
              setNotificationRulesInState((notificationRules: FreezeNotificationRules[]) => {
                notification.enabled = true
                return [notification, ...notificationRules]
              })
              closeModal?.()
            } else if (action === Actions.Update && notification) {
              setNotificationRulesInState(notificationRules => {
                const updatedNotifications = [...notificationRules]
                updatedNotifications?.splice(index || 0, 1, notification)
                return [...updatedNotifications]
              })
              closeModal?.()
            }
          }}
          filterType={selectedNotificationTypeFilter}
          onFilterType={type => {
            setSelectedNotificationTypeFilter(type)
          }}
          gotoPage={index => {
            setPage(index)
          }}
          totalItems={data.length}
          totalPages={Math.ceil(data.length / PAGE_SIZE)}
          pageItemCount={PAGE_SIZE}
          pageSize={PAGE_SIZE}
          pageIndex={page}
          isReadonly={isReadOnly}
          EventsTabComponent={FreezeEvents}
          eventsColumnConfig={eventsColumnConfig as any}
        />
      </div>
    </>
  )
}
