/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Page } from '@harness/uicore'
import CGTopPanel from './CGTopPanel'
import CGDataRow from './CGDataRow'
import ClusterTable from './ClusterTable'
import css from './ComputeGroupsBody.module.scss'

const ComputeGroupsBody: React.FC = () => {
  return (
    <Page.Body className={css.cgBodyContainer}>
      <CGTopPanel />
      <Container className={css.bodyWidgetsContainer}>
        <CGDataRow />
        <ClusterTable />
      </Container>
    </Page.Body>
  )
}

export default ComputeGroupsBody
