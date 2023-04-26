import React, { useState } from 'react'
import { Text, Button, ButtonSize, ButtonVariation } from '@harness/uicore'
import { Callout } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './BannerEOL.module.scss'

interface BannerEOLProps {
  isVisible: boolean
  link?: string
  email?: string
}

const DEFAULT_LINK = 'https://developer.harness.io/docs/continuous-delivery/get-started/upgrading/upgrade-cd-v2'
const DEFAULT_EMAIL = 'support@harness.io'

export function BannerEOL({
  isVisible = false,
  link = DEFAULT_LINK,
  email = DEFAULT_EMAIL
}: BannerEOLProps): React.ReactElement {
  const { getString } = useStrings()
  const [showBanner, setShowBanner] = useState<boolean>(false)

  React.useEffect(() => {
    if (isVisible) {
      setShowBanner(true)
    }
  }, [isVisible])

  return (
    <>
      {showBanner && (
        <Callout className={css.callout} intent="success" icon={null}>
          <Text color={Color.BLACK}>
            {getString('pipeline.banner.bannerText')}
            <a href={link} target="_blank" rel="noreferrer">
              &nbsp;{getString('pipeline.banner.docs')}
              &nbsp;
            </a>
            {getString('pipeline.banner.bannerDescription')}
            &nbsp;<a href={`mailto:${email}`}>{email}</a>&nbsp;
            {getString('pipeline.banner.bannerDescriptionSecond')}
          </Text>
          <Button
            aria-label={getString('close')}
            variation={ButtonVariation.ICON}
            size={ButtonSize.LARGE}
            icon="cross"
            onClick={() => setShowBanner(false)}
          />
        </Callout>
      )}
    </>
  )
}
