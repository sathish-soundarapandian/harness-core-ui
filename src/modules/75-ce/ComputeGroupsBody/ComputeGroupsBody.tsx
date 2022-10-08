/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Page, PageSpinner } from '@harness/uicore'
import CGTopPanel from './CGTopPanel'
import CGDataRow from './CGDataRow'
import ClusterTable from './ClusterTable'
import css from './ComputeGroupsBody.module.scss'

const ComputeGroupsBody: React.FC = () => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: fetch data for overview page
    setTimeout(() => {
      setData({
        account_id: 'accID',
        cpu: {
          total: 10,
          un_allocated: 4,
          utilized: 6
        },
        memory: {
          total: 10,
          un_allocated: 4,
          utilized: 6
        },
        nodes: {
          committed: 0,
          fallback: 0,
          harness_mgd: 0,
          'on-demand': 1,
          spot: 0,
          committed_cost: 0,
          fallback_cost: 0,
          harness_mgd_cost: 153.21,
          'on-demand_cost': 10.2,
          spot_cost: 4.6,
          cpu: {
            total: 10,
            un_allocated: 4,
            utilized: 6
          },
          memory: {
            total: 10,
            un_allocated: 4,
            utilized: 6
          }
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Page.Body className={css.cgBodyContainer}>
      <CGTopPanel />
      <Container className={css.bodyWidgetsContainer}>
        <CGDataRow data={data} />
        <ClusterTable />
      </Container>
    </Page.Body>
  )
}

export default ComputeGroupsBody
