/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Container, Heading, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import type { ApiKey, FeatureFlagRequestRequestBody } from 'services/cf'
import { LanguageSelection, PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { SetUpAppInfoView } from './SetUpAppInfoView'
import { SelectEnvironmentView } from './SelectEnvironmentView'
import { SetUpYourCodeView } from './SetUpYourCodeView'

export interface SetUpYourApplicationViewProps {
  flagInfo: FeatureFlagRequestRequestBody
  language: PlatformEntry | undefined
  setLanguage: (language: PlatformEntry) => void
  apiKey: ApiKey | undefined
  setApiKey: (key: ApiKey | undefined) => void
  setEnvironmentIdentifier: (environmentIdentifier: string | undefined) => void
}

export const SetUpYourApplicationView: React.FC<SetUpYourApplicationViewProps> = props => {
  const { flagInfo } = props
  const { getString } = useStrings()
  const [language, setLanguage] = useState<PlatformEntry | undefined>(props.language)
  const [apiKey, setApiKey] = useState<ApiKey | undefined>(props.apiKey)
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(FeatureActions.SetUpYourApplicationView, {
      category: Category.FEATUREFLAG
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Container height="100%">
      <Container padding="xlarge" width="calc(100% - 400px)" height="calc(100vh - 140px)" style={{ overflow: 'auto' }}>
        <Text
          inline
          color={Color.BLACK}
          padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
          style={{
            background: '#F3F3FA',
            borderRadius: '4px'
          }}
        >
          <String
            stringID="cf.onboarding.successLabel"
            vars={{ name: flagInfo.name, identifier: flagInfo.identifier }}
            useRichText
          />
        </Text>
        <Heading
          level={2}
          style={{
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
            color: '#22222A'
          }}
          padding={{ top: 'xlarge', bottom: 'xlarge' }}
        >
          {getString('cf.onboarding.setupLabel')}
        </Heading>
        <Container>
          <Layout.Vertical spacing="xsmall">
            <Text style={{ fontWeight: 600, fontSize: '16px', color: '#22222A' }}>
              {getString('cf.onboarding.selectLanguage')}
            </Text>
            <Container padding="large" style={{ background: '#FAFBFC' }}>
              <LanguageSelection
                selected={language}
                onSelect={entry => {
                  trackEvent(FeatureActions.LanguageSelect, {
                    category: Category.FEATUREFLAG,
                    language: entry
                  })
                  setLanguage(entry)
                  props.setLanguage(entry)
                  setApiKey(undefined)
                  props.setApiKey(undefined)
                }}
              />
            </Container>
          </Layout.Vertical>
        </Container>

        {language && (
          <Container margin={{ top: 'large' }}>
            <Layout.Vertical spacing="xsmall">
              <Text style={{ fontWeight: 600, fontSize: '16px', color: '#22222A' }}>
                {getString('cf.onboarding.selectEnvironment')}
              </Text>
              <Container padding="large" style={{ background: '#FAFBFC' }}>
                <SelectEnvironmentView
                  apiKey={apiKey}
                  setApiKey={key => {
                    setApiKey(key)
                    props.setApiKey(key)
                  }}
                  setEnvironmentIdentifier={environmentIdentifier => {
                    props.setEnvironmentIdentifier(environmentIdentifier)
                  }}
                  language={language}
                />
              </Container>
            </Layout.Vertical>
          </Container>
        )}

        {language && apiKey && (
          <Container margin={{ top: 'large' }}>
            <Layout.Vertical spacing="xsmall">
              <Text style={{ fontWeight: 600, fontSize: '16px', color: '#22222A' }}>
                {getString('cf.onboarding.setUpYourCode')}
              </Text>
              <Container padding="large" style={{ paddingTop: 0 }}>
                <SetUpYourCodeView apiKey={apiKey} language={language} />
              </Container>
            </Layout.Vertical>
          </Container>
        )}
      </Container>
      <SetUpAppInfoView />
    </Container>
  )
}
