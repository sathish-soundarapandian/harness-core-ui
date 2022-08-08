import React, { useState, useEffect } from 'react'
import { Callout } from '@blueprintjs/core'
import { Button, ButtonVariation, Text, ButtonSize, Color } from '@wings-software/uicore'
import css from './MaintanenceBanner.module.scss'

interface BannerResponse {
  show: boolean
  message: string
}

const url = `https://static.harness.io/ng-static/banner.json?timestamp=${Date.now()}`

const MaintanenceBanner: React.FC = () => {
  // const { data } = useGet<BannerResponse>('https://static.harness.io/ng-static/bannerDetails-v1.json')
  const [showBanner, setShowBanner] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then((res: BannerResponse) => {
        setMessage(res.message)
        setShowBanner(res.show)
      })
  }, [])

  if (!showBanner) {
    return null
  }

  return (
    <Callout className={css.callout} intent="success" icon={null}>
      <Text color={Color.BLACK}>{message}</Text>
      <Button
        className={css.cross}
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        onClick={() => setShowBanner(false)}
      />
    </Callout>
  )
}

export default MaintanenceBanner
