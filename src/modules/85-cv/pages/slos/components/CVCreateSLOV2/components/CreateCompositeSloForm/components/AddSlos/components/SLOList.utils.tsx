/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Color, Checkbox } from '@harness/uicore'
import type { Renderer, CellProps, Row } from 'react-table'
import type { ServiceLevelObjectiveDetailsDTO, SLOHealthListView } from 'services/cv'
import css from './SLOList.module.scss'

export const getUpdatedSLOObjectives = (
  selectedSlos: SLOHealthListView[],
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveDetailsDTO[] => {
  const selectedSlosLength = selectedSlos.length
  const weight = Number(100 / selectedSlosLength).toFixed(1)
  const lastWeight = Number(100 - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
  const updatedSLOObjective = selectedSlos.map((item, index) => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceLevelObjectiveRef: item?.sloIdentifier,
      weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight),
      ...item
    }
  })
  return updatedSLOObjective
}

export const RenderSLOName: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  const { name = '', description = '' } = slo

  return (
    <>
      <Text color={Color.PRIMARY_7} title={name} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
        {name}
      </Text>
      <Text title={name} font={{ align: 'left', size: 'small' }}>
        {description}
      </Text>
    </>
  )
}

export const RenderMonitoredService: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  const { serviceName = '', environmentIdentifier = '' } = slo

  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <>
        <Text
          color={Color.PRIMARY_7}
          className={css.titleInSloTable}
          title={serviceName}
          font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
        >
          {serviceName}
        </Text>
      </>
      <>
        <Text color={Color.PRIMARY_7} title={environmentIdentifier} font={{ align: 'left', size: 'xsmall' }}>
          {environmentIdentifier}
        </Text>
      </>
    </Layout.Vertical>
  )
}

export const RenderUserJourney: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  const { userJourneys = [] } = slo || {}
  return userJourneys?.map(userJourney => (
    <Text
      key={userJourney.identifier}
      className={css.titleInSloTable}
      title={userJourney.name}
      font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
    >
      {userJourney.name}
    </Text>
  ))
}

export const RenderTags: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  const { tags = {} } = slo
  const tagsString = Object.keys(tags).join(' ')
  return (
    <Text
      className={css.titleInSloTable}
      title={tagsString}
      font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
    >
      {tagsString}
    </Text>
  )
}

export const RenderTarget: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  return (
    <Text
      className={css.titleInSloTable}
      title={` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
      font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
    >
      {` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
    </Text>
  )
}

export const RenderSLIType: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.sliType}
    </Text>
  )
}

export const onSelectCheckBox = (
  checked: boolean,
  slo: SLOHealthListView,
  selectedSlos: SLOHealthListView[],
  setSelectedSlos: React.Dispatch<React.SetStateAction<SLOHealthListView[]>>
): void => {
  const clonedSelectedSlos = [...selectedSlos]
  if (checked) {
    clonedSelectedSlos.push(slo)
    setSelectedSlos(clonedSelectedSlos)
  } else {
    setSelectedSlos(clonedSelectedSlos.filter(item => item.name !== slo.name))
  }
}

interface RenderCheckBoxesInterface {
  row: Row<SLOHealthListView>
  selectedSlos: SLOHealthListView[]
  setSelectedSlos: React.Dispatch<React.SetStateAction<SLOHealthListView[]>>
}

export const RenderCheckBoxes = ({ row, selectedSlos, setSelectedSlos }: RenderCheckBoxesInterface) => {
  const sloData = row.original
  const isChecked = Boolean([...selectedSlos].find(item => item.name === sloData.name))
  return (
    <Checkbox
      checked={isChecked}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        onSelectCheckBox(event.currentTarget.checked, sloData, selectedSlos, setSelectedSlos)
      }}
    />
  )
}

export const resetSLOWeightage = (
  selectedSlos: ServiceLevelObjectiveDetailsDTO[],
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveDetailsDTO[] => {
  const selectedSlosLength = selectedSlos.length
  const weight = Number(100 / selectedSlosLength).toFixed(1)
  const lastWeight = Number(100 - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
  const updatedSLOObjective = selectedSlos.map((item, index) => {
    return {
      ...item,
      accountId,
      orgIdentifier,
      projectIdentifier,
      weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight)
    }
  })
  return updatedSLOObjective
}
