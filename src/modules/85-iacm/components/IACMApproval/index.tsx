import React, { memo, ReactElement } from 'react'
import ExecFactory from '@pipeline/factories/ExecutionFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { IACMComponentMounter } from '../IACMApp'

const IACMApproval = (props): ReactElement => (
  <IACMComponentMounter component="RemmoteIACMApproval" childProps={props} />
)

ExecFactory.registerStepDetails(StepType.ChaosExperiment, {
  component: memo(IACMApproval)
})