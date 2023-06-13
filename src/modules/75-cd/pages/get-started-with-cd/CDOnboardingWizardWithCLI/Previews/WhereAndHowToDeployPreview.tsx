import React from 'react'
import { get } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps } from '../types'

export default function WhatToDeployPreview(): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const delegateType = React.useMemo(() => {
    return get(stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData, 'svcType.label')
  }, [stepsProgress])

  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('common.serviceType')}:
        </Text>
        <Text padding={{ left: 'small' }} color={Color.BLACK}>
          {delegateType}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
