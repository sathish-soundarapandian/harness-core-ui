/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Container, ExpandingSearchInput, Layout, PillToggle, Text } from '@harness/uicore'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { useStrings } from 'framework/strings'

import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import RbacButton from '@rbac/components/Button/Button'
import AddDiscoveryAgent from './views/AddDiscoveryAgent'

const DiscoveryPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const discoveryLabel = getString('common.discovery')
  const [discoveryView, setDiscoveryView] = useState('network-map')

  useDocumentTitle(discoveryLabel)

  const getAddNetworkButton = (): JSX.Element => (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <RbacButton
        icon="plus"
        text={getString('discovery.homepage.newNewtworkMapBtn')}
        variation={ButtonVariation.PRIMARY}
        onClick={() => void 0}
      />
      <Container data-name="monitoredServiceSeachContainer">
        <ExpandingSearchInput
          width={250}
          alwaysExpanded
          throttle={500}
          key={''}
          defaultValue={''}
          onChange={() => void 0}
          placeholder={getString('discovery.homepage.searchNeworkMap')}
        />
      </Container>
    </Layout.Horizontal>
  )

  const getAddDiscoverServiceButton = (): JSX.Element => (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <RbacButton
        icon="plus"
        text={getString('discovery.homepage.newServiceBtn')}
        variation={ButtonVariation.PRIMARY}
        onClick={() => void 0}
      />
      <Container data-name="monitoredServiceSeachContainer">
        <ExpandingSearchInput
          width={250}
          alwaysExpanded
          throttle={500}
          key={''}
          defaultValue={''}
          onChange={() => void 0}
          placeholder={getString('discovery.homepage.searchDelegate')}
        />
      </Container>
    </Layout.Horizontal>
  )

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
        <AddDiscoveryAgent />
      </Page.Body>
    </>
  )
}

export default DiscoveryPage
