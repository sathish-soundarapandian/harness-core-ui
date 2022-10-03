/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import type { InfrastructureResponseDTO } from 'services/cd-ng'
import { InfrastructureData, InfrastructureEntityCard } from './InfrastructureEntityCard'

export default function InfrastructureEntitiesList({
  data,
  onEditClick,
  onDeleteClick
}: {
  data?: (InfrastructureResponseDTO | undefined)[]
  onEditClick: any
  onDeleteClick: any
}): React.ReactElement {
  return (
    <Container>
      {data?.map(row => (
        <InfrastructureEntityCard
          key={row?.identifier}
          infrastructure={row as InfrastructureData['infrastructure']}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </Container>
  )
}
