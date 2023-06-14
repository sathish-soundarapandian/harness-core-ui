/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Icon, Layout, Text } from '@harness/uicore'
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
import { useQueryParams } from '@common/hooks'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, ServiceDiscoveryFilterParams } from '@discovery/interface/filters'
import EmptyStateDiscoveryAgent from './views/empty-state/EmptyStateDiscoveryAgent'
import CreateDAgent from './views/create-discovery-agent/CreateDAgent'
import css from './DiscoveryPage.module.scss'

const DiscoveryPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const discoveryLabel = getString('common.discovery')
  const [search, setSearch] = useState('')
  const [isOpen, setDrawerOpen] = useState(false)
  useDocumentTitle(discoveryLabel)

  //States for pagination
  const { page, size } = useQueryParams<ServiceDiscoveryFilterParams>()
  const paginationProps = useDefaultPaginationProps({
    itemCount: 100,
    pageSize: size ? parseInt(size) : DEFAULT_PAGE_SIZE,
    pageCount: 10,
    pageIndex: page ? parseInt(page) : 0
  })

  const { data: discoveryAgentList, loading: discoveryAgentListLoading } = useListInfra({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      search: search,
      all: false,
      page: page ? parseInt(page) : DEFAULT_PAGE_INDEX,
      limit: size ? parseInt(size) : DEFAULT_PAGE_SIZE
    }
  })

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
                      defaultValue={search}
                      onChange={value => setSearch(value)}
                      placeholder={getString('discovery.homepage.searchNeworkMap')}
                    />
                  </Container>
                </Layout.Horizontal>
              </Page.SubHeader>
              <Page.Body className={css.discoveryAgentTable}>
                <DiscoveryAgentTable list={discoveryAgentList?.items} pagination={paginationProps} />
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
        <Button
          minimal
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => setDrawerOpen(false)}
        />
        <CreateDAgent setDrawerOpen={setDrawerOpen} />
      </Drawer>
    </>
  )
}

export default DiscoveryPage
