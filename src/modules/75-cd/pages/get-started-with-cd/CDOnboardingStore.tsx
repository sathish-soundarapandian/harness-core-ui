/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { merge } from 'lodash-es'
import React from 'react'
import type { EnvironmentRequestDTO } from 'services/cd-ng'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'

import {
  CDOnboardingContextActions,
  CDOnboardingReducer,
  CDOnboardingReducerState,
  initialState
} from './CDOnboardingActions'
import type { InfrastructureDataType, ServiceDataType } from './cdOnboardingUtils'

export interface CDOnboardingContextInterface {
  state: CDOnboardingReducerState
  saveServiceData: (data: ServiceDataType) => void
  saveEnvironmentData: (data: EnvironmentRequestDTO) => void
  saveInfrastructureData: (data: InfrastructureDataType) => void
}

export const CDOnboardingContext = React.createContext<CDOnboardingContextInterface>({
  state: initialState,
  saveServiceData: () => new Promise<void>(() => undefined),
  saveEnvironmentData: () => new Promise<void>(() => undefined),
  saveInfrastructureData: () => new Promise<void>(() => undefined)
})

export interface CDOnboardingProviderProps {
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  serviceIdentifier: string
}

export function CDOnboardingProvider({
  queryParams,
  pipelineIdentifier,
  children
}: React.PropsWithChildren<CDOnboardingProviderProps>): React.ReactElement {
  const [state, dispatch] = React.useReducer(
    CDOnboardingReducer,
    merge(
      {
        pipeline: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }
      },
      initialState
    )
  )

  state.pipelineIdentifier = pipelineIdentifier

  const saveServiceData = React.useCallback((data: ServiceDataType) => {
    dispatch(CDOnboardingContextActions.updateService({ service: data }))
  }, [])

  const saveEnvironmentData = React.useCallback((data: EnvironmentRequestDTO) => {
    dispatch(CDOnboardingContextActions.updateEnvironment({ environment: data }))
  }, [])

  const saveInfrastructureData = React.useCallback((data: InfrastructureDataType) => {
    dispatch(CDOnboardingContextActions.updateInfrastructure({ infrastructure: data }))
  }, [])

  return (
    <CDOnboardingContext.Provider
      value={{
        state,
        saveServiceData,
        saveEnvironmentData,
        saveInfrastructureData
      }}
    >
      {children}
    </CDOnboardingContext.Provider>
  )
}

export function useCDOnboardingContext(): CDOnboardingContextInterface {
  // eslint-disable-next-line no-restricted-syntax
  return React.useContext(CDOnboardingContext)
}
