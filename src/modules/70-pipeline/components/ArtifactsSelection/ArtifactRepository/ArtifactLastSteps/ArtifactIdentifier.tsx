/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../ArtifactConnector.module.scss'

function SideCarArtifactIdentifier(): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={css.dockerSideCard}>
      <FormInput.Text
        label={getString('pipeline.artifactsSelection.existingDocker.sidecarId')}
        placeholder={getString('pipeline.artifactsSelection.existingDocker.sidecarIdPlaceholder')}
        name="identifier"
      />
    </div>
  )
}

function ArtifactSourceIdentifier(): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={css.dockerSideCard}>
      <FormInput.Text
        label={getString('pipeline.artifactsSelection.artifactSourceName')}
        placeholder={getString('pipeline.artifactsSelection.existingDocker.sidecarIdPlaceholder')}
        name="identifier"
      />
    </div>
  )
}

export { ArtifactSourceIdentifier, SideCarArtifactIdentifier }
