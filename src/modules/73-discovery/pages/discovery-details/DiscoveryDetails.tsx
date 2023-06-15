/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Container, Layout, Page, Tabs, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ModulePathParams, DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import { useGetInfra } from 'services/servicediscovery'
import DiscoveredServices from './views/discovered-resources/DiscoveredServices'
import NetworkMapTable from './views/network-map/NetworkMapTable'
import DiscoveryHistory from './views/discovery-history/DiscoveryHistory'
import Settings from './views/settings/Settings'
import css from './DiscoveryDetails.module.scss'

const DiscoveryDetails: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, dAgentId } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()

  const { data: discoveryAgentData } = useGetInfra({
    infraIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const date = moment(discoveryAgentData?.updatedAt).format('MMM DD, YYYY hh:mm A')

  return (
    <>
      <Page.Header
        className={css.header}
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <Container width={'100%'} flex={{ justifyContent: 'space-between' }}>
            <Layout.Vertical>
              <Layout.Horizontal spacing="small">
                <Text color={Color.BLACK} style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                  {discoveryAgentData?.name}
                </Text>
                <Text
                  margin={{ left: 'small' }}
                  inline
                  icon={'full-circle'}
                  iconProps={{ size: 6, color: Color.GREEN_500 }}
                  tooltipProps={{ isDark: true, position: 'bottom' }}
                  font={{ size: 'small' }}
                >
                  Connected
                </Text>
              </Layout.Horizontal>
              <Text color={'#6B6D85'} font={{ size: 'small' }} margin={{ right: 'small' }}>
                ID: {discoveryAgentData?.identity}
              </Text>
            </Layout.Vertical>
          </Container>
        }
        toolbar={
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
            <Text font={{ size: 'small' }}>Last discovery: {date}</Text>
            <Button
              margin={{ left: 'medium' }}
              icon="edit"
              rightIcon="chevron-down"
              variation={ButtonVariation.SECONDARY}
              text="Edit"
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <Layout.Horizontal className={css.tabsContainerMain} flex={{ justifyContent: 'space-between' }}>
          <Container width={'100%'}>
            <Tabs
              id={'DiscoveredServiceTab'}
              defaultSelectedTabId={'discovered services'}
              tabList={[
                {
                  id: 'discovered services',
                  title: 'Discovered Resources',
                  panel: <DiscoveredServices />
                },
                {
                  id: 'network maps',
                  title: 'Network Maps',
                  panel: <NetworkMapTable />
                },
                {
                  id: 'discovery history',
                  title: 'Discovery History',
                  panel: <DiscoveryHistory />
                },
                {
                  id: 'settings',
                  title: 'Settings',
                  panel: <Settings />
                }
              ]}
            />
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default DiscoveryDetails
