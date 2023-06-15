import { Text, Layout, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import type { DelegateCommonProblemTypes } from '@delegates/constants'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
interface CommonTroubleShootingStepsProps {
  delegateType?: DelegateCommonProblemTypes
}
const CommonTroubleShootingSteps: React.FC<CommonTroubleShootingStepsProps> = ({ delegateType }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.delegateNotInstalled.statusOfCluster')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: `${DelegateActions.DelegateCommandLineTroubleShootCopyCommonCommand1} ${delegateType}`,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.delegateNotInstalled.podCommand')}
          allowCopy={true}
        />
      </Container>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.commandLineCreation.helmTroubleShooting6')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: `${DelegateActions.DelegateCommandLineTroubleShootCopyCommonCommand2} ${delegateType}`,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.delegateNotInstalled.verifyField2')}
          allowCopy={true}
        />
      </Container>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.BODY }}>
        {getString('delegates.commandLineCreation.helmTroubleShooting7')}
      </Text>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.delegateNotInstalled.tabs.commonProblems.description2')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: `${DelegateActions.DelegateCommandLineTroubleShootCopyCommonCommand3} ${delegateType}`,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.delegateNotInstalled.verifyField3')}
          allowCopy={true}
        />
      </Container>
    </Layout.Vertical>
  )
}
export default CommonTroubleShootingSteps
