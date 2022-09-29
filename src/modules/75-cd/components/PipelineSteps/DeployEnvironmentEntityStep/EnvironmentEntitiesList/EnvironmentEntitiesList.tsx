/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { EnvironmentData, EnvironmentEntityCard } from './EnvironmentEntityCard'

export default function EnvironmentEntitiesList({
  data,
  onEditClick,
  onDeleteClick
}: {
  data?: (EnvironmentResponseDTO | undefined)[]
  onEditClick: any
  onDeleteClick: any
}): React.ReactElement {
  return (
    <Container>
      {data?.map(row => (
        <EnvironmentEntityCard
          key={row?.identifier}
          environment={row as EnvironmentData['environment']}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </Container>
  )
}
