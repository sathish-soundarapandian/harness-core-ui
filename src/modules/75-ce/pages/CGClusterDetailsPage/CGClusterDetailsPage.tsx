/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Container, FontVariation, Icon, Layout, PageHeader, Text } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CopyButton from '@ce/common/CopyButton'

const CGClusterDetailsPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
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
  return (
    <Container>
      <PageHeader
        size="xlarge"
        breadcrumbs={<NGBreadcrumbs links={breadcrumbLinks} />}
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name={'app-kubernetes'} size={30} />
            <Container>
              <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text font={{ variation: FontVariation.H4 }}>{defaultTo('MyK8sCluster', '')}</Text>
                <Container>Enabled</Container>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="small">
                <Text>ndy92hiufhwiibdwyi932b8</Text>
                <CopyButton textToCopy={'ndy92hiufhwiibdwyi932b8'} />
              </Layout.Horizontal>
            </Container>
          </Layout.Horizontal>
        }
      />
    </Container>
  )
}

export default CGClusterDetailsPage
