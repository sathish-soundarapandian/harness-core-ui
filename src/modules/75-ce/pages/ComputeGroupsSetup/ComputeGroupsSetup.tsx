/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, PageHeader } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import ComputeGroupsSetupBody from '@ce/components/ComputeGroupsSetupBody/ComputeGroupsSetupBody'

const ComputeGroupsSetup: React.FC = () => {
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
      <PageHeader size="small" breadcrumbs={<NGBreadcrumbs links={breadcrumbLinks} />} title={<></>} />
      <ComputeGroupsSetupBody />
    </Container>
  )
}

export default ComputeGroupsSetup
