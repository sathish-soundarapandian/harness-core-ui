/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Color, Text } from '@harness/uicore'
import { Callout } from '@blueprintjs/core'
import css from './PipelineCanvas.module.scss'

export default function EndOfLifeBanner(): React.ReactElement {
  const [showBanner, setShowBanner] = React.useState(true)
  const [hover, setHover] = React.useState(false)
  const onHover = () => {
    setHover(true)
  }

  const onLeave = () => {
    setHover(false)
  }

  React.useEffect(() => {
    if (window.sessionStorage.getItem('showV2Banner') == null) {
      setShowBanner(true)
      window.sessionStorage.setItem('showV2Banner', 'true')
    }
    if (window.sessionStorage.getItem('showV2Banner') == 'false') setShowBanner(false)
  }, [])
  return (
    <>
      {console.log('session', window.sessionStorage.getItem('showV2Banner'))}
      {showBanner ? (
        <Callout className={css.callout} intent="success" icon={null} onMouseEnter={onHover} onMouseLeave={onLeave}>
          {hover ? (
            <Text color={Color.BLACK}>
              Harness has made a significant update to the services and environments in CD. Services and Environments
              now have definitions that are associated with the respective object and can be managed independent of the
              pipeline. This change is a forward looking change that won’t impact your existing pipelines. However, we
              do plan on reducing our support on the service v1 and environments v1 and plan to deprecate by end of
              January. We have an automated migration tool to support our users. Please contact
              <a href="https://support.harness.io/hc/en-us" target="_blank" rel="noreferrer">
                <b>&nbsp;support.harness.io&nbsp;</b>
              </a>
              for further questions.
            </Text>
          ) : (
            <Text color={Color.BLACK}>
              Harness has made a significant update to the services and environments in CD. Services and Environments
              now have definitions that are associated with the respective object and can be managed ...
            </Text>
          )}
          <Button
            variation={ButtonVariation.ICON}
            size={ButtonSize.SMALL}
            icon="cross"
            onClick={() => {
              window.sessionStorage.setItem('showV2Banner', 'false')
              setShowBanner(false)
            }}
          />
        </Callout>
      ) : null}
    </>
  )
}
