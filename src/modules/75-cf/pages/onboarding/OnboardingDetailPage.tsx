/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Button, Container, FlexExpander, Icon, Layout, Tab, Tabs, Text } from '@wings-software/uicore'
import { Intent, Color } from '@harness/design-system'
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

export const OnboardingDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const [selectedTabId, setSelectedTabId] = React.useState<string>(TabId.CREATE_A_FLAG)
  const [language, setLanguage] = useState<PlatformEntry>()
  const [apiKey, setApiKey] = useState<ApiKey>()
  const [environmentIdentifier, setEnvironmentIdentifier] = useState<string | undefined>()
  const [testDone, setTestDone] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<Feature | undefined>()
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
  }

  const disableNext =
    !selectedFlag?.identifier || (!!selectedFlag?.identifier && selectedTabId === TabId.SET_UP_APP && !apiKey)
  const { trackEvent } = useTelemetry()

  return (
    <Container height="100%" background={Color.WHITE} className={css.container}>
      <Layout.Horizontal padding="large" spacing="xsmall" flex height={40} data-testid="getStartedBreadcrumb">
        <Link to={routes.toCFOnboarding({ accountId: accountIdentifier, orgIdentifier, projectIdentifier })}>
          {getString('cf.shared.getStarted')}
        </Link>
        <Text>/</Text>
        <Text>{getString('cf.shared.quickGuide')}</Text>
        <Text>/</Text>
        <FlexExpander />
      </Layout.Horizontal>
      <Container height="calc(100% - 102px)">
        <Tabs
          id="cf-onboarding"
          defaultSelectedTabId={selectedTabId}
          onChange={switchTab}
          selectedTabId={selectedTabId}
          data-tabId={selectedTabId}
        >
          <Tab
            id={TabId.CREATE_A_FLAG}
            panel={<CreateAFlagView selectedFlag={selectedFlag} setSelectedFlag={setSelectedFlag} />}
            title={
              <Text
                icon={selectedFlag?.identifier ? 'tick-circle' : undefined}
                iconProps={{ color: Color.GREEN_500, size: 14 }}
              >
                {getString('cf.onboarding.oneCreateAFlag')}
              </Text>
            }
          />
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
          <Tab
            id={TabId.SET_UP_APP}
            title={
              <Text icon={apiKey ? 'tick-circle' : undefined} iconProps={{ color: Color.GREEN_500, size: 14 }}>
                {getString('cf.onboarding.setUpApp')}
              </Text>
            }
            disabled={!selectedFlag?.identifier}
            panel={
              selectedFlag && (
                <SetUpYourApplicationView
                  flagInfo={selectedFlag}
                  language={language}
                  setLanguage={setLanguage}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  setEnvironmentIdentifier={_environmentIdentifier => {
                    setEnvironmentIdentifier(_environmentIdentifier)
                  }}
                />
              )
            }
          />
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
          <Tab
            id={TabId.TEST_YOUR_FLAG}
            disabled={disableNext}
            title={
              <Text icon={testDone ? 'tick-circle' : undefined} iconProps={{ color: Color.GREEN_500, size: 14 }}>
                {getString('cf.onboarding.testYourFlag')}
              </Text>
            }
            panel={
              language &&
              apiKey &&
              selectedFlag && (
                <ValidateYourFlagView
                  flagInfo={selectedFlag}
                  language={language}
                  apiKey={apiKey}
                  testDone={testDone}
                  setTestDone={setTestDone}
                  environmentIdentifier={environmentIdentifier}
                />
              )
            }
          />
        </Tabs>
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
          }}
        />
        <Button
          text={getString('next')}
          rightIcon={selectedTabId === TabId.TEST_YOUR_FLAG ? undefined : 'chevron-right'}
          intent={Intent.PRIMARY}
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
          }}
        />
        <FlexExpander />
      </Layout.Horizontal>
    </Container>
  )
}
