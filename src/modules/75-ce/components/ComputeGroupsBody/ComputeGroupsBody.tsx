/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Container, Page, PageSpinner } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useGetClusterSummary } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CGTopPanel from './CGTopPanel'
import CGDataRow from './CGDataRow'
import ClusterTable from './ClusterTable'
import css from './ComputeGroupsBody.module.scss'

const ComputeGroupsBody: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  // const [data, setData] = useState({})
  // const [loading, setLoading] = useState(true)
  const { data, loading } = useGetClusterSummary({
    account_id: accountId,
    queryParams: { accountIdentifier: accountId }
  })

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Page.Body className={css.cgBodyContainer}>
      <CGTopPanel />
      <Container className={css.bodyWidgetsContainer}>
        <CGDataRow data={get(data, 'response', {})} />
        <ClusterTable />
      </Container>
    </Page.Body>
  )
}

export default ComputeGroupsBody
