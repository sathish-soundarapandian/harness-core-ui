/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster, Views } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetServiceDependencyGraph, useSetHealthMonitoringFlag, useDeleteMonitoredService } from 'services/cv'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getDependencyData } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import { getCVMonitoringServicesSearchParam, getErrorMessage } from '@cv/utils/CommonUtils'
import { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import PageView from './views/PageView'
import CardView from './views/CardView'
import type { ServiceDependencyGraphProps, ServicePoint } from './ServiceDependencyGraph.types'

const ServiceDependencyGraph: React.FC<ServiceDependencyGraphProps> = ({
  isPageView,
  monitoredServiceIdentifier,
  environmentIdentifier,
  selectedFilter,
  onFilter,
  createButton,
  serviceCountData,
  serviceCountLoading,
  serviceCountErrorMessage,
  refetchServiceCountData
}) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const pathParams = { accountId, orgIdentifier, projectIdentifier }

  const [point, setPoint] = useState<ServicePoint>()

  useEffect(() => {
    point?.destroySticky()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier])

  const {
    data: serviceDependencyGraphData,
    loading: serviceDependencyGraphLoading,
    refetch: refetchServiceDependencyGraphData,
    error: serviceDependencyGraphError
  } = useGetServiceDependencyGraph({
    queryParams: {
      ...pathParams,
      environmentIdentifier,
      monitoredServiceIdentifier,
      servicesAtRiskFilter: selectedFilter === FilterTypes.RISK
    }
  })

  const { mutate: setHealthMonitoringFlag, loading: healthMonitoringFlagLoading } = useSetHealthMonitoringFlag({
    identifier: ''
  })

  const onToggleService = async (id: string, checked: boolean): Promise<void> => {
    point?.destroySticky()

    try {
      const response = await setHealthMonitoringFlag(undefined, {
        pathParams: {
          identifier: id
        },
        queryParams: {
          enable: checked,
          ...pathParams
        }
      })

      await Promise.all([refetchServiceDependencyGraphData(), refetchServiceCountData?.()])

      const enabled = response.resource?.healthMonitoringEnabled

      showSuccess(
        getString('cv.monitoredServices.monitoredServiceToggle', { enabled: enabled ? 'enabled' : 'disabled' })
      )
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const { mutate: deleteMonitoredService, loading: deleteMonitoredServiceLoading } = useDeleteMonitoredService({
    queryParams: pathParams
  })

  const onDeleteService = async (id: string): Promise<void> => {
    point?.destroySticky()

    try {
      await deleteMonitoredService(id)

      await Promise.all([refetchServiceDependencyGraphData(), refetchServiceCountData?.()])

      if (id === identifier) {
        history.push({
          pathname: routes.toCVMonitoringServices({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module: 'cv'
          }),
          search: getCVMonitoringServicesSearchParam({ view })
        })
      }

      showSuccess(getString('cv.monitoredServices.monitoredServiceDeleted'))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const monitoredServiceDependencyData = useMemo(
    () => getDependencyData(serviceDependencyGraphData),
    [serviceDependencyGraphData]
  )

  const loading = serviceDependencyGraphLoading || healthMonitoringFlagLoading || deleteMonitoredServiceLoading

  if (isPageView) {
    return (
      <PageView
        point={point}
        setPoint={setPoint}
        loading={loading || serviceCountLoading}
        errorMessage={serviceCountErrorMessage || getErrorMessage(serviceDependencyGraphError)}
        retryOnError={() => {
          if (serviceCountErrorMessage) {
            refetchServiceCountData?.()
          }
          if (serviceDependencyGraphError) {
            refetchServiceDependencyGraphData()
          }
        }}
        monitoredServiceDependencyData={monitoredServiceDependencyData}
        onToggleService={onToggleService}
        onDeleteService={onDeleteService}
        selectedFilter={selectedFilter}
        onFilter={onFilter}
        serviceCountData={serviceCountData}
        createButton={createButton}
      />
    )
  }

  return (
    <CardView
      point={point}
      setPoint={setPoint}
      loading={loading}
      errorMessage={getErrorMessage(serviceDependencyGraphError)}
      retryOnError={refetchServiceDependencyGraphData}
      monitoredServiceDependencyData={monitoredServiceDependencyData}
      onToggleService={onToggleService}
      onDeleteService={onDeleteService}
    />
  )
}

export default ServiceDependencyGraph
