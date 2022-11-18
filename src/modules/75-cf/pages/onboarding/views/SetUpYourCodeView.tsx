/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, RadioButtonGroup, Heading } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ApiKey } from 'services/cf'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { MarkdownViewer } from '@common/components/MarkdownViewer/MarkdownViewer'
import type { StringKeys } from 'framework/strings'
export interface SetUpYourCodeViewProps {
  language: PlatformEntry
  apiKey: ApiKey
  flagName: string
}

export const SetUpYourCodeView: React.FC<SetUpYourCodeViewProps> = ({ language, apiKey, flagName }) => {
  const { getString } = useStrings()
  const [currentReadme, setCurrentReadme] = useState<StringKeys>(language.readmeStringId)
  const [xamarinOption, setXamarinOption] = useState<StringKeys | undefined>(
    language.name === 'Xamarin' ? 'cf.onboarding.android' : undefined
  )

  return (
    <Container margin={{ top: 'small' }}>
      <Layout.Vertical margin={{ top: 'small', bottom: 'small' }} spacing="medium">
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
