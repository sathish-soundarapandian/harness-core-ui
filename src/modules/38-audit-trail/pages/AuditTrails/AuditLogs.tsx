/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DateRangePickerButton, Layout, DropDown, SelectOption } from '@harness/uicore'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { Page } from '@common/exports'
import { ShowEventFilterType, showEventTypeMap } from '@audit-trail/utils/RequestUtil'
import AuditTrailsFilters from '@audit-trail/components/AuditTrailsFilters'
import { useStrings } from 'framework/strings'
import type { AuditFilterProperties } from 'services/audit'
import { useGetAuditEventList } from 'services/audit'
import AuditLogsListView from './views/AuditLogsListView'
import AuditTrailsEmptyState from './audit_trails_empty_state.png'
import css from './AuditTrailsPage.module.scss'

const AuditLogs: React.FC = () => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const [selectedFilterProperties, setSelectedFilterProperties] = useState<AuditFilterProperties>()
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const [startDate, setStartDate] = useState<Date>(() => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return start
  })

  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end
  })

  const {
    data: auditData,
    loading,
    error,
    refetch
  } = useMutateAsGet(useGetAuditEventList, {
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 10,
      pageIndex: page
    },
    body: {
      scopes: [{ accountIdentifier: accountId, orgIdentifier }],
      ...selectedFilterProperties,
      filterType: 'Audit',
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
    }
  })

  const onDateChange = (selectedDates: [Date, Date]): void => {
    setPage(0)
    setStartDate(selectedDates[0])
    setEndDate(selectedDates[1])
  }

  const getShowEventsDropdownList = (): SelectOption[] => {
    return Object.keys(showEventTypeMap).map(key => {
      return {
        label: getString(showEventTypeMap[key as ShowEventFilterType]),
        value: key
      }
    })
  }
  return (
    <>
      <Page.SubHeader className={css.subHeaderContainer}>
        <Layout.Horizontal flex className={css.subHeader}>
          <Layout.Horizontal>
            <DateRangePickerButton
              className={css.dateRange}
              initialButtonText={getString('common.last7days')}
              dateRangePickerProps={{ defaultValue: [startDate, endDate] }}
              onChange={onDateChange}
              renderButtonText={selectedDates =>
                `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
              }
            />
            <DropDown
              items={getShowEventsDropdownList()}
              filterable={false}
              addClearBtn={true}
              placeholder={getString('auditTrail.allEvents')}
              value={selectedFilterProperties?.staticFilter}
              width={170}
              onChange={selected => {
                const staticFilter = selected.value
                  ? (selected.value as AuditFilterProperties['staticFilter'])
                  : undefined
                setSelectedFilterProperties({
                  ...selectedFilterProperties,
                  staticFilter: staticFilter
                })
              }}
            />
          </Layout.Horizontal>
          <Layout.Horizontal flex>
            <AuditTrailsFilters
              applyFilters={(properties: AuditFilterProperties) => {
                setPage(0)
                setSelectedFilterProperties(properties)
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body
        className={css.pageBody}
        noData={{
          when: () => !auditData?.data?.content?.length,
          image: AuditTrailsEmptyState,
          imageClassName: css.emptyStateImage,
          messageTitle: getString('auditTrail.emptyStateMessageTitle'),
          message: getString('auditTrail.emptyStateMessage')
        }}
        error={(error as any)?.data?.message || error?.message}
        retryOnError={() => refetch()}
        loading={loading}
      >
        <AuditLogsListView setPage={setPage} data={auditData?.data || {}} />
      </Page.Body>
    </>
  )
}

export default AuditLogs
