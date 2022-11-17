/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, RUNTIME_INPUT_VALUE, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ArtifactSource, PageConnectorResponse, PrimaryArtifact } from 'services/cd-ng'
import type { ModalViewFor } from '../../ArtifactHelper'
import type { ArtifactType } from '../../ArtifactInterface'
import PrimaryArtifactView from '../PrimaryArtifact/PrimaryArtifactView'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactSourcesProps {
  artifactSources: ArtifactSource[]
  isReadonly: boolean
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: (view: ModalViewFor, type?: ArtifactType, index?: number) => void
  removeArtifactSource?: (index: number) => void
}
function PrimaryArtifactSources(props: PrimaryArtifactSourcesProps): React.ReactElement | null {
  const { artifactSources, editArtifact, removeArtifactSource, ...rest } = props
  const { getString } = useStrings()

  const renderIdentifier = (identifier: string): JSX.Element => {
    return (
      <div>
        <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
          {identifier}
        </Text>
      </div>
    )
  }
  if (!artifactSources?.length) {
    return null
  }
  return (
    <>
      <div className={css.sidecarList}>
        <Layout.Horizontal spacing="medium">
          <Text margin={{ bottom: 'xlarge' }} color={Color.GREY_800} font={{ weight: 'semi-bold', size: 'normal' }}>
            {getString('primary')}
          </Text>
          <Text
            margin={{ bottom: 'xlarge' }}
            color={Color.GREY_500}
            font={{ weight: 'semi-bold', size: 'normal' }}
            className={css.primaryArtifactRef}
          >
            {RUNTIME_INPUT_VALUE}
          </Text>
        </Layout.Horizontal>

        <div className={cx(css.artifactList, css.listHeader)}>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('pipeline.artifactsSelection.artifactType')}
          </Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
          <span></span>
        </div>
      </div>

      {artifactSources?.map((artifactSource, index) => (
        <PrimaryArtifactView
          key={artifactSource.identifier}
          primaryArtifact={artifactSource as PrimaryArtifact}
          editArtifact={(view, type) => editArtifact(view, type, index)}
          removePrimary={() => removeArtifactSource?.(index)}
          identifierElement={renderIdentifier(artifactSource.identifier)}
          {...rest}
        />
      ))}
    </>
  )
}

export default PrimaryArtifactSources
