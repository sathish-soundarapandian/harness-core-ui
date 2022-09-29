/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import type { PipelineInfoConfig } from 'services/pipeline-ng'

export interface StageFormContextValues {
  getStageFormTemplate<T>(path: string): T | PipelineInfoConfig
  updateStageFormTemplate<T = unknown>(data: T, path: string): void
}

export const StageFormContext = React.createContext<StageFormContextValues>({
  getStageFormTemplate: () => ({} as PipelineInfoConfig),
  updateStageFormTemplate: noop
})

export interface StageFormContextProviderProps extends StageFormContextValues {
  children: React.ReactNode
}

export function StageFormContextProvider(props: StageFormContextProviderProps): React.ReactElement {
  const { children, ...rest } = props

  return <StageFormContext.Provider value={rest}>{children}</StageFormContext.Provider>
}

export function useStageFormContext(): StageFormContextValues {
  return React.useContext(StageFormContext)
}
