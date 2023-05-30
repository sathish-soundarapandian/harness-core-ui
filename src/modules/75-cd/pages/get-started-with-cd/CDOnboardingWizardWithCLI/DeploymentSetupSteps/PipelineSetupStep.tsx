import React from 'react'
import { Layout, Tab, Tabs } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import css from '../CDOnboardingWizardWithCLI.module.scss'
import { getCommandStrWithNewline } from '../utils'
export default function PipelineSetupStep(): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge', top: 'xxlarge' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.title"
        />
        <String
          className={css.padLeft}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.description"
        />
      </Layout.Vertical>
      <CLISteps />
    </Layout.Vertical>
  )
}

function CLISteps(): JSX.Element {
  const { getString } = useStrings()
  const commandSnippet = React.useMemo(() => {
    return getCommandStrWithNewline([
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.clonecmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.logincmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.createsvccmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.createenvcmd')
    ])
  }, [])
  return (
    <Layout.Vertical>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={commandSnippet}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
