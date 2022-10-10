/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
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
import { useGetConnector } from 'services/cd-ng'
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

  const [refreshLoading, setRefreshLoading] = useState(false)

  const {
    data,
    loading,
    refetch: fetchClusterDetails
  } = useGetClusterDetails({
    account_id: accountId,
    clusterId: id,
    queryParams: { accountIdentifier: accountId, cloud_account_id: cloudId }
  })

  const { data: connectorData, refetch: refetchConnector } = useGetConnector({
    identifier: get(data, 'response.cloud_account_id', ''),
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  // Temp implemenation for demo purpose. Rectify afterwards
  useEffect(() => {
    if (isOverviewTab) {
      fetchClusterDetails()
    }
  }, [isOverviewTab])

  useEffect(() => {
    if (!isEmpty(get(data, 'response'))) {
      refetchConnector()
    }
  }, [data])

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
        label: getString('pipeline.nodesLabel'),
        to: routes.toClusterNodepoolDetailsPage({ accountId, id, cloudId })
      }
    ],
    [accountId]
  )

  const handleRefresh = async () => {
    setRefreshLoading(true)
    await fetchClusterDetails()
    setRefreshLoading(false)
  }

  const clusterId = get(data, 'response.id', '')
  const isEnabled = get(data, 'opt_enabled') === true

  if (loading && !(data as any)?.response) {
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
            <Container>
              <Layout.Horizontal spacing={'huge'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text font={{ variation: FontVariation.H4 }}>{defaultTo(get(data, 'response.name'), '')}</Text>
                {isEnabled && (
                  <Container className={css.enableCell}>
                    <Text
                      font={{ variation: FontVariation.LEAD }}
                      icon="command-artifact-check"
                      iconProps={{ color: Color.GREEN_700, size: 12 }}
                    >
                      {getString('enabledLabel')}
                    </Text>
                  </Container>
                )}
              </Layout.Horizontal>
              {clusterId && (
                <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text>{`ID: ${clusterId}`}</Text>
                  <Container className={css.copyBtnSmall}>
                    <CopyButton textToCopy={clusterId} />
                  </Container>
                </Layout.Horizontal>
              )}
            </Container>
          </Layout.Horizontal>
        }
        toolbar={<TabNavigation size="small" links={navigationLinks} />}
      />
      <Page.Body>
        {isOverviewTab &&
          (refreshLoading ? (
            <Layout.Vertical padding={'large'} flex>
              <Icon name="spinner" size={25} />
            </Layout.Vertical>
          ) : (
            <Container>
              <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} padding={'large'}>
                <Text
                  icon="refresh"
                  iconProps={{ size: 12, color: Color.PRIMARY_7 }}
                  color={Color.PRIMARY_7}
                  style={{ cursor: 'pointer' }}
                  onClick={handleRefresh}
                >
                  {getString('common.refresh')}
                </Text>
              </Layout.Horizontal>
              <CGClusterDetailsBody
                data={get(data, 'response', '')}
                connectorDetails={get(connectorData, 'data.connector')}
              />
            </Container>
          ))}
        {isWorkloadsTab && <WorkloadDetails />}
        {isNodepoolTab && <NodepoolDetails />}
      </Page.Body>
    </Container>
  )
}

export default CGClusterDetailsPage
