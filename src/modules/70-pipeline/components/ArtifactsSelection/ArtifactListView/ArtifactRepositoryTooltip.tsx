import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
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
