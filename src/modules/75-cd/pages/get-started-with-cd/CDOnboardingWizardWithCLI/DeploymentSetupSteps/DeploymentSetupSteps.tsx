import React from 'react'
import CLISetupStep from './CLISetupStep'
import PipelineSetupStep from './PipelineSetupStep'
import DeploymentStrategyStep from './DeploymentStrategyStep'

export default function DeploymentSetupSteps(): JSX.Element {
  return (
    <>
      <CLISetupStep />
      <PipelineSetupStep />
      <DeploymentStrategyStep />
    </>
  )
}
