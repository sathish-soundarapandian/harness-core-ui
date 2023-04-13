/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DateRangePickerButton, Layout, DropDown, SelectOption } from '@harness/uicore'
import type { DateRange } from '@blueprintjs/datetime'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { Page } from '@common/exports'
import {
  AuditTrailQueryParams,
  ShowEventFilterType,
  showEventTypeMap,
  useAuditTrailQueryParamOptions
} from '@audit-trail/utils/RequestUtil'
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
  const queryParamOptions = useAuditTrailQueryParamOptions()
  const { staticFilter, page, dateFilter, size } = useQueryParams(queryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<AuditTrailQueryParams>()
  const { getString } = useStrings()

  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const {
    data: auditData,
    loading,
    error,
    refetch
  } = useMutateAsGet(useGetAuditEventList, {
    queryParams: {
      accountIdentifier: accountId,
      pageSize: size,
      pageIndex: page
    },
    body: {
      scopes: [{ accountIdentifier: accountId, orgIdentifier }],
      ...selectedFilterProperties,
      filterType: 'Audit',
      staticFilter,
      startTime: dateFilter.startTime,
      endTime: dateFilter.endTime
    }
  })

  const onDateChange = (selectedDates: [Date, Date]): void => {
    updateQueryParams({
      page: 0,
      dateFilter: {
        startTime: selectedDates[0].getTime().toString(),
        endTime: selectedDates[1].getTime().toString()
      }
    })
  }

  const getShowEventsDropdownList = (): SelectOption[] => {
    return Object.keys(showEventTypeMap).map(key => {
      return {
        label: getString(showEventTypeMap[key as ShowEventFilterType]),
        value: key
      }
    })
  }
  const dateRange: DateRange = [new Date(Number(dateFilter.startTime)), new Date(Number(dateFilter.endTime))]
  const isLast7Days = dateRange[0]?.getTime() === start.getTime() && dateRange[1]?.getTime() === end.getTime()
  return (
    <>
      <Page.SubHeader className={css.subHeaderContainer}>
        <Layout.Horizontal flex className={css.subHeader}>
          <Layout.Horizontal>
            <DateRangePickerButton
              className={css.dateRange}
              initialButtonText={
                isLast7Days
                  ? getString('common.last7days')
                  : `${dateRange[0]?.toLocaleDateString()} - ${dateRange[1]?.toLocaleDateString()}`
              }
              dateRangePickerProps={{
                defaultValue: dateRange
              }}
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
              value={staticFilter}
              width={170}
              onChange={selected => {
                updateQueryParams({
                  page: 0,
                  staticFilter: selected.value ? (selected.value as AuditFilterProperties['staticFilter']) : undefined
                })
              }}
            />
          </Layout.Horizontal>
          <Layout.Horizontal flex>
            <AuditTrailsFilters
              applyFilters={(properties: AuditFilterProperties) => {
                updateQueryParams({ page: 0 })
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
        <AuditLogsListView data={auditData?.data || {}} />
      </Page.Body>
    </>
  )
}

export default AuditLogs
