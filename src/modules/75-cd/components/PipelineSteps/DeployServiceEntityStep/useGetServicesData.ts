/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, useEffect, useCallback } from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster, shouldShowError } from '@harness/uicore'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import {
  ServiceDefinition,
  ServiceYaml,
  useGetServiceAccessList,
  useGetServicesYamlAndRuntimeInputs
} from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import type { ServiceData } from './DeployServiceEntityUtils'

export interface UseGetServicesDataProps {
  deploymentType: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  serviceIdentifiers: string[]
  deploymentTemplateIdentifier?: string
  versionLabel?: string
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
}

export function useGetServicesData(props: UseGetServicesDataProps): UseGetServicesDataReturn {
  const { deploymentType, gitOpsEnabled, serviceIdentifiers, deploymentTemplateIdentifier, versionLabel } = props
  const [servicesList, setServicesList] = useState<ServiceYaml[]>([])
  const [servicesData, setServicesData] = useState<ServiceData[]>([])
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()

  const {
    data: servicesListResponse,
    error,
    loading: loadingServicesList,
    refetch: refetchListData
  } = useGetServiceAccessList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: deploymentType as ServiceDefinition['type'],
      gitOpsEnabled,
      deploymentTemplateIdentifier,
      versionLabel
    }
  })

  const {
    data: servicesDataResponse,
    initLoading: loadingServicesData,
    loading: updatingData,
    refetch: refetchServicesData
  } = useMutateAsGet(useGetServicesYamlAndRuntimeInputs, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: { serviceIdentifiers },
    lazy: serviceIdentifiers.length === 0
  })

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
    }
  }, [loading, servicesListResponse?.data, servicesDataResponse?.data?.serviceV2YamlMetadataList])

  useEffect(() => {
    /* istanbul ignore else */
    if (error?.message) {
      if (shouldShowError(error)) {
        showError(getRBACErrorMessage(error))
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
    prependServiceToServiceList
  }
}
