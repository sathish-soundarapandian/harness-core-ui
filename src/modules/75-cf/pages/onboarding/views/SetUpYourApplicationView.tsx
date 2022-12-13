/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Container, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ApiKey, Feature } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { LanguageSelection, PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { SelectEnvironmentView } from './SelectEnvironmentView'
import { SetUpYourCodeView } from './SetUpYourCodeView'
export interface SetUpYourApplicationViewProps {
  flagInfo: Feature
  language?: PlatformEntry
  setLanguage: (language: PlatformEntry | undefined) => void
  apiKey?: ApiKey
  setApiKey: (key: ApiKey | undefined) => void
  selectedEnvironment?: EnvironmentResponseDTO
  setSelectedEnvironment: (env: EnvironmentResponseDTO | undefined) => void
}

export const SetUpYourApplicationView: React.FC<SetUpYourApplicationViewProps> = ({
  flagInfo,
  language,
  setLanguage,
  apiKey,
  setApiKey,
  selectedEnvironment,
  setSelectedEnvironment
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(FeatureActions.SetUpYourApplicationView, {
      category: Category.FEATUREFLAG
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical padding={{ top: 'small', bottom: 'small' }}>
      <Layout.Horizontal margin={{ top: 'small' }}>
        <Heading level={4} font={{ variation: FontVariation.H4 }}>
          {getString('cf.onboarding.selectEnvAndSdk')}
        </Heading>
      </Layout.Horizontal>
      <Layout.Vertical padding={{ top: 'xlarge', bottom: 'large' }}>
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.GREY_800}>
          {getString('cf.onboarding.selectLanguage')}
        </Text>
        <Container>
          <LanguageSelection
            selected={language}
            onSelect={entry => {
              trackEvent(FeatureActions.LanguageSelect, {
                category: Category.FEATUREFLAG,
                language: entry
              })
              setLanguage(entry)
              setApiKey(undefined)
            }}
          />
        </Container>
      </Layout.Vertical>
      {language && (
        <SelectEnvironmentView
          apiKey={apiKey}
          setApiKey={setApiKey}
          selectedEnvironment={selectedEnvironment}
          setSelectedEnvironment={setSelectedEnvironment}
          language={language}
        />
      )}

      {selectedEnvironment && language && apiKey && (
        <SetUpYourCodeView apiKey={apiKey} language={language} flagName={flagInfo.name} />
      )}
    </Layout.Vertical>
  )
}
