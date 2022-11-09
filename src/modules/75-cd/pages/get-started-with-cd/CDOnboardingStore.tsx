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
import {
  CDOnboardingContextActions,
  CDOnboardingReducer,
  CDOnboardingReducerState,
  initialState
} from './CDOnboardingActions'
import { DelegateDataType, DrawerMode, InfrastructureDataType, ServiceDataType } from './CDOnboardingUtils'

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
  saveInfrastructureData: (data: InfrastructureDataType) => void
  saveDelegateData: (data: DelegateDataType) => void
  setSelectedSectionId: (selectionState: string) => void
  updateSelectionState: (selectionState: string) => void
}
const initialDrawerData = { fileContent: undefined, mode: DrawerMode.Preview }

export const CDOnboardingContext = React.createContext<CDOnboardingContextInterface>({
  state: initialState,
  drawerData: initialDrawerData,
  setDrawerData: noop,
  saveServiceData: () => new Promise<void>(() => undefined),
  saveEnvironmentData: () => new Promise<void>(() => undefined),
  saveInfrastructureData: () => new Promise<void>(() => undefined),
  saveDelegateData: () => new Promise<void>(() => undefined),
  updateSelectionState: (_selectionState: string) => undefined,
  setSelectedSectionId: (_selectionState: string) => undefined
})

export interface CDOnboardingProviderProps {
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  serviceIdentifier: string
}

export function useWizardStepQueryParams() {
  const { sectionId } = useQueryParams<WizardStepQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<WizardStepQueryParams>()
  const setWizardStepQueryParamState = (state: WizardStepQueryParams) => {
    updateQueryParams({ sectionId: state.sectionId }, { skipNulls: true })
  }

  return { sectionId, setWizardStepQueryParamState }
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

  const [drawerData, setDrawerData] = React.useState<DrawerDataType>(initialDrawerData)

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

  const saveDelegateData = React.useCallback((data: DelegateDataType) => {
    dispatch(CDOnboardingContextActions.updateDelegate({ delegate: data }))
  }, [])

  const queryParamStateSelection = useWizardStepQueryParams()
  const setSelectedSectionId = (selectedSectionId: string): void => {
    queryParamStateSelection.setWizardStepQueryParamState({ sectionId: selectedSectionId })
  }

  const updateSelectionState = (selectedSectionId: string): void => {
    dispatch(CDOnboardingContextActions.updateSectionId({ selectedSectionId }))
  }

  React.useEffect(() => {
    updateSelectionState(queryParamStateSelection.sectionId as string)
  }, [queryParamStateSelection.sectionId])

  return (
    <CDOnboardingContext.Provider
      value={{
        state,
        saveServiceData,
        saveEnvironmentData,
        saveInfrastructureData,
        saveDelegateData,
        setSelectedSectionId,
        updateSelectionState,
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
