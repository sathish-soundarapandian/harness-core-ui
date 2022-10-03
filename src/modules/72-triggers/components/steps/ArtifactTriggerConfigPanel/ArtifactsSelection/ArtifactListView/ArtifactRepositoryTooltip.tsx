/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, Text } from '@harness/uicore'
import { ENABLED_ARTIFACT_TYPES } from '../ArtifactHelper'
import type { ArtifactType } from '../ArtifactInterface'
import css from '../ArtifactsSelection.module.scss'

function ArtifactRepositoryTooltip({
  artifactType,
  artifactConnectorName,
  artifactConnectorRef
}: {
  artifactType: ArtifactType
  artifactConnectorName?: string
  artifactConnectorRef: string
}): React.ReactElement | null {
  if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
    return null
  }
  return (
    <Container className={css.borderRadius} padding="medium">
      <div>
        <Text font="small" color={Color.GREY_100}>
          {artifactConnectorName}
        </Text>
        <Text font="small" color={Color.GREY_300}>
          {artifactConnectorRef}
        </Text>
      </div>
    </Container>
  )
}

export default ArtifactRepositoryTooltip
