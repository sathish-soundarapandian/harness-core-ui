import React from 'react'
import { Layout, Tab, Tabs, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import ApiKeySetup, { ApiKeySetupProps } from './ApiKeySetup'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
export default function CLISetupStep({ onKeyGenerate }: ApiKeySetupProps): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge' }}>
        <Text className={css.bold} color={Color.BLACK} padding={{ top: 'large' }}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsTitle"
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'large' }}>
          <String
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsIntro"
            useRichText
            vars={{ sampleAppURL: 'https://github.com/harness-community/harnesscd-example-apps/' }}
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'large' }}>
          <String stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsIntro2" />
        </Text>
        <ApiKeySetup onKeyGenerate={onKeyGenerate} />
      </Layout.Vertical>
      <InstallCLIInfo />
    </Layout.Vertical>
  )
}

function InstallCLIInfo(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.title"
        />
      </Text>
      <Tabs id="selectedOS">
        <Tab
          id="mac"
          title="macOs"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.mac')}
              ignoreWhiteSpaces={true}
              downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
            />
          }
        />
        <Tab
          id="linux"
          title="Linux"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.linux')}
              ignoreWhiteSpaces={true}
              downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
            />
          }
        />
        <Tab
          id="win"
          title="Windows"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.win')}
              ignoreWhiteSpaces={true}
              downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
            />
          }
        />
      </Tabs>
    </Layout.Vertical>
  )
}
