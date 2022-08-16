/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Heading, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Intent, Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import theBasicsImage from './basics.svg'
import upAndRunningImage from './upAndRunning.svg'
import css from './OnboardingPage.module.scss'

export const OnboardingPage = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()

  return (
    <Container className={css.mainHeading} background={Color.WHITE}>
      <Heading className={css.onboardingTitle}>
        {getString('cf.onboarding.title')}
        <Text className={css.onboardingSubTitle}>{getString('cf.onboarding.subTitle')}</Text>
      </Heading>
      <Container margin={{ top: 'xxxlarge' }}>
        <Container className={css.basicImageContainer}>
          <img src={theBasicsImage} width={1154} height={425} title={getString('featureFlagsText')} />
        </Container>
      </Container>

      <Container margin={{ top: 'xxxlarge' }}>
        <Heading level={2} className={css.h2}>
          {getString('cf.onboarding.upAndRunning')}
        </Heading>
        <Container className={css.stepImageContainer}>
          <img
            src={upAndRunningImage}
            className={css.stepsImage}
            width={1162}
            height={125}
            title={getString('featureFlagsText')}
          />
        </Container>
      </Container>

      <Container className={css.buttonConatiner}>
        <Button
          intent={Intent.PRIMARY}
          variation={ButtonVariation.PRIMARY}
          text={getString('cf.onboarding.tryItOut')}
          large
          className={css.getStartedButton}
          width={350}
          onClick={() => {
            trackEvent(FeatureActions.GetStartedClick, {
              category: Category.FEATUREFLAG
            })
            history.push(routes.toCFOnboardingDetail({ accountId, orgIdentifier, projectIdentifier }))
          }}
        />
      </Container>
    </Container>
  )
}
