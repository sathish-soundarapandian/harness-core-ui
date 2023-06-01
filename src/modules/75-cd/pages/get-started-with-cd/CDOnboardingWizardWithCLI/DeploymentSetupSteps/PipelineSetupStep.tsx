import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline } from '../utils'
import css from '../CDOnboardingWizardWithCLI.module.scss'
export default function PipelineSetupStep(): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge', top: 'xxlarge' }}>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.title"
            vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.padLeft}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step2.description"
          />
        </Text>
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
