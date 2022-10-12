/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, FlexExpander, Layout, MultiStepProgressIndicator } from '@harness/uicore'
import { Intent, Color } from '@harness/design-system'
import { StepStatus } from '@common/constants/StepStatusTypes'
import type { ApiKey, Feature } from 'services/cf'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { CreateAFlagView } from './views/CreateAFlagView'
import { SetUpYourApplicationView } from './views/SetUpYourApplicationView'
import { ValidateYourFlagView } from './views/ValidatingYourFlagView'
import css from './OnboardingDetailPage.module.scss'

enum TabId {
  CREATE_A_FLAG = 'created-a-flag',
  SET_UP_APP = 'set-up-your-app',
  TEST_YOUR_FLAG = 'test-your-flag'
}

enum STEP {
  NEXT = 'next',
  BACK = 'back'
}

enum STATUS {
  CREATE_A_FLAG,
  SELECT_ENV_SDK,
  VALIDATE_FLAG
}

export const OnboardingDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const [selectedTabId, setSelectedTabId] = React.useState<string>(TabId.CREATE_A_FLAG)
  const [language, setLanguage] = useState<PlatformEntry>()
  const [apiKey, setApiKey] = useState<ApiKey>()
  const [environmentIdentifier, setEnvironmentIdentifier] = useState<string | undefined>()
  const [testDone, setTestDone] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<Feature | undefined>()
  const [progressStep, setProgressStep] = useState('')
  const [createFlagError, setCreateFlagError] = useState(false)

  const history = useHistory()

  const switchTab = (tabId: string): void => setSelectedTabId(tabId)

  const onNext = (): void => {
    switch (selectedTabId) {
      case TabId.CREATE_A_FLAG:
        switchTab(TabId.SET_UP_APP)
        return
      case TabId.SET_UP_APP:
        setSelectedTabId(TabId.TEST_YOUR_FLAG)
        return
      case TabId.TEST_YOUR_FLAG:
        history.push(routes.toCFOnboarding({ accountId: accountIdentifier, orgIdentifier, projectIdentifier }))
        return
    }
  }

  const onPrevious = (): void => {
    switch (selectedTabId) {
      case TabId.CREATE_A_FLAG:
        history.push(routes.toCFOnboarding({ accountId: accountIdentifier, orgIdentifier, projectIdentifier }))
        return
      case TabId.SET_UP_APP:
        setSelectedTabId(TabId.CREATE_A_FLAG)
        return
      case TabId.TEST_YOUR_FLAG:
        setSelectedTabId(TabId.SET_UP_APP)
        return
    }
    setProgressStep(STEP.BACK)
  }

  const firstStepStatus = useMemo<StepStatus>(() => {
    if (createFlagError || (selectedTabId === TabId.CREATE_A_FLAG && progressStep === STEP.BACK)) {
      return StepStatus.INPROGRESS
    } else if ((selectedTabId === TabId.SET_UP_APP && progressStep === STEP.BACK) || progressStep === STEP.NEXT) {
      return StepStatus.SUCCESS
    }
    return StepStatus.INPROGRESS
  }, [createFlagError, progressStep, selectedTabId])

  const secondStepStatus = useMemo<StepStatus>(() => {
    if (createFlagError) {
      return StepStatus.FAILED
    } else if (selectedTabId === TabId.TEST_YOUR_FLAG && progressStep === STEP.NEXT) {
      return StepStatus.SUCCESS
    } else if (progressStep === STEP.NEXT || (selectedTabId === TabId.SET_UP_APP && progressStep === STEP.BACK)) {
      return StepStatus.INPROGRESS
    }
    return StepStatus.TODO
  }, [createFlagError, progressStep, selectedTabId])

  const thirdStepStatus = useMemo<StepStatus>(() => {
    if (selectedTabId === TabId.TEST_YOUR_FLAG && language && apiKey) {
      return StepStatus.INPROGRESS
    }
    return StepStatus.TODO
  }, [selectedTabId, language, apiKey])

  const state = useMemo<STATUS>(() => {
    if (selectedTabId === TabId.SET_UP_APP && selectedFlag) {
      return STATUS.SELECT_ENV_SDK
    } else if (selectedTabId === TabId.TEST_YOUR_FLAG && language && apiKey && selectedFlag) {
      return STATUS.VALIDATE_FLAG
    }

    return STATUS.CREATE_A_FLAG
  }, [apiKey, language, selectedFlag, selectedTabId])

  const disableNext =
    !selectedFlag?.identifier || (!!selectedFlag?.identifier && selectedTabId === TabId.SET_UP_APP && !apiKey)

  const { trackEvent } = useTelemetry()

  return (
    <Container height="100%" background={Color.WHITE} className={css.container}>
      <Layout.Horizontal
        padding={{ top: 'xxlarge', left: 'large' }}
        spacing="xsmall"
        flex
        height={80}
        data-testid="getStartedProgressStepper"
      >
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
      <Container height="calc(100% - 102px)">
        {state === STATUS.CREATE_A_FLAG && (
          <CreateAFlagView
            selectedFlag={selectedFlag}
            setSelectedFlag={setSelectedFlag}
            setCreateFlagError={setCreateFlagError}
          />
        )}

        {state === STATUS.SELECT_ENV_SDK && (
          <SetUpYourApplicationView
            flagInfo={selectedFlag as Feature}
            language={language}
            setLanguage={setLanguage}
            apiKey={apiKey as ApiKey}
            setApiKey={setApiKey}
            setEnvironmentIdentifier={_environmentIdentifier => {
              setEnvironmentIdentifier(_environmentIdentifier)
            }}
          />
        )}

        {state === STATUS.VALIDATE_FLAG && (
          <ValidateYourFlagView
            flagInfo={selectedFlag as Feature}
            language={language as PlatformEntry}
            apiKey={apiKey as ApiKey}
            testDone={testDone}
            setTestDone={setTestDone}
            environmentIdentifier={environmentIdentifier}
          />
        )}
      </Container>
      <Layout.Horizontal
        spacing="small"
        height={60}
        style={{
          boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
          alignItems: 'center',
          paddingLeft: 'var(--spacing-xlarge)',
          position: 'fixed',
          left: '288px',
          bottom: 0,
          background: 'var(--white)',
          right: 0
        }}
      >
        <Button
          text={getString('back')}
          icon="chevron-left"
          onClick={() => {
            trackEvent(FeatureActions.GetStartedPrevious, {
              category: Category.FEATUREFLAG
            })
            onPrevious()
            setProgressStep(STEP.BACK)
          }}
        />
        <Button
          text={getString(selectedTabId !== TabId.TEST_YOUR_FLAG ? 'next' : 'cf.onboarding.backToStart')}
          rightIcon={selectedTabId === TabId.TEST_YOUR_FLAG ? undefined : 'chevron-right'}
          intent={Intent.PRIMARY}
          variation={ButtonVariation.PRIMARY}
          disabled={disableNext}
          onClick={() => {
            if (selectedTabId === TabId.SET_UP_APP) {
              trackEvent(FeatureActions.SetUpYourApplicationVerify, {
                category: Category.FEATUREFLAG
              })
            } else if (selectedTabId === TabId.TEST_YOUR_FLAG) {
              trackEvent(FeatureActions.TestYourFlagBack, {
                category: Category.FEATUREFLAG
              })
            } else {
              trackEvent(FeatureActions.GetStartedNext, {
                category: Category.FEATUREFLAG
              })
            }
            onNext()
            setProgressStep(STEP.NEXT)
          }}
        />
        <FlexExpander />
      </Layout.Horizontal>
    </Container>
  )
}
