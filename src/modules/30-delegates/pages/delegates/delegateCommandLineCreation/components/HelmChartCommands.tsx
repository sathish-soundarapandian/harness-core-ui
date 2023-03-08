import { OverlaySpinner, Text, Layout, Container } from '@harness/uicore'

import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import css from '../DelegateCommandLineCreation.module.scss'
interface HelmChartCommandsProps {
  command: string
}
const HelmChartCommands: React.FC<HelmChartCommandsProps> = ({ command }) => {
  const { getString } = useStrings()

  const { trackEvent } = useTelemetry()
  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.firstCommandHeadingHelm')}
      </Text>
      <Layout.Vertical margin={{ bottom: 'xxlarge' }} className={css.codeBlock}>
        <Container margin={{ bottom: 'medium' }}>
          <CommandBlock
            telemetryProps={{
              copyTelemetryProps: {
                eventName: DelegateActions.DelegateCommandLineHelmCommandCopy1,
                properties: { category: Category.DELEGATE }
              }
            }}
            commandSnippet={`${getString('delegates.commandLineCreation.firstCommandHelmFirstLine')}`}
            allowCopy={true}
          />
        </Container>
        <CommandBlock
          commandSnippet={`${getString('delegates.commandLineCreation.firstCommandHelmSecondLine')}`}
          allowCopy={true}
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineHelmCommandCopy2,
              properties: { category: Category.DELEGATE }
            }
          }}
        />
      </Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }} margin={{ bottom: 'medium' }}>
        <Text font={{ variation: FontVariation.H6 }}>
          {getString('delegates.commandLineCreation.secondCommandHeadingHelm')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7}>
          <a
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent(DelegateActions.DelegateCommandLineDefaultValuesYamlUsed, {
                category: Category.DELEGATE
              })
            }}
            href={'https://raw.githubusercontent.com/harness/delegate-helm-chart/main/harness-delegate-ng/values.yaml'}
          >
            {getString('delegates.commandLineCreation.defaultValuesYaml')}
          </a>
        </Text>
      </Layout.Horizontal>
      <Container className={cx({ [css.terrformCommandContainerCenter]: !command })}>
        <OverlaySpinner show={!command}>
          {command && (
            <CommandBlock
              telemetryProps={{
                copyTelemetryProps: {
                  eventName: DelegateActions.DelegateCommandLineHelmCommandCopy4,
                  properties: { category: Category.DELEGATE }
                }
              }}
              ignoreWhiteSpaces={false}
              commandSnippet={command}
              allowCopy={true}
            />
          )}
        </OverlaySpinner>
      </Container>
    </Layout.Vertical>
  )
}
export default HelmChartCommands
