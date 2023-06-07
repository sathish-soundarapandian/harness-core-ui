/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { DateRangePickerButton, Layout, DropDown, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { useGetAuditEventList } from 'services/audit'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuditFilterProperties } from 'services/audit'
import { useMutateAsGet } from '@common/hooks'
import AuditTrailsFilters from '@audit-trail/components/AuditTrailsFilters'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ShowEventFilterType, showEventTypeMap } from '@audit-trail/utils/RequestUtil'
import AuditTrailsListView from './views/AuditTrailsListView'
import AuditTrailsEmptyState from './audit_trails_empty_state.png'
import css from './AuditTrailsPage.module.scss'

const AuditTrailsPage: React.FC = () => {
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

  const onDateChange = (selectedDates: [Date, Date]): void => {
    setPage(0)
    setStartDate(selectedDates[0])
    setEndDate(selectedDates[1])
  }

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

  const getShowEventsDropdownList = (): SelectOption[] => {
    return Object.keys(showEventTypeMap).map(key => {
      return {
        label: getString(showEventTypeMap[key as ShowEventFilterType]),
        value: key
      }
    })
  }

  const auditTrailTitle = getString('common.auditTrail')
  return (
    <>
      <Page.Header
        title={
          <ScopedTitle
            title={{
              [Scope.ACCOUNT]: auditTrailTitle,
              [Scope.PROJECT]: auditTrailTitle,
              [Scope.ORG]: auditTrailTitle
            }}
          />
        }
        breadcrumbs={<NGBreadcrumbs />}
        // content={
        //   <Text margin={{ right: 'tiny' }} font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        //     {getString('auditTrail.externalDataText')}
        //     <a className={css.link} target="_blank" href="https://harness.io/docs/api/tag/Audits" rel="noreferrer">
        //       {` ${getString('auditTrail.auditLogAPI')}`}
        //       <Icon
        //         className={css.launchIcon}
        //         margin={{ left: 'tiny', bottom: 'tiny' }}
        //         color={Color.PRIMARY_7}
        //         name="launch"
        //         size={12}
        //       />
        //     </a>
        //   </Text>
        // }
      />
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
        <AuditTrailsListView setPage={setPage} data={auditData?.data || {}} />
      </Page.Body>
    </>
  )
}

export default AuditTrailsPage
