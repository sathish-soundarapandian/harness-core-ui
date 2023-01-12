/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, useContext } from 'react'
import type { SetStateAction } from 'react'

export enum ExecutionLayoutState {
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  FLOATING = 'FLOATING',
  MINIMIZE = 'MINIMIZE'
}

export interface ExecutionLayoutContextParams {
  layout: ExecutionLayoutState
  setLayout(action: SetStateAction<ExecutionLayoutState>): void
  primaryPaneSize: number
  setPrimaryPaneSize(action: SetStateAction<number>): void
  tertiaryPaneSize: number
  setTertiaryPaneSize(action: SetStateAction<number>): void
  isStepDetailsVisible: boolean
  restoreDialog(): void
  setStepDetailsVisibility(action: SetStateAction<boolean>): void
  isCollapsedNodePaneVisible: boolean
  setCollapsedNodePaneVisibility(action: SetStateAction<boolean>): void
}

export const ExecutionLayoutContext = createContext<ExecutionLayoutContextParams>({
  layout: ExecutionLayoutState.RIGHT,
  setLayout: /* istanbul ignore next */ () => void 0,
  primaryPaneSize: 0,
  tertiaryPaneSize: 0,
  setPrimaryPaneSize: /* istanbul ignore next */ () => void 0,
  setTertiaryPaneSize: /* istanbul ignore next */ () => void 0,
  isStepDetailsVisible: false,
  restoreDialog: /* istanbul ignore next */ () => void 0,
  setStepDetailsVisibility: /* istanbul ignore next */ () => void 0,
  isCollapsedNodePaneVisible: false,
  setCollapsedNodePaneVisibility: /* istanbul ignore next */ () => void 0
})

export function useExecutionLayoutContext(): ExecutionLayoutContextParams {
  return useContext(ExecutionLayoutContext)
}
