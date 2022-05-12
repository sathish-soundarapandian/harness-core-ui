/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  getErrorInfoFromErrorObject,
  Icon,
  IconName,
  Layout,
  Text,
  useToaster
} from '@harness/uicore'

import cx from 'classnames'
import type { Column, CellProps, Renderer } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { Classes, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  CCMNotificationSetting,
  CCMPerspectiveNotificationChannelsDTO,
  useDeleteNotificationSettings,
  useListNotificationSettings
} from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { channelImgMap } from '@ce/constants'
import { PAGE_NAMES } from '@ce/TrackingEventsConstants'
import useAnomaliesAlertDialog from '../AnomaliesAlert/AnomaliesAlertDialog'
import Table from '../PerspectiveReportsAndBudget/Table'
import css from './AnomaliesSettings.module.scss'

interface SettingsDrawerProps {
  hideDrawer: () => void
}

const AlertsSection = () => {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [isRefetching, setRefetchingState] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<CCMNotificationSetting>({ perspectiveId: '', channels: [] })
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog({
    setRefetchingState: setRefetchingState,
    selectedAlert: selectedAlert as unknown as CCMPerspectiveNotificationChannelsDTO,
    source: PAGE_NAMES.ANOMALY_SETTINGS_FLOW
  })

  const {
    data: notificationsList,
    loading,
    refetch: fetchNotificationList
  } = useListNotificationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteNotificationAlert } = useDeleteNotificationSettings({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  useEffect(() => {
    if (isRefetching) {
      fetchNotificationList()
      setRefetchingState(false)
    }
  }, [fetchNotificationList, isRefetching])

  useEffect(() => {
    if (selectedAlert && selectedAlert.perspectiveId) {
      openAnomaliesAlertModal()
    }
  }, [openAnomaliesAlertModal, selectedAlert])

  const deleteNotification = async (perspectiveId: string) => {
    try {
      const response = await deleteNotificationAlert(void 0, {
        queryParams: {
          accountIdentifier: accountId,
          perspectiveId: perspectiveId
        },
        headers: {
          'content-type': 'application/json'
        }
      })
      setRefetchingState(true)
      response && showSuccess(getString('ce.anomalyDetection.notificationAlerts.deleteAlertSuccessMsg'))
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }

  const onEdit = (notificationData: CCMNotificationSetting) => {
    setSelectedAlert(notificationData)
  }

  const actionCell: Renderer<CellProps<CCMNotificationSetting>> = ({ row }) => {
    const perspectiveId = row.original.perspectiveId || ''

    return (
      <Layout.Horizontal spacing="medium">
        <Icon name="Edit" size={16} color={Color.PRIMARY_6} onClick={() => onEdit(row.original)} className={css.icon} />
        <Icon
          name="main-trash"
          size={16}
          color={Color.PRIMARY_6}
          onClick={() => deleteNotification(perspectiveId)}
          className={css.icon}
        />
      </Layout.Horizontal>
    )
  }

  const ChannelsCell: Renderer<CellProps<CCMNotificationSetting>> = ({ row }) => {
    const channelsList = row.original.channels || []
    return (
      <Layout.Vertical spacing="medium">
        {channelsList.map((channel, index) => {
          const channelType = channel?.notificationChannelType || 'DEFAULT'
          const channelCount = channel.channelUrls?.length || 0
          const url = channel?.channelUrls?.[0]
          const hoverEmails = channel?.channelUrls?.slice(1)

          return (
            <Layout.Horizontal spacing="small" key={index}>
              <Icon name={channelImgMap[channelType] as IconName} size={16} />
              <Text
                font={{ variation: FontVariation.SMALL }}
                color={Color.GREY_800}
                lineClamp={1}
                inline
                style={{ maxWidth: 217 }}
              >
                {url}
              </Text>
              {channelCount > 1 ? (
                <Popover
                  popoverClassName={Classes.DARK}
                  position={Position.BOTTOM}
                  interactionKind={PopoverInteractionKind.HOVER}
                  content={
                    <div className={css.popoverContent}>
                      <ul>
                        {hoverEmails?.map((email, idx) => (
                          <li key={idx}>{email}</li>
                        ))}
                      </ul>
                    </div>
                  }
                >
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7}>
                    {`(+${channelCount - 1})`}
                  </Text>
                </Popover>
              ) : null}
            </Layout.Horizontal>
          )
        })}
      </Layout.Vertical>
    )
  }

  const PerspectiveNameCell: Renderer<CellProps<CCMPerspectiveNotificationChannelsDTO>> = ({ row }) => {
    const perspectiveName = row.original.perspectiveName
    const perspectiveId = row.original.perspectiveId

    return (
      <Link
        to={{
          pathname: routes.toPerspectiveDetails({
            accountId: accountId,
            perspectiveId: perspectiveId as string,
            perspectiveName: perspectiveName as string
          })
        }}
      >
        <Text font={{ variation: FontVariation.SMALL }} inline color={Color.PRIMARY_7}>
          {perspectiveName}
        </Text>
      </Link>
    )
  }

  const columns: Column<CCMPerspectiveNotificationChannelsDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('ce.anomalyDetection.settings.perspectiveNameColumn'),
        accessor: 'perspectiveName',
        Cell: PerspectiveNameCell,
        width: '42%'
      },
      {
        Header: getString('ce.anomalyDetection.tableHeaders.details'),
        width: '50%',
        Cell: ChannelsCell
      },
      {
        Header: ' ',
        Cell: actionCell,
        width: '8%'
      }
    ],
    []
  )

  const renderLoader = (): JSX.Element => {
    return (
      <Container className={css.loader} data-testid="loader">
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }

  return (
    <Container className={css.settingsContent} padding="large">
      <Text
        color={Color.PRIMARY_10}
        font={{ variation: FontVariation.H6 }}
        border={{ bottom: true, color: Color.GREY_200 }}
        padding={{ bottom: 'medium' }}
      >
        {getString('ce.anomalyDetection.settings.heading')}
      </Text>
      <Text
        color={Color.PRIMARY_10}
        font={{ variation: FontVariation.SMALL }}
        padding={{ bottom: 'large', top: 'medium' }}
      >
        {getString('ce.anomalyDetection.settings.subtext')}
      </Text>
      <Button
        text={getString('ce.anomalyDetection.settings.newAlertBtn')}
        icon="plus"
        onClick={() => openAnomaliesAlertModal()}
        variation={ButtonVariation.PRIMARY}
      />
      {loading && renderLoader()}
      {!loading && notificationsList?.data?.length ? (
        <Container className={css.tableView}>
          <Table<CCMPerspectiveNotificationChannelsDTO> columns={columns} data={notificationsList?.data} />
        </Container>
      ) : null}
    </Container>
  )
}

const AnomaliesSettings: React.FC<SettingsDrawerProps> = ({ hideDrawer }) => {
  const [activePanelId, setActivePanelId] = useState(1)
  const { getString } = useStrings()

  const updateActivePanel = (id: number) => {
    setActivePanelId(id)
  }

  return (
    <Layout.Horizontal className={css.container}>
      <AlertsSection />
      <Container className={css.settingsDrawer} background={Color.PRIMARY_8}>
        <Layout.Horizontal className={css.settingsLabelWarpper}>
          <Text font={{ variation: FontVariation.H6 }} className={css.tabContent} icon="nav-settings" padding="large">
            {getString('ce.anomalyDetection.settings.options.header')}
          </Text>
          <Icon name="cross" size={16} color={Color.WHITE} onClick={() => hideDrawer()} data-testid="closeDrawerIcon" />
        </Layout.Horizontal>
        <ul className={css.listingOptions}>
          <li className={cx(css.listOptionItem, activePanelId === 1 && css.listOptionItemSelected)}>
            <Text
              font={{ variation: FontVariation.H6 }}
              className={css.tabContent}
              onClick={() => updateActivePanel(1)}
            >
              {getString('ce.anomalyDetection.settings.heading')}
            </Text>
          </li>
        </ul>
      </Container>
    </Layout.Horizontal>
  )
}

export default AnomaliesSettings
