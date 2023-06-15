import { Text, Layout, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import CommonTroubleShootingSteps from './CommonTroubleShootingSteps'

const HelmTroubleShooting = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.helmTroubleShooting1')}
      </Text>
      <Container margin={{ bottom: 'medium' }}>
        <Container margin={{ bottom: 'medium' }}>
          <CommandBlock
            telemetryProps={{
              copyTelemetryProps: {
                eventName: DelegateActions.DelegateCommandLineTroubleShootHelmCopyCommonCommand1,
                properties: { category: Category.DELEGATE }
              }
            }}
            commandSnippet={getString('delegates.commandLineCreation.helmTroubleShooting2')}
            allowCopy={true}
          />
        </Container>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootHelmCopyCommonCommand2,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.helmTroubleShooting3')}
          allowCopy={true}
        />
      </Container>
      <Text font={{ variation: FontVariation.BODY }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.helmTroubleShootingInfoCommand')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} margin={{ bottom: 'xxlarge' }}>
        {getString('delegates.commandLineCreation.helmTroubleShooting4')}
        <a href="https://helm.sh/docs/faq/troubleshooting/">
          {' '}
          {getString('delegates.commandLineCreation.helmTroubleShooting5')}
        </a>
      </Text>
      <CommonTroubleShootingSteps delegateType={DelegateCommonProblemTypes.HELM_CHART} />
    </Layout.Vertical>
  )
}
export default HelmTroubleShooting
