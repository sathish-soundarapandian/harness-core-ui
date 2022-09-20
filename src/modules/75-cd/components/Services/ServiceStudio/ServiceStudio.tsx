/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Layout, PageSpinner } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { ServiceDetailHeaderRef } from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader'
import { ServiceResponseDTO, useGetServiceV2 } from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ServiceContextProvider } from '@cd/context/ServiceContext'
import ServiceDetailsSummary from '@cd/components/ServiceDetails/ServiceDetailsContent/ServiceDetailsSummary'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import ServiceConfigurationWrapper from './ServiceConfigWrapper/ServiceConfigWrapper'

export interface ServiceHeaderRefetchRef {
  refetchData: () => void
}

function ServiceStudio(): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const refetch = useRef<ServiceHeaderRefetchRef>(null)

  const { data: serviceResponse, loading: serviceDataLoading } = useGetServiceV2({
    serviceIdentifier: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const invokeRefetch = (): void => {
    refetch.current?.refetchData?.()
  }

  if (serviceDataLoading) {
    return <PageSpinner />
  }

  return (
    <Layout.Vertical>
      <ServiceDetailHeaderRef ref={refetch} />
      <ServiceContextProvider
        serviceResponse={serviceResponse?.data?.service as ServiceResponseDTO}
        isServiceEntityModalView={false}
        onCloseModal={noop}
        onServiceCreate={noop}
        isServiceEntityPage={true}
        isServiceCreateModalView={false}
        serviceCacheKey={''}
        selectedDeploymentType={'' as ServiceDeploymentType}
        gitOpsEnabled={false}
      >
        <ServiceConfigurationWrapper
          summaryPanel={<ServiceDetailsSummary />}
          refercedByPanel={<EntitySetupUsage entityType={EntityType.Service} entityIdentifier={serviceId} />}
          invokeServiceHeaderRefetch={invokeRefetch}
        />
      </ServiceContextProvider>
    </Layout.Vertical>
  )
}

export default ServiceStudio
