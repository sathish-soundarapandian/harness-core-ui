/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import React from 'react'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { EnvironmentData, EnvironmentEntityCard } from './EnvironmentEntityCard'
import css from './EnvironmentEntitiesList.module.scss'

export default function EnvironmentEntitiesList({
  data,
  onEditClick
}: {
  data?: (EnvironmentResponseDTO | undefined)[]
  onEditClick: any
}): React.ReactElement {
  return (
    <div className={css.cardsContainer}>
      {data?.map(row => (
        <EnvironmentEntityCard
          key={row?.identifier}
          environment={row as EnvironmentData['environment']}
          onDeleteClick={noop}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  )
}
