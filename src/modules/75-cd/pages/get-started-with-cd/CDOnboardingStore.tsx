/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, merge } from 'lodash-es'
import React from 'react'
import {
  EnvironmentResponseDTO,
  getServiceV2Promise,
  GetServiceV2QueryParams,
  ServiceResponseDTO
} from 'services/cd-ng'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import {
  ActionReturnType,
  CDOnboardingContextActions,
  CDOnboardingReducer,
  CDOnboardingReducerState,
  initialState
} from './CDOnboardingActions'
import { newServiceState as initialServiceState } from './cdOnboardingUtils'

interface FetchServiceBoundProps {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetServiceV2QueryParams
  serviceIdentifier: string
}

interface FetchServiceUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
}

export interface CDOnboardingContextInterface {
  state: CDOnboardingReducerState
  fetchService: (args: FetchServiceUnboundProps) => Promise<void>
  saveServiceData: any
  saveEnvironmentData: any
  saveInfrastructureData: any
}

export const CDOnboardingContext = React.createContext<CDOnboardingContextInterface>({
  state: initialState,
  fetchService: () => new Promise<void>(() => undefined),
  saveServiceData: () => new Promise<void>(() => undefined),
  saveEnvironmentData: () => new Promise<void>(() => undefined),
  saveInfrastructureData: () => new Promise<void>(() => undefined)
})

export interface CDOnboardingProviderProps {
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  serviceIdentifier: string
}

const getServiceByIdentifier = (
  queryParams: GetServiceV2QueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<ServiceResponseDTO> => {
  return getServiceV2Promise(
    {
      queryParams,
      serviceIdentifier: identifier
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data?.service) {
        return response.data?.service
      }
      throw new Error()
    })
    .catch(error => {
      throw new Error(error)
    })
}

export function CDOnboardingProvider({
  queryParams,
  pipelineIdentifier,
  serviceIdentifier,
  children
}: React.PropsWithChildren<CDOnboardingProviderProps>): React.ReactElement {
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
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

  const _fetchService = async (props: FetchServiceBoundProps, params: FetchServiceUnboundProps): Promise<void> => {
    const { serviceIdentifier: identifier } = props
    const { forceFetch = false, forceUpdate = false, signal } = params

    dispatch(CDOnboardingContextActions.fetching())
    if (forceFetch && forceUpdate) {
      const serviceDetails: ServiceResponseDTO = await getServiceByIdentifier(
        { ...queryParams, ...(repoIdentifier && branch ? { repoIdentifier, branch } : {}) },
        identifier,
        signal
      )
      const serviceYaml = yamlParse(defaultTo(serviceDetails.yaml, ''))
      const serviceData = merge(serviceYaml, initialServiceState)

      dispatch(
        CDOnboardingContextActions.updateService({
          service: serviceData,
          isUpdated: false,
          environment: undefined
        })
      )
      dispatch(
        CDOnboardingContextActions.success({
          error: '',
          service: serviceData,
          isUpdated: false,
          environment: undefined
        })
      )
    }
  }
  const saveServiceData = (serviceObj: { service: any; serviceResponse: ServiceResponseDTO }): any => {
    dispatch(
      CDOnboardingContextActions.updateService({
        service: serviceObj.service,
        serviceResponse: serviceObj.serviceResponse
      })
    )
  }

  const saveEnvironmentData = (envObj: { environment: any; environmentResponse: EnvironmentResponseDTO }): any => {
    dispatch(
      CDOnboardingContextActions.updateEnvironment({
        environment: envObj.environment,
        environmentResponse: envObj.environmentResponse
      })
    )
  }

  const saveInfrastructureData = (infraObj: { infrastructure: any }): any => {
    dispatch(
      CDOnboardingContextActions.updateInfrastructure({
        infrastructure: infraObj.infrastructure
      })
    )
  }

  const fetchService = _fetchService.bind(null, {
    dispatch,
    queryParams,
    serviceIdentifier
  })

  return (
    <CDOnboardingContext.Provider
      value={{
        state,
        fetchService,
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
