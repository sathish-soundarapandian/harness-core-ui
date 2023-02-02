import { OverlaySpinner, Text, Layout, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import css from '../DelegateCommandLineCreation.module.scss'
interface TerraFormCommandsProps {
  command: string
}
const TerraFormCommands: React.FC<TerraFormCommandsProps> = ({ command }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.firstCommandHeadingTerraform')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <Container className={cx(css.terrformCommandContainer, { [css.terrformCommandContainerCenter]: !command })}>
          <OverlaySpinner show={!command}>
            {command && (
              <CommandBlock
                telemetryProps={{
                  copyTelemetryProps: {
                    eventName: DelegateActions.DelegateCommandLineTerraformCommandCopy3,
                    properties: { category: Category.DELEGATE }
                  },
                  downloadTelemetryProps: {
                    eventName: DelegateActions.DelegateCommandLineTerraformDownloadCommand3,
                    properties: { category: Category.DELEGATE }
                  }
                }}
                commandSnippet={command}
                allowCopy={true}
                ignoreWhiteSpaces={false}
                allowDownload={true}
                downloadFileProps={{ downloadFileExtension: 'tf', downloadFileName: 'main' }}
              />
            )}
          </OverlaySpinner>
        </Container>
      </Container>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.secondCommandHeadingTerraform')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTerraformCommandCopy2,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.secondCommandTerraFormFirstLine')}
          allowCopy={true}
        />
      </Container>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.foruthCommandHeading')}
      </Text>
      <CommandBlock
        telemetryProps={{
          copyTelemetryProps: {
            eventName: DelegateActions.DelegateCommandLineTerraformCommandCopy1,
            properties: { category: Category.DELEGATE }
          }
        }}
        commandSnippet={getString('delegates.commandLineCreation.firstCommandTerraFormFirstLine')}
        allowCopy={true}
      />
    </Layout.Vertical>
  )
}
export default TerraFormCommands
