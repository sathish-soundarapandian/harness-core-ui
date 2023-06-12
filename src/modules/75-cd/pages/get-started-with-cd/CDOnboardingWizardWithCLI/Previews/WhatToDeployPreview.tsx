import React from 'react'
import { get } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps } from '../Constants'

export default function WhatToDeployPreview(): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const svcType = React.useMemo(() => {
    return get(stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData, 'svcType.label')
  }, [stepsProgress])
  const artfiactType = React.useMemo(() => {
    return get(stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData, 'artifactType.label')
  }, [stepsProgress])
  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('common.serviceType')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {svcType}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('pipeline.artifactsSelection.artifactType')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {artfiactType}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
