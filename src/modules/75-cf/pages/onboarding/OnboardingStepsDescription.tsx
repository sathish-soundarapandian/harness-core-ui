/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import codeIcon from '@cf/images/icons/closing_tag.svg'
import createFlagIcon from '@cf/images/icons/create_flag.svg'
import envIcon from '@cf/images/icons/environment.svg'

export const OnboardingStepsDescription = (): React.ReactElement => {
  const { getString } = useStrings()
  const steps = [
    { label: getString('cf.onboarding.createAFlag'), imgSrc: createFlagIcon },
    { label: getString('cf.onboarding.createEnvAndSdk'), imgSrc: envIcon },
    { label: getString('cf.onboarding.setupCode'), imgSrc: codeIcon }
  ]

  return (
    <Layout.Horizontal>
      {steps.map((step, i) => (
        <Layout.Horizontal key={`item-${i}`} flex={{ alignItems: 'center' }} spacing="small">
          <Container
            flex={{ justifyContent: 'center' }}
            width={30}
            height={30}
            padding="small"
            background={Color.YELLOW_200}
            border={{ radius: 4, color: Color.YELLOW_200 }}
          >
            <img src={step.imgSrc} />
          </Container>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
            {step.label}
          </Text>
          {i !== steps.length - 1 && <Icon name="arrow-right" color={Color.GREY_600} size={13} padding="small" />}
        </Layout.Horizontal>
      ))}
    </Layout.Horizontal>
  )
}
