/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Drawer, Position } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import EmptyStateDiscoveryAgent from './views/empty-state/EmptyStateDiscoveryAgent'
import CreateDAgent from './views/create-discovery-agent/CreateDAgent'

const DiscoveryPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const discoveryLabel = getString('common.discovery')
  const [isOpen, setDrawerOpen] = useState(false)

  useDocumentTitle(discoveryLabel)

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: discoveryLabel,
              [Scope.ORG]: discoveryLabel,
              [Scope.ACCOUNT]: discoveryLabel
            }}
          />
        }
      />
      {/* <Page.SubHeader>
        {discoveryView === 'network-map' ? getAddNetworkButton() : getAddDiscoverServiceButton()}
      </Page.SubHeader> */}
      <Page.Body>
        {/* <Container padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }} height="inherit">
          {discoveryView === 'network-map' ? (
            <NetworkMapTable />
          ) : (
            <Text>{getString('discovery.serviceDiscoveyTable')}</Text>
          )}
        </Container> */}
        <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
          <CreateDAgent setDrawerOpen={setDrawerOpen} />
        </Drawer>
        <EmptyStateDiscoveryAgent setDrawerOpen={setDrawerOpen} />
      </Page.Body>
    </>
  )
}

export default DiscoveryPage
