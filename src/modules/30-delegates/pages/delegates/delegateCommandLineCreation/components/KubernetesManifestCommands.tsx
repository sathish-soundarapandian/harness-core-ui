import { Layout, Text, Container } from '@harness/uicore'

import { FontVariation, Color } from '@harness/design-system'
import React from 'react'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import css from '../DelegateCommandLineCreation.module.scss'
const KubernetesManifestCommands = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.firstComandHeadingKubernetes')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          commandSnippet={getString('delegates.commandLineCreation.firstComandKubernetesFirstLine')}
          allowCopy={true}
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineKubernetesManifestCommandCopy1,
              properties: { category: Category.DELEGATE }
            }
          }}
        />
      </Container>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.commandsKubernetesHeading')}
      </Text>
      <ul className={css.ulList}>
        <li>
          <Layout.Horizontal spacing="xsmall">
            <Text font={{ variation: FontVariation.SMALL_SEMI }}>
              {getString('delegates.commandLineCreation.kubernetesFirstDirectionPartOne')}
            </Text>
            <Text font={{ variation: FontVariation.SMALL }}>
              {getString('delegates.commandLineCreation.kubernetesFirstDirectionPartTwo')}
            </Text>
          </Layout.Horizontal>
        </li>
        <li>
          <Layout.Horizontal spacing="xsmall">
            <Text font={{ variation: FontVariation.SMALL_SEMI }}>
              {getString('delegates.commandLineCreation.kubernetesSecondDirectionPartOne')}
            </Text>
            <Text font={{ variation: FontVariation.SMALL }}>
              {getString('delegates.commandLineCreation.kubernetesSecondDirectionPartTwo')}
            </Text>
          </Layout.Horizontal>
        </li>
        <li>
          <Layout.Horizontal spacing="xsmall">
            <Text font={{ variation: FontVariation.SMALL_SEMI }}>
              {getString('delegates.commandLineCreation.kubernetesThirdDirectionPartOne')}
            </Text>
            <Text font={{ variation: FontVariation.SMALL }}>
              {getString('delegates.commandLineCreation.kubernetesThirdDirectionPartTwo')}
            </Text>
          </Layout.Horizontal>
        </li>
        <li>
          <Layout.Horizontal spacing="xsmall">
            <Text font={{ variation: FontVariation.SMALL_SEMI }}>
              {getString('delegates.commandLineCreation.kubernetesFourthDirectionPartOne')}
            </Text>
            <Text font={{ variation: FontVariation.SMALL }}>{getString('common.with')}</Text>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.PRIMARY_8}>
              {getString('delegates.commandLineCreation.kubernetesFourthDirectionPartThree')}
            </Text>
          </Layout.Horizontal>
        </li>
      </ul>

      <Text font={{ variation: FontVariation.H6 }} className={css.textHeading}>
        {getString('delegates.commandLineCreation.thirdCommandHeadingTerraform')}
      </Text>
      <CommandBlock
        ignoreWhiteSpaces={false}
        telemetryProps={{
          copyTelemetryProps: {
            eventName: DelegateActions.DelegateCommandLineKubernetesManifestCommandCopy2,
            properties: { category: Category.DELEGATE }
          }
        }}
        commandSnippet={getString('delegate.verifyDelegateYamlCmnd')}
        allowCopy={true}
      />
    </Layout.Vertical>
  )
}
export default KubernetesManifestCommands
