/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Container, TextInput, Heading, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import type { FeatureFlagRequestRequestBody } from 'services/cf'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { CreateAFlagInfoView } from './CreateAFlagInfoView'

export interface CreateAFlagViewProps {
  setFlagName: React.Dispatch<React.SetStateAction<string>>
  flagInfo: FeatureFlagRequestRequestBody
  isCreated: boolean
  goNext: () => void
}

export const CreateAFlagView: React.FC<CreateAFlagViewProps> = ({ flagInfo, setFlagName, isCreated, goNext }) => {
  const { getString } = useStrings()

  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(FeatureActions.CreateAFlagView, {
      category: Category.FEATUREFLAG
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container height="100%">
      <Container padding="xlarge" width="calc(100% - 765px)" height="calc(100vh - 140px)" style={{ overflow: 'auto' }}>
        <Heading
          level={2}
          style={{
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
            color: '#22222A'
          }}
          padding={{ bottom: 'xxlarge' }}
        >
          {getString('cf.onboarding.letsStart')}
        </Heading>
        <Layout.Vertical width={400} spacing="xsmall">
          <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
            {getString('cf.onboarding.inputLabel')}
          </Text>
          <TextInput
            value={flagInfo.name}
            autoFocus
            disabled={isCreated}
            onChange={e => {
              setFlagName((e.currentTarget as HTMLInputElement).value.trim())
            }}
            onKeyUp={event => {
              if (event.keyCode === 13) {
                goNext()
              }
            }}
          />
        </Layout.Vertical>
        {isCreated && (
          <Text
            color={Color.BLACK}
            rightIcon="tick"
            margin={{ top: 'xxlarge' }}
            rightIconProps={{ color: Color.GREEN_500 }}
          >
            <String
              stringID="cf.onboarding.successLabel"
              vars={{ name: flagInfo.name, identifier: flagInfo.identifier }}
              useRichText
            />
          </Text>
        )}
      </Container>
      <CreateAFlagInfoView />
    </Container>
  )
}
