import { OverlaySpinner, Text, Layout, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'

import css from '../DelegateCommandLineCreation.module.scss'
interface DockerCommandsProps {
  command: string
}
const DockerCommands: React.FC<DockerCommandsProps> = ({ command }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.firstCommandHeadingDocker')}
      </Text>
      <Container className={cx({ [css.terrformCommandContainerCenter]: !command })}>
        <OverlaySpinner show={!command}>
          {command && (
            <CommandBlock
              ignoreWhiteSpaces={false}
              commandSnippet={command}
              allowCopy={true}
              telemetryProps={{
                copyTelemetryProps: {
                  eventName: DelegateActions.DelegateCommandLineDockerCommandCopy,
                  properties: { category: Category.DELEGATE }
                }
              }}
            />
          )}
        </OverlaySpinner>
      </Container>
    </Layout.Vertical>
  )
}
export default DockerCommands
