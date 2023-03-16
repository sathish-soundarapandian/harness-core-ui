/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Checkbox, MultiSelectOption, Text } from '@harness/uicore'
import type { CellProps, Renderer, Row } from 'react-table'
import { isEmpty } from 'lodash-es'
import type {
  EnvironmentResponse,
  MonitoredServiceDetail,
  MonitoredServiceListItemDTO,
  ResponseListEnvironmentResponse
} from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'

export const getMonitoredServiceDetail = (msListItemDTO: MonitoredServiceListItemDTO): MonitoredServiceDetail => {
  const { identifier, name, serviceName, serviceRef, environmentName, environmentRef } = msListItemDTO
  return {
    monitoredServiceIdentifier: identifier,
    monitoredServiceName: name,
    serviceName,
    serviceIdentifier: serviceRef,
    environmentName,
    environmentIdentifier: environmentRef
  }
}

export const getEnvironmentOptions = (
  environmentDataList: ResponseListEnvironmentResponse | null,
  loading: boolean,
  getString: UseStringsReturn['getString']
): MultiSelectOption[] => {
  if (loading) {
    return [{ label: getString('loading'), value: 'loading' }]
  }
  if (environmentDataList?.data?.length) {
    const environmentSelectOption = environmentDataList?.data?.map((environmentData: EnvironmentResponse) => {
      const { name = '', identifier = '' } = environmentData?.environment || {}
      return {
        label: name,
        value: identifier
      }
    })
    return environmentSelectOption
  }
  return []
}

export const RenderMSName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const msListItemDTO = row.original
  const { serviceName = '' } = msListItemDTO

  return (
    <Text title={serviceName} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {serviceName}
    </Text>
  )
}

export const RenderEnvironmentName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const msListItemDTO = row.original
  const { environmentName = '' } = msListItemDTO

  return (
    <Text title={environmentName} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {environmentName}
    </Text>
  )
}

export const RenderTags: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const msListItemDTO = row.original
  const { tags = {} } = msListItemDTO
  const tagsString = Object.keys(tags).join(', ')

  return (
    <Text title={tagsString} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {!isEmpty(tags) ? tagsString : '-'}
    </Text>
  )
}

export const RenderSLOsAssigned: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const msListItemDTO = row.original
  const { sloHealthIndicators = [] } = msListItemDTO
  return (
    <Text title={'SLOs assigned'} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {sloHealthIndicators.length}
    </Text>
  )
}

export const onSelectCheckBox = (
  checked: boolean,
  monitoredService: MonitoredServiceListItemDTO,
  selectedMSs: MonitoredServiceDetail[],
  setSelectedMSs: React.Dispatch<React.SetStateAction<MonitoredServiceDetail[]>>
): void => {
  const clonedSelectedMSs = [...selectedMSs]
  if (checked) {
    clonedSelectedMSs.push(getMonitoredServiceDetail(monitoredService))
    setSelectedMSs(clonedSelectedMSs)
  } else {
    setSelectedMSs(clonedSelectedMSs.filter(item => item.monitoredServiceIdentifier !== monitoredService.identifier))
  }
}

interface RenderCheckBoxesInterface {
  row: Row<MonitoredServiceListItemDTO>
  selectedMSs: MonitoredServiceDetail[]
  setSelectedMSs: React.Dispatch<React.SetStateAction<MonitoredServiceDetail[]>>
}

export const RenderCheckBoxes = ({ row, selectedMSs, setSelectedMSs }: RenderCheckBoxesInterface) => {
  const msListItemDTO = row.original
  const isChecked = selectedMSs.some(item => item.monitoredServiceIdentifier === msListItemDTO.identifier)
  return (
    <Checkbox
      checked={isChecked}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        onSelectCheckBox(event.currentTarget.checked, msListItemDTO, selectedMSs, setSelectedMSs)
      }}
    />
  )
}

export const getIsSelectAllChecked = (
  msList: MonitoredServiceListItemDTO[],
  selectedMSs: MonitoredServiceDetail[]
): boolean => {
  const listOfMSIdsOnPage = msList?.map(item => item.identifier)
  const selectedMSsOnPage = selectedMSs.filter(item => listOfMSIdsOnPage?.includes(item.monitoredServiceIdentifier))
  return listOfMSIdsOnPage?.length === selectedMSsOnPage.length
}

export const getIsIntermediate = (
  msList: MonitoredServiceListItemDTO[],
  selectedMSs: MonitoredServiceDetail[]
): boolean => {
  const listOfMSIdsOnPage = msList?.map(item => item.identifier)
  const selectedMSsOnPage = selectedMSs.filter(item => listOfMSIdsOnPage?.includes(item.monitoredServiceIdentifier))
  return Boolean(selectedMSsOnPage.length) && selectedMSsOnPage?.length < (listOfMSIdsOnPage?.length ?? 0)
}
