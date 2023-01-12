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
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { String } from 'framework/strings'
import css from './PipelineCanvas.module.scss'

export default function EndOfLifeBanner(): React.ReactElement {
  const [hover, setHover] = React.useState(false)
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()
  const { preference: showBannerSession = true, setPreference: setShowBannerSession } = usePreferenceStore<
    boolean | undefined
  >(PreferenceScope.PROJECT, 'showBannerSession')

  const onHover = () => {
    setHover(true)
  }
  const onLeave = () => {
    setHover(false)
  }

  return (
    <>
      {!NG_SVC_ENV_REDESIGN && showBannerSession ? (
        <Callout className={css.callout} intent="success" icon={null} onMouseEnter={onHover} onMouseLeave={onLeave}>
          {hover ? (
            <Text color={Color.BLACK}>
              <String
                stringID="common.svcEnv2Banner"
                vars={{
                  support: 'https://support.harness.io/hc/en-us'
                }}
                useRichText
              />
            </Text>
          ) : (
            <Text color={Color.BLACK}>
              <String stringID="common.svcEnvV2Truncated"></String>
            </Text>
          )}
          <Button
            variation={ButtonVariation.ICON}
            size={ButtonSize.SMALL}
            icon="cross"
            onClick={() => {
              setShowBannerSession(false)
            }}
          />
        </Callout>
      ) : null}
    </>
  )
}
