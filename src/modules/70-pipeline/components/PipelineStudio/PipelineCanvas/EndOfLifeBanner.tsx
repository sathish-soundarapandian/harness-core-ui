/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Callout } from '@blueprintjs/core'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { String } from 'framework/strings'
import css from './PipelineCanvas.module.scss'

export interface EndOfLifeBannerProps {
  isSvcOrEnv?: boolean
}

export default function EndOfLifeBanner({ isSvcOrEnv }: EndOfLifeBannerProps): React.ReactElement {
  const [hover, setHover] = React.useState(false)
  const { preference: showV2SvcEnvBanner = true, setPreference: setShowBannerSession } = usePreferenceStore<
    boolean | undefined
  >(PreferenceScope.PROJECT, 'showV2SvcEnvBanner')

  const onHover = () => {
    setHover(true)
  }
  const onLeave = () => {
    setHover(false)
  }
  const closeButton = (
    <Button
      variation={ButtonVariation.ICON}
      size={ButtonSize.SMALL}
      icon="cross"
      onClick={() => {
        setShowBannerSession(false)
      }}
    />
  )
  const truncatedTextBanner = (
    <Text color={Color.BLACK}>
      <String stringID="common.svcEnvV2Truncated"></String>
    </Text>
  )
  const fullTextBanner = (
    <Text color={Color.BLACK}>
      <String
        stringID="common.svcEnv2Banner"
        vars={{
          support: 'https://support.harness.io/hc/en-us'
        }}
        useRichText
      />
    </Text>
  )
  return (
    <>
      {showV2SvcEnvBanner &&
        (!isSvcOrEnv ? (
          <Callout className={css.callout} intent="success" icon={null} onMouseEnter={onHover} onMouseLeave={onLeave}>
            {hover ? fullTextBanner : truncatedTextBanner}
            {closeButton}
          </Callout>
        ) : (
          <Callout className={css.callout} intent="success" icon={null}>
            {fullTextBanner}
            {closeButton}
          </Callout>
        ))}
    </>
  )
}
