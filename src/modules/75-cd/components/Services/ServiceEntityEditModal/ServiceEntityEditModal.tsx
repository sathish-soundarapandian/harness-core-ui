/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { PageSpinner } from '@harness/uicore'
import type { ServiceResponseDTO } from 'services/cd-ng'
import ServiceConfigurationWrapper from '@cd/components/Services/ServiceStudio/ServiceConfigWrapper/ServiceConfigWrapper'
import { ServiceContextProvider } from '@cd/context/ServiceContext'

interface ServiceEntityEditModalProps {
  serviceResponse: ServiceResponseDTO
  onCloseModal: () => void
  isLoading: boolean
}
function ServiceEntityEditModal({
  serviceResponse,
  onCloseModal,
  isLoading
}: ServiceEntityEditModalProps): React.ReactElement {
  if (isLoading || isEmpty(serviceResponse)) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }
  return (
    <ServiceContextProvider
      serviceResponse={serviceResponse}
      isEditServiceModal={true}
      onCloseModal={onCloseModal}
      isServiceEntityPage={true}
    >
      <ServiceConfigurationWrapper />
    </ServiceContextProvider>
  )
}

export default ServiceEntityEditModal
