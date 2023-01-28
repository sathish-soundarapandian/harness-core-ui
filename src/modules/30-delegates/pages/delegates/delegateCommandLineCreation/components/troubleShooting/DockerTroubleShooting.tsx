import { Layout, Text, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'

const DockerTroubleShooting = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="none">
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.delegateNotInstalled.statusOfCluster')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootDockerCopyCommonCommand1,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.delegateNotInstalled.verifyStatus1')}
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
              eventName: DelegateActions.DelegateCommandLineTroubleShootDockerCopyCommonCommand2,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.dockerTroubleShooting1')}
          allowCopy={true}
        />
      </Container>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.commandLineCreation.dockerTroubleShooting2')}
      </Text>
      <Container margin={{ bottom: 'medium' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootDockerCopyCommonCommand3,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.dockerTroubleShooting3')}
          allowCopy={true}
        />
      </Container>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootDockerCopyCommonCommand4,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.dockerTroubleShooting4')}
          allowCopy={true}
        />
      </Container>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {getString('delegates.commandLineCreation.dockerTroubleShooting5')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootDockerCopyCommonCommand5,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.dockerTroubleShooting6')}
          allowCopy={true}
        />
      </Container>
    </Layout.Vertical>
  )
}
export default DockerTroubleShooting
