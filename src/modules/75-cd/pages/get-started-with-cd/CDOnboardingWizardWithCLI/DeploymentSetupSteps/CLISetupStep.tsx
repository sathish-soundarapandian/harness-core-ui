import React from 'react'
import { Layout, Tab, Tabs } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import css from '../CDOnboardingWizardWithCLI.module.scss'
export default function CLISetupStep(): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsTitle"
        />
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsIntro"
        />
        <String stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.stepsIntro2" />
      </Layout.Vertical>
      <InstallCLIInfo />
    </Layout.Vertical>
  )
}

function InstallCLIInfo(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <String
        className={css.marginBottomLarge}
        stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.title"
      />
      <Tabs id="selectedOS">
        <Tab
          id="mac"
          title="macOs"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.mac')}
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
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.linux')}
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
              commandSnippet={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.win')}
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
