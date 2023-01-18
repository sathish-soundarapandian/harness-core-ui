/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  Heading,
  Text,
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
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
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
  const [verified, setVerified] = useState(false)
  const [testDone, setTestDone] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<Feature | undefined>()

  const totalSteps = Object.keys(STEP).length / 2

  const { preference: onboardingBackLocation, clearPreference: clearOnboardingBackLocation } =
    usePreferenceStore<string>(PreferenceScope.USER, 'FF_ONBOARDING_LOCATION')

  const onNext = (): void => {
    if (currentStep !== totalSteps) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
    } else {
      clearOnboardingBackLocation()
      history.push(routes.toCFFeatureFlags({ accountId: accountIdentifier, orgIdentifier, projectIdentifier }))
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

  const disableNext =
    !selectedFlag?.identifier ||
    (selectedStep === STEP.SELECT_ENV_SDK && !apiKey) ||
    (selectedStep === STEP.VALIDATE_FLAG && !verified)

  const { trackEvent } = useTelemetry()

  const handleClose = useCallback(() => {
    if (onboardingBackLocation) {
      clearOnboardingBackLocation()

      history.push(JSON.parse(onboardingBackLocation))
    } else {
      history.push({
        pathname: routes.toCFConfigurePath({
          orgIdentifier,
          projectIdentifier,
          accountId: accountIdentifier
        })
      })
    }
  }, [
    accountIdentifier,
    clearOnboardingBackLocation,
    history,
    onboardingBackLocation,
    orgIdentifier,
    projectIdentifier
  ])

  return (
    <>
      <Layout.Horizontal
        flex={{ justifyContent: 'space-between' }}
        height="0"
        width="100%"
        padding={{ top: 'huge', left: 'xxlarge', right: 'xxxlarge' }}
      >
        <Layout.Horizontal
          spacing="small"
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          padding={{ top: 'xxlarge' }}
        >
          <Text
            font={{ variation: FontVariation.SMALL_BOLD }}
            color={Color.GREY_800}
            icon="cf-main"
            iconProps={{ size: 30 }}
          >
            {getString('common.purpose.cf.continuous')}
          </Text>
        </Layout.Horizontal>
        <Button
          icon="code-close"
          aria-label={getString('common.createFlag')}
          variation={ButtonVariation.ICON}
          data-testid="close"
          withoutBoxShadow
          onClick={handleClose}
        />
      </Layout.Horizontal>
      <Layout.Horizontal className={css.fullScreenContainer} padding={{ left: 'huge' }}>
        <Layout.Vertical
          padding={{ top: 'large', right: 'huge', left: 'huge' }}
          background={Color.WHITE}
          className={css.mainContent}
        >
          <Layout.Horizontal
            spacing="xsmall"
            data-testid="getStartedProgressStepper"
            height="10px"
            width="100%"
            color={Color.GREY_0}
            padding={{ bottom: 'xlarge' }}
          >
            <MultiStepProgressIndicator
              barWidth={200}
              textClassName={css.multiStepWizardText}
              progressMap={
                new Map([
                  [0, { StepStatus: firstStepStatus, StepName: getString('common.createFlag') }],
                  [1, { StepStatus: secondStepStatus, StepName: getString('cf.onboarding.multiStep.createEnv') }],
                  [2, { StepStatus: thirdStepStatus, StepName: getString('cf.onboarding.multiStep.validate') }]
                ])
              }
            />
          </Layout.Horizontal>
          <Container className={css.onboardingContainer} height="100%" padding={{ top: 'xxlarge', bottom: 'xlarge' }}>
            {selectedStep !== STEP.VALIDATE_FLAG ? (
              <>
                <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large' }}>
                  {getString('cf.onboarding.letsGetStarted')}
                </Heading>
                <Heading level={4} font={{ variation: FontVariation.H4 }} margin={{ bottom: 'medium' }}>
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
                verified={verified}
                setVerified={setVerified}
              />
            )}
          </Container>
          <Divider className={css.divider} />
          <Layout.Horizontal
            width="100%"
            spacing="small"
            padding={{ top: 'medium', bottom: 'xlarge' }}
            flex={{ alignItems: 'flex-start' }}
          >
            <Button
              text={getString(selectedStep !== STEP.CREATE_A_FLAG ? 'back' : 'cancel')}
              icon={selectedStep !== STEP.CREATE_A_FLAG ? 'chevron-left' : undefined}
              onClick={() => {
                if (selectedStep !== STEP.CREATE_A_FLAG) {
                  trackEvent(FeatureActions.GetStartedPrevious, {
                    category: Category.FEATUREFLAG
                  })
                  onPrevious()
                } else {
                  handleClose()
                }
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
      </Layout.Horizontal>
    </>
  )
}
