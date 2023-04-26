/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, /* Layout, */ PageSpinner /* Pagination */, Pagination } from '@harness/uicore'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import type { ResponsePageServiceResponse, ServiceResponse } from 'services/cd-ng'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import ServiceCard from '../ServiceCard/ServiceCard'
import { SERVICES_DEFAULT_PAGE_SIZE } from '../utils/ServiceUtils'
import css from './ServicesGridView.module.scss'

interface ServicesGridViewProps {
  data: ResponsePageServiceResponse | null
  loading?: boolean
  onRefresh?: () => Promise<void>
  onServiceSelect: (data: any) => Promise<void>
  isForceDeleteEnabled: boolean
}

const ServicesGridView: React.FC<ServicesGridViewProps> = props => {
  const { loading, data, onServiceSelect, isForceDeleteEnabled } = props
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const paginationProps = useDefaultPaginationProps({
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : SERVICES_DEFAULT_PAGE_SIZE),
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0
  })

  return (
    <>
      {loading ? (
        <div style={{ zIndex: 1 }}>
          <PageSpinner />
        </div>
      ) : (
        <>
          <HelpPanel referenceId="serviceDetails" type={HelpPanelType.FLOATING_CONTAINER} />
          <Container className={css.masonry} style={{ height: 'calc(100% - 66px)', width: '100%' }}>
            <Layout.Masonry
              center
              gutter={25}
              items={data?.data?.content || []}
              renderItem={(service: ServiceResponse) => (
                <ServiceCard
                  onServiceSelect={(selectedService: any) => onServiceSelect(selectedService)}
                  data={service}
                  onRefresh={props.onRefresh}
                  isForceDeleteEnabled={isForceDeleteEnabled}
                />
              )}
              keyOf={service => service?.service?.identifier}
            />
          </Container>
          <Container className={css.pagination}>
            <Pagination {...paginationProps} />
          </Container>
        </>
      )}
    </>
  )
}

export default ServicesGridView
