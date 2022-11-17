/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, RadioButtonGroup, Heading } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { ApiKey } from 'services/cf'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { MarkdownViewer } from '@common/components/MarkdownViewer/MarkdownViewer'
import type { StringKeys } from 'framework/strings'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
export interface SetUpYourCodeViewProps {
  language: PlatformEntry
  apiKey: ApiKey
  flagName: string
  environment: EnvironmentResponseDTO
}

export const SetUpYourCodeView: React.FC<SetUpYourCodeViewProps> = ({ language, apiKey, flagName, environment }) => {
  const { getString } = useStrings()
  const [currentReadme, setCurrentReadme] = useState<StringKeys>(language.readmeStringId)
  const [xamarinOption, setXamarinOption] = useState<StringKeys | undefined>(
    language.name === 'Xamarin' ? 'cf.onboarding.android' : undefined
  )

  return (
    <Container margin={{ top: 'large' }}>
      <Layout.Vertical margin={{ top: 'medium', bottom: 'medium' }} spacing="medium">
        <Heading level={4} font={{ variation: FontVariation.H4 }} margin={{ bottom: 'large' }}>
          {getString('cf.onboarding.selectEnvAndSdk')}
        </Heading>

        <Layout.Horizontal spacing="xsmall">
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
            {getString('cf.onboarding.youveSelected')}
          </Text>
          {language?.icon && <img src={language.icon} width="20px" height="20px" />}
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
            <String
              useRichText
              stringID="cf.onboarding.selectedLanguageAndEnv"
              vars={{ language: language.name, env: environment.name }}
              color={Color.GREY_600}
              tagName="div"
            />
          </Text>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
          <String
            useRichText
            stringID="cf.onboarding.keyGeneratedBelow"
            vars={{ langType: language.type }}
            color={Color.GREY_600}
          />
        </Text>
        <IdentifierText identifier={apiKey.apiKey} allowCopy lineClamp={1} hideLabel />
        <Divider />
      </Layout.Vertical>
      <Layout.Vertical spacing="xsmall">
        <Heading level={4} font={{ variation: FontVariation.H4 }} margin={{ bottom: 'large' }}>
          {getString('cf.onboarding.setUpYourCode')}
        </Heading>
        <Container>
          {language.name === 'Xamarin' && (
            <RadioButtonGroup
              padding={{ top: 'small' }}
              asPills
              selectedValue={xamarinOption}
              onChange={() => {
                if (xamarinOption === 'cf.onboarding.android') {
                  setXamarinOption('cf.onboarding.ios')
                  setCurrentReadme('cf.onboarding.readme.xamarinIOS')
                } else {
                  setXamarinOption('cf.onboarding.android')
                  setCurrentReadme('cf.onboarding.readme.xamarinAndroid')
                }
              }}
              options={[
                {
                  label: getString('cf.onboarding.android'),
                  value: 'cf.onboarding.android'
                },
                {
                  label: getString('cf.onboarding.ios'),
                  value: 'cf.onboarding.ios'
                }
              ]}
            />
          )}
          <MarkdownViewer
            stringId={currentReadme}
            vars={{
              ...apiKey,
              apiKey: apiKey.apiKey,
              flagName: flagName
            }}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
