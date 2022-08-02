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
import ServiceCard from '../ServiceCard/ServiceCard'
import css from './ServicesGridView.module.scss'

interface ServicesGridViewProps {
  data: ResponsePageServiceResponse | null
  loading?: boolean
  onRefresh?: () => Promise<void>
  gotoPage?: (index: number) => void
  onServiceSelect: (data: any) => Promise<void>
}

const ServicesGridView: React.FC<ServicesGridViewProps> = props => {
  const { loading, data, gotoPage, onServiceSelect } = props

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
                />
              )}
              keyOf={service => service?.service?.identifier}
            />
          </Container>
          <Container className={css.pagination}>
            <Pagination
              itemCount={data?.data?.totalItems || 0}
              pageSize={data?.data?.pageSize || 10}
              pageCount={data?.data?.totalPages || 0}
              pageIndex={data?.data?.pageIndex || 0}
              gotoPage={gotoPage}
            />
          </Container>
        </>
      )}
    </>
  )
}

export default ServicesGridView
