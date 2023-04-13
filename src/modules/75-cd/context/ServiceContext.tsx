/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import type { DeploymentMetaData, ServiceResponseDTO, ServiceYaml } from 'services/cd-ng'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export interface ServiceContextValues {
  serviceResponse: ServiceResponseDTO
  onCloseModal: () => void
  onServiceCreate: (serviceInfo: ServiceYaml) => void
  isServiceEntityModalView: boolean
  isServiceEntityPage: boolean
  isServiceCreateModalView: boolean
  serviceCacheKey: string
  selectedDeploymentType: ServiceDeploymentType
  gitOpsEnabled: boolean
  deploymentMetadata?: DeploymentMetaData
  isDeploymentTypeDisabled: boolean
  setIsDeploymentTypeDisabled?(status: boolean): void
  drawerOpen?: boolean
  setDrawerOpen?: (setOpen: boolean) => void
  notificationPopoverVisibility?: boolean
  setNotificationPopoverVisibility?: (setOpen: boolean) => void
}

export const ServiceContext = React.createContext<ServiceContextValues>({
  serviceResponse: {},
  onCloseModal: noop,
  onServiceCreate: noop,
  isServiceEntityModalView: false,
  isServiceEntityPage: false,
  isServiceCreateModalView: false,
  serviceCacheKey: '',
  selectedDeploymentType: '' as ServiceDeploymentType,
  gitOpsEnabled: false,
  deploymentMetadata: undefined,
  isDeploymentTypeDisabled: false,
  drawerOpen: false,
  notificationPopoverVisibility: false
})

export interface ServiceContextProviderProps extends ServiceContextValues {
  children: React.ReactNode
}

export function ServiceContextProvider(props: ServiceContextProviderProps): React.ReactElement {
  const { children, ...rest } = props
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const [notificationPopoverVisibility, setNotificationPopoverVisibility] = React.useState<boolean>(false)

  return (
    <ServiceContext.Provider
      value={{ ...rest, drawerOpen, setDrawerOpen, notificationPopoverVisibility, setNotificationPopoverVisibility }}
    >
      {children}
    </ServiceContext.Provider>
  )
}

export function useServiceContext(): ServiceContextValues {
  return React.useContext(ServiceContext)
}
