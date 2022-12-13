/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Color, FontVariation, Intent } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import ffOnboarding from '@cf/images/ff_onboarding.svg'
import productsFreeForever from '@cf/images/products_free_forever.svg'
import { OnboardingStepsDescription } from './OnboardingStepsDescription'
import css from './OnboardingPage.module.scss'

export const OnboardingPage = (): React.ReactElement => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()

  return (
    <>
      {/* Products free banner */}
      <Layout.Horizontal flex={{ justifyContent: 'center' }} width="100%" margin={{ bottom: 'huge' }}>
        <img src={productsFreeForever} alt={getString('cf.onboarding.freeBanner')} />
      </Layout.Horizontal>

      {/* Overall Layout */}
      <Container padding="huge" flex={{ justifyContent: 'center' }} height="650px">
        <Container flex={{ justifyContent: 'center' }} className={css.mainContentContainer} padding="huge">
          {/* Left Side */}
          <Container className={css.leftSide}>
            <Layout.Horizontal spacing="small" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon name="cf-main" height={30} size={30} />
              <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_800}>
                {getString('common.purpose.cf.continuous')}
              </Text>
            </Layout.Horizontal>
            <Layout.Vertical
              flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
              padding={{ top: 'xxxlarge' }}
            >
              <Text font={{ variation: FontVariation.H2 }} tag="h2" margin={{ bottom: 'medium' }}>
                {getString('cf.onboarding.title')}
              </Text>
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} margin={{ bottom: 'huge' }}>
                {getString('cf.onboarding.subTitle')}
              </Text>
              <OnboardingStepsDescription />
              <Button
                intent={Intent.PRIMARY}
                variation={ButtonVariation.PRIMARY}
                text={getString('cf.onboarding.tryItOut')}
                size={ButtonSize.LARGE}
                onClick={() => {
                  trackEvent(FeatureActions.GetStartedClick, {
                    category: Category.FEATUREFLAG
                  })
                  history.push(routes.toCFOnboardingDetail({ accountId, orgIdentifier, projectIdentifier }))
                }}
              />
            </Layout.Vertical>
          </Container>

          {/* Right side - img */}
          <img className={css.onboardingImg} src={ffOnboarding} width={380} height={320} alt="" />
        </Container>
      </Container>
    </>
  )
}
