/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text, Icon, Layout, Page, Toggle, TableV2, useToaster, NoDataCard, Popover } from '@harness/uicore'
import React, { useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import type { CellProps, Renderer } from 'react-table'
import cx from 'classnames'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import {
  AffectedEntity,
  DowntimeDuration,
  DowntimeListView,
  DowntimeStatusDetails,
  ResponsePageDowntimeListView,
  useDeleteDowntimeData,
  useEnablesDisablesDowntime,
  UseListDowntimesProps
} from 'services/cv'
import statusScheduled from '@cv/assets/statusScheduled.svg'
import emptyData from '@cv/assets/emptyData.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  getDowntimeCategoryLabel,
  getFormattedTime
} from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import DowntimeActions from './components/DowntimeActions/DowntimeActions'
import { getDowntimeStatusLabel, getDowntimeWindowInfo, getDuration, getIsSetPreviousPage } from './DowntimeList.utils'
import { DowntimeStatus } from '../../SLODowntimePage.types'
import { FiltersContext } from '../../FiltersContext'
import DowntimeFilters from '../DowntimeFilters/DowntimeFilters'
import css from './DowntimeList.module.scss'

interface DowntimeListProps {
  downtimeDataLoading: boolean
  downtimeData: ResponsePageDowntimeListView | null
  refetchDowntimes: (data: UseListDowntimesProps) => void
  downtimeError?: string
}

export const RenderServices = ({
  affectedEntities,
  serviceName,
  envName
}: {
  affectedEntities: AffectedEntity[]
  serviceName: string
  envName: string
}): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal flex>
      <Layout.Vertical>
        {serviceName === 'ALL' && envName === 'ALL' ? (
          <Text title={serviceName} className={css.firstLine}>
            {getString('cv.sloDowntime.allMonitoredServices')}
          </Text>
        ) : (
          <>
            <Text title={serviceName} className={cx(css.firstLine, css.affectedServices)}>
              {serviceName}
            </Text>
            <Text title={envName} font={{ size: 'small' }} className={css.affectedServices}>
              {envName}
            </Text>
          </>
        )}
      </Layout.Vertical>
      {affectedEntities.length > 1 && (
        <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          position={Position.BOTTOM_LEFT}
          className={Classes.DARK}
          content={
            <Container padding={'medium'} className={css.popover}>
              {affectedEntities.slice(1).map(entity => (
                <Layout.Vertical key={entity.monitoredServiceIdentifier}>
                  <Text color={Color.GREY_0}>{entity.serviceName}</Text>
                  <Text color={Color.GREY_400} font={{ size: 'small' }}>
                    {entity.envName}
                  </Text>
                </Layout.Vertical>
              ))}
            </Container>
          }
        >
          <Container padding={'small'} margin={{ right: 'xlarge' }} className={css.msBox}>
            +{affectedEntities.length - 1}
          </Container>
        </Popover>
      )}
    </Layout.Horizontal>
  )
}

const DowntimeList = ({
  downtimeDataLoading,
  downtimeData,
  refetchDowntimes,
  downtimeError
}: DowntimeListProps): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { showSuccess, showError } = useToaster()

  const { setPageNumber, queryParams, pathParams, appliedSearchAndFilter } = useContext(FiltersContext)

  const { mutate: deleteDowntime, loading: deleteDowntimeLoading } = useDeleteDowntimeData(pathParams)

  const { mutate: toggleDowntime, loading: toggleDowntimeLoading } = useEnablesDisablesDowntime({
    ...pathParams,
    identifier: ''
  })

  const {
    content,
    totalItems = 0,
    totalPages = 0,
    pageIndex = 0,
    pageItemCount = 0,
    pageSize = 10
  } = downtimeData?.data ?? {}

  const onEdit = (identifier: string): void => {
    history.push({
      pathname: routes.toCVEditSLODowntime({
        identifier,
        accountId,
        orgIdentifier,
        projectIdentifier,
        module: 'cv'
      })
    })
  }

  const onToggle = async (checked: boolean, identifier: string, name: string): Promise<void> => {
    try {
      await toggleDowntime(undefined, { pathParams: { ...pathParams, identifier }, queryParams: { enable: checked } })
      await Promise.resolve(refetchDowntimes({ ...pathParams, queryParams }))
      showSuccess(getString('cv.sloDowntime.downtimeToggle', { name, off: checked ? 'on' : 'off' }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const onDelete = async (identifier: string, name: string): Promise<void> => {
    try {
      await deleteDowntime(identifier)
      if (getIsSetPreviousPage(pageIndex, pageItemCount)) {
        setPageNumber(prevPageNumber => prevPageNumber - 1)
      } else {
        refetchDowntimes({ ...pathParams, queryParams })
      }
      showSuccess(getString('cv.slos.sloDeleted', { name }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const RenderTooltip = ({
    downtimeStatusDetails,
    timezone
  }: {
    downtimeStatusDetails: DowntimeStatusDetails
    timezone: string
  }): JSX.Element => {
    const { status, endTime = Date.now() / 1000 } = downtimeStatusDetails

    return (
      <Layout.Vertical padding={'medium'} spacing={'xsmall'} className={css.tooltip}>
        <Text>{getDowntimeStatusLabel(getString, status)}</Text>
        {status === DowntimeStatus.ACTIVE && (
          <Text>
            <span className={css.bolder}>{getString('cv.ends')}</span>{' '}
            {getFormattedTime({ time: endTime, timezone, format: 'LLLL' })} ({timezone})
          </Text>
        )}
      </Layout.Vertical>
    )
  }

  const RenderDowntimeToggle: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { enabled = true, name = '', identifier = '' } = downtime

    return <Toggle checked={enabled} onToggle={checked => onToggle(checked, identifier, name)} />
  }

  const RenderDowntimeStatus: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { downtimeStatusDetails = {} } = downtime
    const { status = DowntimeStatus.SCHEDULED } = downtimeStatusDetails || {}
    const { timezone = 'Asia/Calcutta' } = downtime?.spec?.spec || {}

    return (
      <Text
        flex
        tooltip={<RenderTooltip downtimeStatusDetails={downtimeStatusDetails} timezone={timezone} />}
        tooltipProps={{
          isDark: true,
          interactionKind: PopoverInteractionKind.HOVER,
          position: Position.BOTTOM_LEFT,
          usePortal: false
        }}
      >
        {status === DowntimeStatus.SCHEDULED ? (
          <img src={statusScheduled} className={css.statusIcon} />
        ) : (
          <Icon size={24} className={css.statusIcon} name="status-running" />
        )}
      </Text>
    )
  }

  const RenderDowntimeName: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { name = '' } = downtime

    return (
      <Text title={name} className={css.firstLine}>
        {name}
      </Text>
    )
  }

  const RenderDowntimeWindow: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { timeFrame, downtimeType } = getDowntimeWindowInfo(downtime, getString)

    return (
      <Layout.Vertical spacing={'xsmall'}>
        <Text title={timeFrame} className={css.windowFirstLine}>
          {timeFrame}
        </Text>
        <Text title={downtimeType} className={css.windowSecondLine}>
          {downtimeType}
        </Text>
      </Layout.Vertical>
    )
  }

  const RenderDowntimeDuration: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { duration = {} as DowntimeDuration } = downtime

    return <Text className={css.firstLine}>{getDuration(getString, duration)}</Text>
  }

  const RenderAffectedServices: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { affectedEntities = [] } = downtime
    const { serviceName, envName } = affectedEntities[0] || {}

    return <RenderServices affectedEntities={affectedEntities} serviceName={serviceName} envName={envName} />
  }

  const RenderDowntimeCategory: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { category = 'Other' } = downtime

    return (
      <Text title={category} className={css.firstLine}>
        {getDowntimeCategoryLabel(category, getString)}
      </Text>
    )
  }

  const RenderLastModifiedBy: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { lastModifiedBy = '', lastModifiedAt = 1 } = downtime?.lastModified || {}

    return (
      <Layout.Vertical>
        <Text title={lastModifiedBy} className={css.firstLine}>
          {lastModifiedBy}
        </Text>
        <Text className={css.secondLine}>{moment(lastModifiedAt).format('lll')}</Text>
      </Layout.Vertical>
    )
  }

  const RenderDowntimeActions: Renderer<CellProps<DowntimeListView>> = ({ row }) => {
    const downtime = row?.original
    const { identifier = '', name = '' } = downtime

    return (
      <DowntimeActions identifier={identifier} title={name} onDelete={onDelete} onEdit={(id: string) => onEdit(id)} />
    )
  }

  const columns = [
    {
      Header: '',
      id: 'downtimeToggle',
      width: '3.5%',
      Cell: RenderDowntimeToggle
    },
    {
      Header: getString('cv.slos.status'),
      width: '4%',
      Cell: RenderDowntimeStatus
    },
    {
      Header: getString('cv.sloDowntime.downtimeName').toUpperCase(),
      width: '14%',
      Cell: RenderDowntimeName
    },
    {
      Header: getString('cv.sloDowntime.downtimeWindow').toUpperCase(),
      width: '30%',
      Cell: RenderDowntimeWindow
    },
    {
      Header: getString('pipeline.duration').toUpperCase(),
      width: '7%',
      Cell: RenderDowntimeDuration
    },
    {
      Header: getString('cv.affectedServices').toUpperCase(),
      width: '13%',
      Cell: RenderAffectedServices
    },
    {
      Header: getString('cv.sloDowntime.category').toUpperCase(),
      width: '13%',
      Cell: RenderDowntimeCategory
    },
    {
      Header: getString('filestore.view.lastModifiedBy').toUpperCase(),
      width: '10%',
      Cell: RenderLastModifiedBy
    },
    {
      Header: '',
      id: 'downtimeActions',
      width: '5.5%',
      Cell: RenderDowntimeActions
    }
  ]

  return (
    <>
      <Container margin={'xlarge'} padding={{ left: 'small', right: 'small' }}>
        <DowntimeFilters listView />
        <Page.Body
          loading={deleteDowntimeLoading || toggleDowntimeLoading || downtimeDataLoading}
          error={downtimeError}
          retryOnError={() => refetchDowntimes({ ...pathParams, queryParams })}
          className={css.downtimeList}
        >
          {content?.length ? (
            <Container margin={{ top: 'large' }}>
              <TableV2
                sortable={false}
                columns={columns}
                data={content}
                pagination={{
                  pageSize,
                  pageIndex,
                  pageCount: totalPages,
                  itemCount: totalItems,
                  gotoPage: nextPage => {
                    setPageNumber(nextPage)
                  }
                }}
              />
            </Container>
          ) : (
            <NoDataCard
              image={emptyData}
              message={
                appliedSearchAndFilter
                  ? getString('common.filters.noMatchingFilterData')
                  : getString('cv.changeSource.noDataAvaiableForCard')
              }
            />
          )}
        </Page.Body>
      </Container>
    </>
  )
}

export default DowntimeList
