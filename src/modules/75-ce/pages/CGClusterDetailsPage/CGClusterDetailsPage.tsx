/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Color, Container, FontVariation, Icon, Layout, Page, PageHeader, TabNavigation, Text } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CopyButton from '@ce/common/CopyButton'
import CGClusterDetailsBody from '@ce/components/CGClusterDetailsBody/CGClusterDetailsBody'
import WorkloadDetails from '@ce/components/CGClusterDetailsBody/WorkloadDetails'
import NodepoolDetails from '@ce/components/CGClusterDetailsBody/NodepoolDetails'

interface NavigationLink {
  label: string
  to: string
  disabled?: boolean
}

const CGClusterDetailsPage: React.FC = () => {
  const { accountId, id } = useParams<AccountPathProps & { id: string }>()
  const { pathname } = useLocation()
  const isOverviewTab = pathname.includes('overview')
  const isWorkloadsTab = pathname.includes('workloads')
  const isNodepoolTab = pathname.includes('nodepool')
  const { getString } = useStrings()
  const breadcrumbLinks = useMemo(
    () => [
      {
        url: routes.toComputeGroups({ accountId }),
        label: getString('ce.computeGroups.sideNavText')
      }
    ],
    [accountId]
  )

  const navigationLinks: NavigationLink[] = useMemo(
    () => [
      {
        label: getString('overview'),
        to: routes.toClusterDetailsPage({ accountId, id })
      },
      {
        label: getString('ce.computeGroups.clusterDetails.workloads'),
        to: routes.toClusterWorkloadsDetailsPage({ accountId, id })
      },
      {
        label: getString('ce.nodeRecommendation.nodepool'),
        to: routes.toClusterNodepoolDetailsPage({ accountId, id })
      }
    ],
    [accountId]
  )

  return (
    <Container>
      <PageHeader
        size="xlarge"
        breadcrumbs={<NGBreadcrumbs links={breadcrumbLinks} />}
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name={'app-kubernetes'} size={50} />
            <Layout.Vertical spacing={'small'}>
              <Layout.Horizontal spacing={'huge'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text font={{ variation: FontVariation.H4 }}>{defaultTo('MyK8sCluster', '')}</Text>
                <Container>
                  <Text icon="check-alt" iconProps={{ color: Color.GREEN_700, size: 18 }}>
                    Enabled
                  </Text>
                </Container>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text>ID: ndy92hiufhwiibdwyi932b8</Text>
                <CopyButton textToCopy={'ndy92hiufhwiibdwyi932b8'} />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={<TabNavigation size="small" links={navigationLinks} />}
      />
      <Page.Body>
        {isOverviewTab && <CGClusterDetailsBody />}
        {isWorkloadsTab && <WorkloadDetails />}
        {isNodepoolTab && <NodepoolDetails />}
      </Page.Body>
    </Container>
  )
}

export default CGClusterDetailsPage
