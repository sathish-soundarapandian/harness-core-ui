/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import cx from 'classnames'
import { Layout, Text, Container, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useLocalStorage } from '@common/hooks'
import {
  DisplayBanner,
  CustomBannerProps,
  getBackgroundColor,
  getIconDetails,
  getHeadline,
  renderRedirectButton
} from './FeatureWarningCommonBannerUtils'

import css from './FeatureWarningCommonBanner.module.scss'

interface FeatureWarningCommonBannerProps {
  banner: DisplayBanner
  customBannerProps?: CustomBannerProps
}

const FeatureWarningCommonBanner = ({
  banner,
  customBannerProps = {}
}: FeatureWarningCommonBannerProps): ReactElement | null => {
  const { getString } = useStrings()
  const { className, iconProps, headline } = customBannerProps
  const { theme, redirectButtons = [] } = banner
  const headlineText = getHeadline({ theme, headline, getString })
  const { iconName, iconSize } = getIconDetails({ theme, iconProps })
  const [dismissedBanners, setDismissedBanners] = useLocalStorage<string[]>('dismiss_banners', [])
  if (dismissedBanners.includes(banner.bannerKey)) {
    return null
  }

  return (
    <Layout.Horizontal
      key={banner.messageString}
      className={cx(css.bannerContainer, getBackgroundColor({ theme, className }))}
      flex={{ alignItems: 'center', justifyContent: 'space-between' }}
      height={56}
      padding={{ left: 'large', top: 'medium', bottom: 'medium' }}
    >
      <Container flex>
        <Text
          icon={iconName}
          iconProps={{
            size: iconSize,
            margin: { right: 'xsmall' }
          }}
          font={{ weight: 'semi-bold', size: 'small' }}
          color={Color.PRIMARY_10}
          margin={{ right: 'medium' }}
        >
          {headlineText && <Text className={css.headline}>{headlineText}</Text>}
          {banner.messageString}
        </Text>
        <Container className={css.redirectButtons}>
          {redirectButtons.map(type => renderRedirectButton({ type, featureName: banner.featureName }))}
        </Container>
      </Container>
      <Button icon="cross" minimal onClick={() => setDismissedBanners([...dismissedBanners, banner.bannerKey])} />
    </Layout.Horizontal>
  )
}

export default FeatureWarningCommonBanner
