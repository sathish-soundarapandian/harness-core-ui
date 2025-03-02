/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Layout, Text, Checkbox } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Renderer, CellProps, Row } from 'react-table'
import {
  getSLOIdentifierWithOrgAndProject,
  getSLORefIdWithOrgAndProject
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import type { SLOObjective } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ServiceLevelObjectiveDetailsDTO, SLOConsumptionBreakdown, SLOHealthListView } from 'services/cv'
import css from './SLOList.module.scss'

export const getUpdatedSLOObjectives = (
  selectedSlos: SLOHealthListView[],
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveDetailsDTO[] => {
  const selectedSlosLength = selectedSlos.length
  const weight = Number(100 / selectedSlosLength).toFixed(1)
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const lastWeight = Number(100 - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
  const updatedSLOObjective = selectedSlos.map((item, index) => {
    const orgAndProjectIdentifiers = {
      orgIdentifier: isAccountLevel ? defaultTo(item?.projectParams?.orgIdentifier, '') : orgIdentifier,
      projectIdentifier: isAccountLevel ? defaultTo(item?.projectParams?.projectIdentifier, '') : projectIdentifier
    }
    return {
      accountId,
      ...orgAndProjectIdentifiers,
      serviceLevelObjectiveRef: item?.sloIdentifier,
      ...item,
      weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight)
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
          className={css.titleInSloTable}
          title={serviceName}
          font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
        >
          {serviceName}
        </Text>
      </>
      <>
        <Text title={environmentIdentifier} font={{ align: 'left', size: 'xsmall' }}>
          {environmentIdentifier}
        </Text>
      </>
    </Layout.Vertical>
  )
}

export const RenderUserJourney: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
  const slo = row.original
  const { userJourneys = [] } = slo || {}
  return userJourneys?.map(userJourney => {
    const { name, identifier } = userJourney
    return (
      <Text
        key={identifier}
        className={css.titleInSloTable}
        title={name}
        font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      >
        {name || identifier}
      </Text>
    )
  })
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

export const RenderSLIType: Renderer<CellProps<SLOHealthListView | SLOConsumptionBreakdown>> = ({ row }) => {
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
  setSelectedSlos: React.Dispatch<React.SetStateAction<SLOHealthListView[]>>,
  isAccountLevel?: boolean
): void => {
  const clonedSelectedSlos = [...selectedSlos]
  if (checked) {
    clonedSelectedSlos.push(slo)
    setSelectedSlos(clonedSelectedSlos)
  } else {
    setSelectedSlos(
      isAccountLevel
        ? clonedSelectedSlos.filter(
            item => getSLOIdentifierWithOrgAndProject(item) !== getSLOIdentifierWithOrgAndProject(slo)
          )
        : clonedSelectedSlos.filter(item => item.sloIdentifier !== slo.sloIdentifier)
    )
  }
}

interface RenderCheckBoxesInterface {
  row: Row<SLOHealthListView>
  selectedSlos: SLOHealthListView[]
  setSelectedSlos: React.Dispatch<React.SetStateAction<SLOHealthListView[]>>
  isAccountLevel?: boolean
  isChecked: boolean
}

export const RenderCheckBoxes = ({
  row,
  selectedSlos,
  setSelectedSlos,
  isAccountLevel,
  isChecked
}: RenderCheckBoxesInterface): JSX.Element => {
  const sloData = row.original
  return (
    <Checkbox
      checked={isChecked}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        onSelectCheckBox(event.currentTarget.checked, sloData, selectedSlos, setSelectedSlos, isAccountLevel)
      }}
    />
  )
}

export const getIsSelectAllChecked = (slosList: SLOHealthListView[], selectedSlos: SLOHealthListView[]): boolean => {
  const listOfSloIdsOnPage = slosList?.map(item => item.sloIdentifier)
  const selectedSlosOnPage = selectedSlos.filter(item => listOfSloIdsOnPage?.includes(item.sloIdentifier))
  return listOfSloIdsOnPage?.length === selectedSlosOnPage.length
}

export const getIsIntermediate = (slosList: SLOHealthListView[], selectedSlos: SLOHealthListView[]): boolean => {
  const listOfSloIdsOnPage = slosList?.map(item => item.sloIdentifier)
  const selectedSlosOnPage = selectedSlos.filter(item => listOfSloIdsOnPage?.includes(item.sloIdentifier))
  return Boolean(selectedSlosOnPage.length) && selectedSlosOnPage?.length < (listOfSloIdsOnPage?.length ?? 0)
}

export const getSelectedSLOsHaveRefIds = (
  isAccountLevel: boolean,
  content: SLOHealthListView[],
  serviceLevelObjectivesDetails: SLOObjective[]
): {
  selectedSlosOnPage: SLOHealthListView[]
  selectedSlosNotOnPage: SLOObjective[]
} => {
  const selectedSlosOnPage =
    (isAccountLevel
      ? content?.filter(item =>
          serviceLevelObjectivesDetails
            .map(details => getSLORefIdWithOrgAndProject(details))
            .includes(getSLOIdentifierWithOrgAndProject(item))
        )
      : content?.filter(item =>
          serviceLevelObjectivesDetails?.map(details => details.serviceLevelObjectiveRef).includes(item.sloIdentifier)
        )) || []
  const selectedSlosNotOnPage = isAccountLevel
    ? serviceLevelObjectivesDetails.filter(
        item =>
          !selectedSlosOnPage
            .map(slos => getSLOIdentifierWithOrgAndProject(slos))
            .includes(getSLORefIdWithOrgAndProject(item))
      )
    : serviceLevelObjectivesDetails.filter(
        item => !selectedSlosOnPage.map(slos => slos.sloIdentifier).includes(item.sloIdentifier || '')
      )
  return { selectedSlosOnPage, selectedSlosNotOnPage }
}

export const getSelectedSLOsHavingSLOIdentifier = (
  isAccountLevel: boolean,
  content: SLOHealthListView[],
  prvSelected: SLOHealthListView[]
): {
  selectedSlosNotOnPage: SLOHealthListView[]
  selectedSlosOnPage: SLOHealthListView[]
} => {
  const listOfSloIdsOnPage = isAccountLevel
    ? content?.map(item => getSLOIdentifierWithOrgAndProject(item))
    : content?.map(item => item.sloIdentifier)

  const selectedSlosNotOnPage = prvSelected.filter(
    item => !listOfSloIdsOnPage?.includes(isAccountLevel ? getSLOIdentifierWithOrgAndProject(item) : item.sloIdentifier)
  )
  const selectedSlosOnPage = prvSelected.filter(item =>
    listOfSloIdsOnPage?.includes(isAccountLevel ? getSLOIdentifierWithOrgAndProject(item) : item.sloIdentifier)
  )
  return { selectedSlosNotOnPage, selectedSlosOnPage }
}
