/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import {
  Color,
  Container,
  FontVariation,
  Icon,
  Layout,
  Page,
  PageHeader,
  PageSpinner,
  TabNavigation,
  Text
} from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useGetClusterDetails } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CopyButton from '@ce/common/CopyButton'
import CGClusterDetailsBody from '@ce/components/CGClusterDetailsBody/CGClusterDetailsBody'
import WorkloadDetails from '@ce/components/CGClusterDetailsBody/WorkloadDetails'
import NodepoolDetails from '@ce/components/CGClusterDetailsBody/NodepoolDetails'
import css from '@ce/components/ComputeGroupsBody/ComputeGroupsBody.module.scss'

interface NavigationLink {
  label: string
  to: string
  disabled?: boolean
}

const CGClusterDetailsPage: React.FC = () => {
  const { accountId, id, cloudId } = useParams<AccountPathProps & { id: string; cloudId: string }>()
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

  // const [data, setData] = useState({})
  // const [loading, setLoading] = useState(true)
  const { data, loading } = useGetClusterDetails({
    account_id: accountId,
    clusterId: id,
    queryParams: { accountIdentifier: accountId, cloud_account_id: cloudId }
  })

  // useEffect(() => {
  //   setData({
  //     account_id: 'accID',
  //     cloud_account_id: 'cloudAccID',
  //     cpu: {
  //       total: 10,
  //       un_allocated: 4,
  //       utilized: 6
  //     },
  //     create_time: '0001-01-01T00:00:00Z',
  //     created_at: '0001-01-01T00:00:00Z',
  //     id: 'cloudAccID',
  //     memory: {
  //       total: 10,
  //       un_allocated: 4,
  //       utilized: 6
  //     },
  //     name: 'riyasyash-karpenter-demo',
  //     nodes: {
  //       committed: 0,
  //       cpu: {
  //         total: 10,
  //         un_allocated: 4,
  //         utilized: 6
  //       },
  //       fallback: 0,
  //       harness_mgd: 0,
  //       memory: {
  //         total: 10,
  //         un_allocated: 4,
  //         utilized: 6
  //       },
  //       'on-demand': 1,
  //       spot: 0
  //     },
  //     pods: {
  //       committed: 0,
  //       'on-demand': 15,
  //       scheduled: 15,
  //       spot: 0,
  //       total: 15,
  //       un_scheduled: 0
  //     },
  //     region: 'us-west-2',
  //     resource_version: 0,
  //     status: 'enabled'
  //   })
  //   setLoading(false)
  // }, [])

  const navigationLinks: NavigationLink[] = useMemo(
    () => [
      {
        label: getString('overview'),
        to: routes.toClusterDetailsPage({ accountId, id, cloudId })
      },
      {
        label: getString('ce.computeGroups.clusterDetails.workloads'),
        to: routes.toClusterWorkloadsDetailsPage({ accountId, id, cloudId })
      },
      {
        label: getString('ce.nodeRecommendation.nodepool'),
        to: routes.toClusterNodepoolDetailsPage({ accountId, id, cloudId })
      }
    ],
    [accountId]
  )

  const clusterId = get(data, 'response.id', '')

  if (loading) {
    return <PageSpinner />
  }

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
                <Text font={{ variation: FontVariation.H4 }}>{defaultTo(get(data, 'response.name'), '')}</Text>
                <Container className={css.enableCell}>
                  <Text
                    font={{ variation: FontVariation.LEAD }}
                    icon="command-artifact-check"
                    iconProps={{ color: Color.GREEN_700, size: 12 }}
                  >
                    {getString('enabledLabel')}
                  </Text>
                </Container>
              </Layout.Horizontal>
              {clusterId && (
                <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text>{`ID: ${clusterId}`}</Text>
                  <CopyButton textToCopy={clusterId} />
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={<TabNavigation size="small" links={navigationLinks} />}
      />
      <Page.Body>
        {isOverviewTab && <CGClusterDetailsBody data={get(data, 'response', '')} />}
        {isWorkloadsTab && <WorkloadDetails />}
        {isNodepoolTab && <NodepoolDetails />}
      </Page.Body>
    </Container>
  )
}

export default CGClusterDetailsPage
