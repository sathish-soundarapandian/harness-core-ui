/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { Layout, PageHeader, Button, ButtonVariation } from '@harness/uicore'
import { ManageSubscriptionBtn, WarningInfo } from './featureWarningUtil'
import type { FeatureInfoBannerProps } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const FeatureWarningSubscriptionInfoBanner = ({ featureName, message }: FeatureInfoBannerProps): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <WarningInfo message={message} />
      <ManageSubscriptionBtn featureName={featureName} />
    </Layout.Horizontal>
  )

  if (!display) {
    return <></>
  }

  return (
    <PageHeader
      className={css.bgColorWhite}
      title={warningMessage}
      toolbar={
        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setDisplay(false)
          }}
        />
      }
      size="small"
    />
  )
}

export default FeatureWarningSubscriptionInfoBanner
