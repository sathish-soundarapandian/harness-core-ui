/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import css from './TrialModalTemplate.module.scss'

interface TrialModalTemplateProps {
  imgSrc: string
  hideTrialBadge?: boolean
  children: React.ReactElement
}

export function TrialModalTemplate({ imgSrc, hideTrialBadge, children }: TrialModalTemplateProps): React.ReactElement {
  const { getString } = useStrings()
  const { modal } = useQueryParams<{ modal?: ModuleLicenseType }>()
  const showTrialBadge = !hideTrialBadge && modal === ModuleLicenseType.TRIAL

  return (
    <Layout.Vertical padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge' }}>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container
          className={css.left}
          width="50%"
          style={{
            background: `transparent url(${imgSrc}) no-repeat`
          }}
        >
          {showTrialBadge && (
            <Text
              className={css.tag}
              width={120}
              padding={'xsmall'}
              border={{ radius: 3 }}
              color={Color.WHITE}
              background={Color.ORANGE_500}
              font={{ align: 'center' }}
            >
              {getString('common.trialInProgress')}
            </Text>
          )}
        </Container>
        <Container padding={{ left: 'xxxlarge' }} width={'50%'} className={css.setupForm}>
          {children}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
