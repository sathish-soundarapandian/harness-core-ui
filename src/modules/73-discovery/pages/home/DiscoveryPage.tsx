/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Container, ExpandingSearchInput, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Drawer, Position } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { useListInfra } from 'services/servicediscovery'
import RbacButton from '@rbac/components/Button/Button'
import DiscoveryAgentTable from '@discovery/components/DiscoveryAgentTable/DiscoveryAgentTable'
import EmptyStateDiscoveryAgent from './views/empty-state/EmptyStateDiscoveryAgent'
import CreateDAgent from './views/create-discovery-agent/CreateDAgent'
import css from './DiscoveryPage.module.scss'

const DiscoveryPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const discoveryLabel = getString('common.discovery')
  const [isOpen, setDrawerOpen] = useState(false)

  useDocumentTitle(discoveryLabel)

  const { data: discoveryAgentList, loading: discoveryAgentListLoading } = useListInfra({})

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

      {discoveryAgentListLoading ? (
        <Container width={'100%'} flex={{ align: 'center-center' }}>
          <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
            <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
            <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
              {getString('loading')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : (
        <Container>
          {discoveryAgentList && discoveryAgentList.items && discoveryAgentList?.items?.length > 0 ? (
            <>
              <Page.SubHeader>
                <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
                  <Layout.Horizontal>
                    <RbacButton
                      text="New Discovery Agent"
                      variation={ButtonVariation.PRIMARY}
                      icon="plus"
                      onClick={() => setDrawerOpen(true)}
                    />
                  </Layout.Horizontal>
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
              </Page.SubHeader>
              <Page.Body className={css.discoveryAgentTable}>
                <DiscoveryAgentTable list={discoveryAgentList?.items} />
              </Page.Body>
            </>
          ) : (
            <Page.Body>
              <EmptyStateDiscoveryAgent setDrawerOpen={setDrawerOpen} />
            </Page.Body>
          )}
        </Container>
      )}
      <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <CreateDAgent setDrawerOpen={setDrawerOpen} />
      </Drawer>
    </>
  )
}

export default DiscoveryPage
