/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'

export interface OnboardingSelectedFlagProps {
  flagCreated?: boolean
  selectedFlag: Feature
}

export const OnboardingSelectedFlag: React.FC<OnboardingSelectedFlagProps> = ({ flagCreated, selectedFlag }) => {
  const { getString } = useStrings()

  return (
    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} tag="div">
      <Layout.Horizontal
        data-testid="ffOnboardingSelectedFlag"
        flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
        spacing="xsmall"
        padding={{ top: 'small', bottom: 'small' }}
      >
        <span>{getString(flagCreated ? 'cf.onboarding.youCreated' : 'cf.onboarding.youreUsing')}</span>
        <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_6} tag="div">
          {selectedFlag.name}
        </Text>
        <span>{getString('common.with')}</span>
        <IdentifierText identifier={selectedFlag.identifier} allowCopy lineClamp={1} />
      </Layout.Horizontal>
    </Text>
  )
}
