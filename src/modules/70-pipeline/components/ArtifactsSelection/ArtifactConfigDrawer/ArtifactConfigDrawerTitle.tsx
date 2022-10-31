/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Text, ButtonVariation, ButtonSize } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './ArtifactConfigDrawer.module.scss'

export function ArtifactConfigDrawerTitle(props: {
  readonly: boolean
  discardChanges: () => void
  applyChanges: () => void
}): JSX.Element {
  const { readonly } = props
  const { getString } = useStrings()
  return (
    <div className={css.drawerTitleContainer}>
      <div className={css.drawertitle}>
        <Text lineClamp={1} color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
          {getString('pipeline.configureArtifactSource')}
        </Text>
      </div>
      <div>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          className={css.applyChanges}
          disabled={readonly}
          text={getString('applyChanges')}
          onClick={props.applyChanges}
        />
        <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={props.discardChanges} />
      </div>
    </div>
  )
}
