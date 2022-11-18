/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  Heading,
  Layout,
  MultiStepProgressIndicator
} from '@harness/uicore'
import { Intent, Color, FontVariation } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import { StepStatus } from '@common/constants/StepStatusTypes'
import type { ApiKey, Feature } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { CreateAFlagView } from './views/CreateAFlagView'
import { OnboardingSelectedFlag } from './OnboardingSelectedFlag'
import { SetUpYourApplicationView } from './views/SetUpYourApplicationView'
import { ValidateYourFlagView } from './views/ValidatingYourFlagView'
import css from './OnboardingDetailPage.module.scss'

enum STEP {
  CREATE_A_FLAG,
  SELECT_ENV_SDK,
  VALIDATE_FLAG
}

export const OnboardingDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const [currentStep, setCurrentStep] = React.useState<number>(1)
  const [language, setLanguage] = useState<PlatformEntry>()
  const [apiKey, setApiKey] = useState<ApiKey>()
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentResponseDTO | undefined>()
  const [testDone, setTestDone] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<Feature | undefined>()

  const totalSteps = Object.keys(STEP).length / 2

  const onNext = (): void => {
    if (currentStep !== totalSteps) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
    } else {
      history.push(routes.toCFOnboarding({ accountId: accountIdentifier, orgIdentifier, projectIdentifier }))
    }
  }

  const onPrevious = (): void => {
    if (currentStep !== 0) {
      const nextStep = currentStep - 1
      setCurrentStep(nextStep)
    } else {
      history.push(routes.toCFOnboarding({ accountId: accountIdentifier, orgIdentifier, projectIdentifier }))
    }
  }

  const firstStepStatus = useMemo<StepStatus>(() => {
    if (currentStep > 1) {
      return StepStatus.SUCCESS
    }
    return StepStatus.INPROGRESS
  }, [currentStep])

  const secondStepStatus = useMemo<StepStatus>(() => {
    if (currentStep === 2) {
      return StepStatus.INPROGRESS
    } else if (currentStep > 2) {
      return StepStatus.SUCCESS
    }
    return StepStatus.TODO
  }, [currentStep])

  const thirdStepStatus = useMemo<StepStatus>(() => {
    if (currentStep === 3) {
      return StepStatus.INPROGRESS
    }
    return StepStatus.TODO
  }, [currentStep])

  const selectedStep = useMemo<STEP>(() => {
    // use this to determine the order of the tabs
    switch (currentStep) {
      case 2:
        return STEP.SELECT_ENV_SDK
      case 3:
        return STEP.VALIDATE_FLAG
      default:
        // first step/tab
        return STEP.CREATE_A_FLAG
    }
  }, [currentStep])

  const disableNext = !selectedFlag?.identifier || (selectedStep === STEP.SELECT_ENV_SDK && !apiKey)

  const { trackEvent } = useTelemetry()

  return (
    <Layout.Vertical
      className={css.grid}
      height="100vh"
      padding={{ top: 'huge', left: 'huge', right: 'huge', bottom: 'none' }}
      style={{ overflowY: 'auto' }}
      background={Color.WHITE}
    >
      <Layout.Horizontal spacing="xsmall" flex data-testid="getStartedProgressStepper" height="10px">
        <MultiStepProgressIndicator
          progressMap={
            new Map([
              [0, { StepStatus: firstStepStatus }],
              [1, { StepStatus: secondStepStatus }],
              [2, { StepStatus: thirdStepStatus }]
            ])
          }
        />
      </Layout.Horizontal>
      <Container style={{ flexGrow: 1 }} padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
        {selectedStep !== STEP.VALIDATE_FLAG ? (
          <>
            <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large' }}>
              {getString('cf.onboarding.letsGetStarted')}
            </Heading>
            <Heading level={4} font={{ variation: FontVariation.H4 }} margin="none">
              {getString('cf.onboarding.createFlag')}
            </Heading>

            {selectedFlag && selectedStep === STEP.SELECT_ENV_SDK && (
              <Layout.Vertical spacing="medium">
                <OnboardingSelectedFlag selectedFlag={selectedFlag} />
                <Divider />
              </Layout.Vertical>
            )}
          </>
        ) : (
          <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large' }}>
            {getString('cf.onboarding.validatingYourFlag')}
          </Heading>
        )}

        {selectedStep === STEP.CREATE_A_FLAG && (
          <CreateAFlagView selectedFlag={selectedFlag} setSelectedFlag={setSelectedFlag} />
        )}

        {selectedStep === STEP.SELECT_ENV_SDK && selectedFlag && (
          <SetUpYourApplicationView
            flagInfo={selectedFlag}
            language={language}
            setLanguage={setLanguage}
            apiKey={apiKey}
            setApiKey={setApiKey}
            selectedEnvironment={selectedEnvironment}
            setSelectedEnvironment={setSelectedEnvironment}
          />
        )}

        {selectedStep === STEP.VALIDATE_FLAG && selectedFlag && selectedEnvironment && (
          <ValidateYourFlagView
            flagInfo={selectedFlag as Feature}
            language={language as PlatformEntry}
            apiKey={apiKey as ApiKey}
            testDone={testDone}
            setTestDone={setTestDone}
            environmentIdentifier={selectedEnvironment.identifier}
          />
        )}
      </Container>
      <Divider />
      <Layout.Horizontal spacing="small" padding="small">
        <Button
          text={getString('back')}
          icon="chevron-left"
          onClick={() => {
            trackEvent(FeatureActions.GetStartedPrevious, {
              category: Category.FEATUREFLAG
            })
            onPrevious()
          }}
        />
        <Button
          text={getString(selectedStep !== STEP.VALIDATE_FLAG ? 'next' : 'cf.onboarding.complete')}
          rightIcon={selectedStep !== STEP.VALIDATE_FLAG ? 'chevron-right' : undefined}
          intent={Intent.PRIMARY}
          variation={ButtonVariation.PRIMARY}
          disabled={disableNext}
          onClick={() => {
            if (selectedStep === STEP.SELECT_ENV_SDK) {
              trackEvent(FeatureActions.SetUpYourApplicationVerify, {
                category: Category.FEATUREFLAG
              })
            } else if (selectedStep === STEP.VALIDATE_FLAG) {
              trackEvent(FeatureActions.TestYourFlagBack, {
                category: Category.FEATUREFLAG
              })
            } else {
              trackEvent(FeatureActions.GetStartedNext, {
                category: Category.FEATUREFLAG
              })
            }
            onNext()
          }}
        />
        <FlexExpander />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
