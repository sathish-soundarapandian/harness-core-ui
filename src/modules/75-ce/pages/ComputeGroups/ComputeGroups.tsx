/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, FontVariation, PageHeader, PageSpinner, Text } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import ComputeGroupsBody from '@ce/components/ComputeGroupsBody/ComputeGroupsBody'

const ComputeGroups: React.FC = () => {
  const { getString } = useStrings()
  const [loading] = useState(false)
  if (loading) {
    return <PageSpinner />
  }
  return (
    <Container>
      <PageHeader
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Container>
            <Text font={{ variation: FontVariation.H4 }}>{getString('ce.computeGroups.sideNavText')}</Text>
          </Container>
        }
      />
      <ComputeGroupsBody />
    </Container>
  )
}

export default ComputeGroups
