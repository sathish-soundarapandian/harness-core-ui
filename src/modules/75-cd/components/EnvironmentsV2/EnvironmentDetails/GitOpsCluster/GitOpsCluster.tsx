/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container } from '@harness/uicore'
import AddCluster from '../AddCluster'
import ClusterTableView from '../ClusterTableView'

const GitOpsCluster = (props: any): React.ReactElement => {
  const [showSelectClusterModal, setShowClusterModal] = React.useState(false)
  return (
    <Container padding={{ left: 'medium', right: 'medium' }}>
      <>
        <Button
          minimal
          intent="primary"
          onClick={() => {
            setShowClusterModal(true)
          }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
        >
          Select Cluster
        </Button>
        <Container border={{ top: true }}>
          <ClusterTableView {...props} />
          {showSelectClusterModal ? (
            <AddCluster
              onHide={() => {
                setShowClusterModal(false)
              }}
              {...props}
            />
          ) : null}
        </Container>
      </>
    </Container>
  )
}

export default GitOpsCluster
