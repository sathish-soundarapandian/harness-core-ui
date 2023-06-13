import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import { String, useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline } from '../../utils'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
interface PipelineSetupStepProps {
  apiKey: string
}
export default function PipelineSetupStep({ apiKey }: PipelineSetupStepProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge', top: 'xxlarge' }}>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.title"
            vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.padLeft}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.description"
          />
        </Text>
      </Layout.Vertical>
      <CLISteps getString={getString} apiKey={apiKey} />
    </Layout.Vertical>
  )
}

function CLISteps({ getString, apiKey }: { getString: UseStringsReturn['getString']; apiKey: string }): JSX.Element {
  const { accountId } = useParams<AccountPathProps>()

  const commandSnippet = React.useMemo(() => {
    return getCommandStrWithNewline([
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.clonecmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.logincmd', {
        accId: accountId,
        apiKey: apiKey
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.createsecret'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.creategithubcon'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.createk8scon'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.createsvccmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.createenvcmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.commands.createinfracmd')
      // getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.createpipelinecmd')
    ])
  }, [apiKey])
  return (
    <Layout.Vertical>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={commandSnippet}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'harness-cli-setup', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
