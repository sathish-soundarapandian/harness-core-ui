import React from 'react'
import CLISetupStep from './CLISetupStep'
import PipelineSetupStep from './PipelineSetupStep'
import DeploymentStrategyStep from './DeploymentStrategyStep'
interface DeploymentSetupStepsProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentSetupSteps({ saveProgress: _ }: DeploymentSetupStepsProps): JSX.Element {
  return (
    <>
      <CLISetupStep />
      <PipelineSetupStep />
      <DeploymentStrategyStep />
    </>
  )
}
