/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { Layout, PageHeader, Text, Button, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ExploreSaasPlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const WarningInfo = (): ReactElement => {
  const { getString } = useStrings()
  return (
    <Text
      icon="stars"
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.SMALL }}
      iconProps={{ color: Color.PRIMARY_7, padding: { right: 'small' }, size: 25 }}
    >
      {getString('common.onPremSaaSPlansMsg')}
    </Text>
  )
}

export const OnPremFeatureWarningInfoBanner = (): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <WarningInfo />
      <ExploreSaasPlansBtn />
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

export default OnPremFeatureWarningInfoBanner
