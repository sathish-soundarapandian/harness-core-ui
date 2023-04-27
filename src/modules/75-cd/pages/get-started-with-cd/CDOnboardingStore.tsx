/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { merge, noop } from 'lodash-es'
import React from 'react'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { EnvironmentRequestDTO } from 'services/cd-ng'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'

import type { FileStoreNodeDTO } from '@filestore/components/FileStoreContext/FileStoreContext'
import type { Servicev1Application, V1Agent } from 'services/gitops'
import {
  CDOnboardingContextActions,
  CDOnboardingReducer,
  CDOnboardingReducerState,
  initialState
} from './CDOnboardingActions'
import {
  ClusterInterface,
  DelegateDataType,
  DrawerMode,
  InfrastructureDataType,
  RepositoryInterface,
  ServiceDataType
} from './CDOnboardingUtils'

export interface WizardStepQueryParams {
  sectionId?: string | null
}

export interface DrawerDataType {
  fileContent: FileStoreNodeDTO | undefined
  mode: DrawerMode
}
export interface CDOnboardingContextInterface {
  state: CDOnboardingReducerState
  drawerData: DrawerDataType
  setDrawerData: (_drawerData: DrawerDataType) => void
  saveServiceData: (data: ServiceDataType) => void
  saveEnvironmentData: (data: EnvironmentRequestDTO) => void
  saveApplicationData: (data: Servicev1Application) => void
  saveInfrastructureData: (data: InfrastructureDataType) => void
  saveDelegateData: (data: DelegateDataType) => void
  saveRepositoryData: (data: RepositoryInterface) => void
  saveClusterData: (data: ClusterInterface) => void
  saveAgentData: (data: V1Agent) => void
}
const initialDrawerData = { fileContent: undefined, mode: DrawerMode.Preview }

export const CDOnboardingContext = React.createContext<CDOnboardingContextInterface>({
  state: initialState,
  drawerData: initialDrawerData,
  setDrawerData: noop,
  saveServiceData: () => new Promise<void>(() => undefined),
  saveEnvironmentData: () => new Promise<void>(() => undefined),
  saveApplicationData: () => new Promise<void>(() => undefined),
  saveRepositoryData: () => new Promise<void>(() => undefined),
  saveClusterData: () => new Promise<void>(() => undefined),
  saveAgentData: () => new Promise<void>(() => undefined),
  saveInfrastructureData: () => new Promise<void>(() => undefined),
  saveDelegateData: () => new Promise<void>(() => undefined)
})

export interface CDOnboardingProviderProps {
  queryParams: GetPipelineQueryParams
  serviceIdentifier: string
}

export function useWizardStepQueryParams(): {
  sectionId: string | null | undefined
  setWizardStepQueryParamState: (state: WizardStepQueryParams) => void
} {
  const { sectionId } = useQueryParams<WizardStepQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<WizardStepQueryParams>()
  const setWizardStepQueryParamState = (state: WizardStepQueryParams): void => {
    updateQueryParams({ sectionId: state.sectionId }, { skipNulls: true })
  }

  return { sectionId, setWizardStepQueryParamState }
}

export function CDOnboardingProvider({
  queryParams,
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

  const [drawerData, setDrawerData] = React.useState<DrawerDataType>(initialDrawerData)

  const saveServiceData = React.useCallback((data: ServiceDataType) => {
    dispatch(CDOnboardingContextActions.updateService({ service: data }))
  }, [])

  const saveEnvironmentData = React.useCallback((data: EnvironmentRequestDTO) => {
    dispatch(CDOnboardingContextActions.updateEnvironment({ environment: data }))
  }, [])

  const saveInfrastructureData = React.useCallback((data: InfrastructureDataType) => {
    dispatch(CDOnboardingContextActions.updateInfrastructure({ infrastructure: data }))
  }, [])

  const saveDelegateData = React.useCallback((data: DelegateDataType) => {
    dispatch(CDOnboardingContextActions.updateDelegate({ delegate: data }))
  }, [])

  const saveRepositoryData = React.useCallback((data: RepositoryInterface) => {
    dispatch(CDOnboardingContextActions.UpdateRepository({ repository: data }))
  }, [])

  const saveClusterData = React.useCallback((data: ClusterInterface) => {
    dispatch(CDOnboardingContextActions.UpdateCluster({ cluster: data }))
  }, [])

  const saveApplicationData = React.useCallback((data: Servicev1Application) => {
    dispatch(CDOnboardingContextActions.updateApplication({ application: data }))
  }, [])

  const saveAgentData = React.useCallback((data: V1Agent) => {
    dispatch(CDOnboardingContextActions.updateAgent({ agent: data }))
  }, [])

  return (
    <CDOnboardingContext.Provider
      value={{
        state,
        saveClusterData,
        saveRepositoryData,
        saveApplicationData,
        saveAgentData,
        saveServiceData,
        saveEnvironmentData,
        saveInfrastructureData,
        saveDelegateData,
        drawerData,
        setDrawerData
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
