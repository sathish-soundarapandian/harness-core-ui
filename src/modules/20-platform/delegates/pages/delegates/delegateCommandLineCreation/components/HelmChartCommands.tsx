/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { OverlaySpinner, Text, Layout, Container } from '@harness/uicore'

import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { StringKeys, useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import css from '../DelegateCommandLineCreation.module.scss'
interface HelmChartCommandsProps {
  command: string
  combineAllCommands?: boolean
}
const HelmChartCommands: React.FC<HelmChartCommandsProps> = ({ command, combineAllCommands }) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const combinedCommands = React.useMemo(
    () =>
      [
        getString('delegates.commandLineCreation.firstCommandHelmFirstLine'),
        getString('delegates.commandLineCreation.firstCommandHelmSecondLine'),
        command
      ].join(' ; \n'),
    [getString, command]
  )

  const renderCommandBlock = React.useCallback(
    (commandString: string): JSX.Element => (
      <Container className={cx({ [css.terrformCommandContainerCenter]: !commandString })}>
        <OverlaySpinner show={!commandString}>
          {commandString && (
            <CommandBlock
              telemetryProps={{
                copyTelemetryProps: {
                  eventName: DelegateActions.DelegateCommandLineHelmCommandCopy4,
                  properties: { category: Category.DELEGATE }
                }
              }}
              ignoreWhiteSpaces={false}
              commandSnippet={commandString}
              allowCopy={true}
              {...(combineAllCommands
                ? { copyButtonText: getString('delegates.commandLineCreation.copyCommand') }
                : {})}
            />
          )}
        </OverlaySpinner>
      </Container>
    ),
    [combineAllCommands, getString]
  )

  const commandWithDefaultYAMLBlock = (titleText: StringKeys): JSX.Element => (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }} margin={{ bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.H6 }}>{getString(titleText)}</Text>
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
  )

  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      {combineAllCommands ? (
        <>
          {commandWithDefaultYAMLBlock('delegates.commandLineCreation.combinedHelmChartCommandsHeading')}
          {renderCommandBlock(combinedCommands)}
        </>
      ) : (
        <>
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
          {commandWithDefaultYAMLBlock('delegates.commandLineCreation.secondCommandHeadingHelm')}
          {renderCommandBlock(command)}
        </>
      )}
    </Layout.Vertical>
  )
}
export default HelmChartCommands
