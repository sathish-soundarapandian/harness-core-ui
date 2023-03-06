import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { IACMInit } from './IACMInit'
import { IACMEvaluate } from './IACMEvaluate'
import { IACMExecute } from './IACMExecute'

factory.registerStep(new IACMInit())
factory.registerStep(new IACMEvaluate())
factory.registerStep(new IACMExecute())
