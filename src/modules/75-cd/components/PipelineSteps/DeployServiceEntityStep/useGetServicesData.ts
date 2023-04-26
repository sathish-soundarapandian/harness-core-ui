/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, useEffect, useCallback } from 'react'
import { defaultTo, get, isEmpty, isEqual, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster, shouldShowError } from '@harness/uicore'
import produce from 'immer'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type {
  DeploymentMetaData,
  JsonNode,
  ServiceDefinition,
  ServiceInputsMergedResponseDto,
  ServiceYaml
} from 'services/cd-ng'
import { useGetServiceAccessListQuery, useGetServicesYamlAndRuntimeInputsQuery } from 'services/cd-ng-rq'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ServiceData } from './DeployServiceEntityUtils'

export interface UseGetServicesDataProps {
  deploymentType: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  deploymentMetadata?: DeploymentMetaData
  serviceIdentifiers: string[]
  deploymentTemplateIdentifier?: string
  versionLabel?: string
  lazyService?: boolean
}

export interface UseGetServicesDataReturn {
  servicesList: ServiceYaml[]
  servicesData: ServiceData[]
  loadingServicesList: boolean
  updatingData: boolean
  loadingServicesData: boolean
  refetchServicesData(): void
  refetchListData(): void
  prependServiceToServiceList(newServiceInfo: ServiceYaml): void
  updateServiceInputsData(serviceId: string, mergedInputResponse?: ServiceInputsMergedResponseDto): void
  nonExistingServiceIdentifiers: string[]
}
// react-query staleTime
const STALE_TIME = 60 * 1000 * 15

export function useGetServicesData(props: UseGetServicesDataProps): UseGetServicesDataReturn {
  const {
    deploymentType,
    gitOpsEnabled,
    serviceIdentifiers,
    deploymentTemplateIdentifier,
    versionLabel,
    lazyService,
    deploymentMetadata
  } = props
  const [servicesList, setServicesList] = useState<ServiceYaml[]>([])
  const [servicesData, setServicesData] = useState<ServiceData[]>([])
  const [nonExistingServiceIdentifiers, setNonExistingServiceIdentifiers] = useState<string[]>([])
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()

  const {
    data: servicesListResponse,
    error,
    isInitialLoading: loadingServicesList,
    refetch: refetchListData
  } = useGetServiceAccessListQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        type: deploymentType as ServiceDefinition['type'],
        gitOpsEnabled,
        deploymentTemplateIdentifier,
        versionLabel,
        deploymentMetadataYaml: deploymentMetadata ? yamlStringify(deploymentMetadata) : undefined
      }
    },
    {
      staleTime: STALE_TIME,
      enabled: !lazyService
    }
  )

  const {
    data: servicesDataResponse,
    isInitialLoading: loadingServicesData,
    isFetching: updatingData,
    refetch: refetchServicesData
  } = useGetServicesYamlAndRuntimeInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: { serviceIdentifiers }
    },
    {
      enabled: !lazyService && serviceIdentifiers.length > 0,
      staleTime: STALE_TIME
    }
  )

  const updateServiceInputsData = useCallback(
    (serviceId: string, mergedServiceInputsDto: ServiceInputsMergedResponseDto) => {
      if (!isEmpty(mergedServiceInputsDto)) {
        const { mergedServiceInputsYaml, serviceYaml } = mergedServiceInputsDto
        const serviceInputs = yamlParse<JsonNode>(defaultTo(mergedServiceInputsYaml, ''))?.serviceInputs
        const service = yamlParse<Pick<ServiceData, 'service'>>(defaultTo(serviceYaml, '')).service
        service.yaml = defaultTo(serviceYaml, '')

        const updatedData = produce(servicesData, draft => {
          const serviceIndex = draft.findIndex(svc => svc.service.identifier === serviceId)
          const orgIdentifierFromService = get(draft[serviceIndex], 'service.orgIdentifier')
          const projectIdentifierFromService = get(draft[serviceIndex], 'service.projectIdentifier')
          set(draft[serviceIndex], 'serviceInputs', serviceInputs)
          set(draft[serviceIndex], 'service', {
            ...service,
            orgIdentifier: orgIdentifierFromService,
            projectIdentifier: projectIdentifierFromService
          })
        })

        setServicesData(updatedData)
      }
    },
    [servicesData]
  )
  const loading = loadingServicesList || loadingServicesData

  const prependServiceToServiceList = useCallback((newServiceInfo: ServiceYaml) => {
    setServicesList(data => [newServiceInfo, ...(data || [])])
  }, [])

  useEffect(() => {
    if (!loading) {
      let _servicesList: ServiceYaml[] = []
      let _servicesData: ServiceData[] = []

      /* istanbul ignore else */
      if (servicesListResponse?.data?.length) {
        _servicesList = servicesListResponse.data.map(service => ({
          identifier: defaultTo(service.service?.identifier, ''),
          name: defaultTo(service.service?.name, ''),
          description: service.service?.description,
          tags: service.service?.tags
        }))
      }

      /* istanbul ignore else */
      if (servicesDataResponse?.data?.serviceV2YamlMetadataList?.length) {
        _servicesData = servicesDataResponse.data.serviceV2YamlMetadataList.map(row => {
          const serviceYaml = defaultTo(row.serviceYaml, '{}')
          const service = yamlParse<Pick<ServiceData, 'service'>>(serviceYaml).service
          service.yaml = serviceYaml
          set(service, 'orgIdentifier', row.orgIdentifier)
          set(service, 'projectIdentifier', row.projectIdentifier)
          const serviceInputs = yamlParse<Pick<ServiceData, 'serviceInputs'>>(
            defaultTo(row.inputSetTemplateYaml, '{}')
          ).serviceInputs

          /* istanbul ignore else */
          if (service) {
            const existsInList = _servicesList.find(svc => svc.identifier === row.serviceIdentifier)

            if (!existsInList) {
              _servicesList.unshift(service)
            }
          }

          return { service, serviceInputs }
        })
      }

      setServicesList(_servicesList)
      setServicesData(_servicesData)

      const serviceListIdentifiers = _servicesData.map(svcInList => getScopedValueFromDTO(svcInList.service))
      const _nonExistingServiceIdentifiers = serviceIdentifiers.filter(
        svcInList => serviceListIdentifiers.indexOf(svcInList) === -1
      )
      if (!isEqual(_nonExistingServiceIdentifiers, nonExistingServiceIdentifiers) && !lazyService) {
        setNonExistingServiceIdentifiers(_nonExistingServiceIdentifiers)
      }
    }
  }, [loading, servicesListResponse?.data, servicesDataResponse?.data?.serviceV2YamlMetadataList])

  useEffect(() => {
    /* istanbul ignore else */
    if (error?.message) {
      if (shouldShowError(error)) {
        showError(getRBACErrorMessage(error as any))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return {
    servicesData,
    servicesList,
    updatingData,
    loadingServicesData,
    loadingServicesList,
    refetchServicesData,
    refetchListData,
    prependServiceToServiceList,
    updateServiceInputsData,
    nonExistingServiceIdentifiers
  }
}
