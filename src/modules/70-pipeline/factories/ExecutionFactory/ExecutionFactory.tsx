/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Module } from '@common/interfaces/RouteInterfaces'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CellTypeRegister } from '@pipeline/pages/execution-list/ExecutionListTable/ExecutionListCells'
import type { StageType } from '@pipeline/utils/stageHelpers'

import type {
  StepDetailsRegister,
  ExecutionCardInfoRegister,
  ExecutionSummaryRegister,
  ConsoleViewStepDetailsRegister,
  StageDetailsRegister
} from './types'

export interface ExecutionFactoryConstruct {
  defaultStepDetails: StepDetailsRegister
  defaultConsoleViewStepDetails: ConsoleViewStepDetailsRegister
  defaultExecutionTriggerCell: CellTypeRegister
}

export class ExecutionFactory {
  private stepDetailsMap = new Map<StepType, StepDetailsRegister>()

  private defaultStepDetails: StepDetailsRegister

  private cardInfoMap = new Map<StageType, ExecutionCardInfoRegister>()

  private summaryInfoMap = new Map<StageType, ExecutionSummaryRegister>()

  private consoleViewStepDetailsMap = new Map<StepType, ConsoleViewStepDetailsRegister>()

  private defaultConsoleViewStepDetails: ConsoleViewStepDetailsRegister

  private stageDetailsMap = new Map<StageType, StageDetailsRegister>()

  private executionTriggerCellMap = new Map<Module, CellTypeRegister>()

  private defaultExecutionTriggerCell: CellTypeRegister

  constructor(opt: ExecutionFactoryConstruct) {
    this.defaultStepDetails = opt.defaultStepDetails
    this.defaultConsoleViewStepDetails = opt.defaultConsoleViewStepDetails
    this.defaultExecutionTriggerCell = opt.defaultExecutionTriggerCell
  }

  registerStepDetails(stepType: StepType, stepDetails: StepDetailsRegister): void {
    if (this.stepDetailsMap.has(stepType)) {
      throw new Error(`Step of type "${stepType}" is already registred`)
    }

    this.stepDetailsMap.set(stepType, stepDetails)
  }

  getStepDetails(stepType?: StepType): StepDetailsRegister {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return stepType && this.stepDetailsMap.has(stepType) ? this.stepDetailsMap.get(stepType)! : this.defaultStepDetails
  }

  registerCardInfo(type: StageType, data: ExecutionCardInfoRegister): void {
    this.cardInfoMap.set(type, data)
  }

  getCardInfo(type: StageType): ExecutionCardInfoRegister | null {
    return this.cardInfoMap.get(type) || null
  }

  registerSummary(type: StageType, data: ExecutionSummaryRegister): void {
    this.summaryInfoMap.set(type, data)
  }

  getSummary(type: StageType): ExecutionSummaryRegister | null {
    return this.summaryInfoMap.get(type) || null
  }

  registerConsoleViewStepDetails(type: StepType, data: ConsoleViewStepDetailsRegister): void {
    this.consoleViewStepDetailsMap.set(type, data)
  }

  getConsoleViewStepDetails(type: StepType): ConsoleViewStepDetailsRegister {
    return this.consoleViewStepDetailsMap.get(type) || this.defaultConsoleViewStepDetails
  }

  registerStageDetails(type: StageType, data: StageDetailsRegister): void {
    this.stageDetailsMap.set(type, data)
  }

  getStageDetails(type: StageType): StageDetailsRegister | null {
    return this.stageDetailsMap.get(type) || null
  }

  registerExecutionTriggerCellDetails(type: Module, data: CellTypeRegister): void {
    this.executionTriggerCellMap.set(type, data)
  }

  getExecutionTriggerCellDetails(type?: Module): CellTypeRegister {
    return type && this.executionTriggerCellMap.has(type)
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.executionTriggerCellMap.get(type)!
      : this.defaultExecutionTriggerCell
  }
}
