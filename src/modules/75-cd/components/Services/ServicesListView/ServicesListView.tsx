/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, PageSpinner, Pagination, TableV2 } from '@harness/uicore'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import type { ResponsePageServiceResponse, ServiceResponseDTO } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { ServiceName, ServiceDescription, ServiceMenu } from '../ServicesListColumns/ServicesListColumns'
import { SERVICES_DEFAULT_PAGE_SIZE } from '../utils/ServiceUtils'
import css from './ServicesListView.module.scss'

interface ServicesListViewProps {
  data: ResponsePageServiceResponse | null
  loading?: boolean
  onRefresh?: () => Promise<void>
  onServiceSelect: (data: any) => Promise<void>
  isForceDeleteEnabled: boolean
}
const ServicesListView = (props: ServicesListViewProps): React.ReactElement => {
  const { data, onServiceSelect, loading, isForceDeleteEnabled } = props
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const paginationProps = useDefaultPaginationProps({
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : SERVICES_DEFAULT_PAGE_SIZE),
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0
  })

  const services = data?.data?.content?.map(service => service.service) || []
  if (loading) {
    return <PageSpinner />
  }
  return (
    <>
      <HelpPanel referenceId="serviceDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      <Container className={css.masonry} style={{ height: 'calc(100% - 66px)', width: '100%' }}>
        <TableV2<any>
          className={css.table}
          columns={[
            {
              Header: 'SERVICE',
              id: 'name',
              width: '60%',
              Cell: ServiceName
            },
            {
              Header: 'DESCRIPTION',
              id: 'destination',
              width: '35%',
              Cell: ServiceDescription
            },
            {
              Header: '',
              id: 'menu',
              width: '3%',
              // eslint-disable-next-line react/display-name
              Cell: ({ row }: { row: { original: unknown } }) => (
                <ServiceMenu
                  data={row.original}
                  onRefresh={props.onRefresh}
                  isForceDeleteEnabled={isForceDeleteEnabled}
                />
              )
            }
          ]}
          data={services}
          onRowClick={(row: ServiceResponseDTO) => onServiceSelect(row)}
        />
      </Container>

      <Container className={css.pagination}>
        <Pagination {...paginationProps} />
      </Container>
    </>
  )
}

export default ServicesListView
