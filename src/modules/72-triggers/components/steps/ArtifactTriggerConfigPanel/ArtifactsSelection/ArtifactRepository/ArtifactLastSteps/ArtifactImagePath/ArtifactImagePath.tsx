/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, MultiTypeInputType } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import css from '../../ArtifactConnector.module.scss'

function ArtifactImagePath(): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={css.imagePathContainer}>
      <FormInput.MultiTextInput
        label={getString('pipeline.imagePathLabel')}
        name="imagePath"
        placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
        multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
      />
    </div>
  )
}

export default ArtifactImagePath
