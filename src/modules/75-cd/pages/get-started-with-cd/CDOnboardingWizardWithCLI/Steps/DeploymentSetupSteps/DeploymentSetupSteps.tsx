import React from 'react'
import { useStrings } from 'framework/strings'
import CLISetupStep from './CLISetupStep'
import PipelineSetupStep from './PipelineSetupStep'
import DeploymentStrategySelection from './DeploymentStrategyStep'
interface DeploymentSetupStepsProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentSetupSteps({ saveProgress: _ }: DeploymentSetupStepsProps): JSX.Element {
  const { getString } = useStrings()
  const [apiKey, setApiKey] = React.useState<string>(
    getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.apiKeyPlacholder')
  )
  return (
    <>
      <CLISetupStep onKeyGenerate={setApiKey} />
      <PipelineSetupStep apiKey={apiKey} />
      <DeploymentStrategySelection />
    </>
  )
}
