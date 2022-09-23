/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, ReactNode, useEffect } from 'react'
import cronstrue from 'cronstrue'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { Column, CellProps, Renderer } from 'react-table'
import {
  Button,
  Container,
  Text,
  Layout,
  Icon,
  FlexExpander,
  useToaster,
  ButtonSize,
  ButtonVariation,
  Link,
  getErrorInfoFromErrorObject,
  Card
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Popover, Position, Classes, PopoverInteractionKind, Collapse } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import { QlceViewFieldInputInput, ViewChartType, AlertThreshold } from 'services/ce/services'
import {
  CEView,
  CEReportSchedule,
  useGetReportSetting,
  useListBudgetsForPerspective,
  useDeleteBudget,
  useDeleteReportSetting,
  Budget,
  useGetNotificationSettings,
  CCMNotificationChannel,
  useDeleteNotificationSettings
} from 'services/ce'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'

import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_NAMES, USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useBooleanStatus } from '@common/hooks'
import Table from './Table'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import useCreateReportModal from './PerspectiveCreateReport'
import useBudgetModal from './PerspectiveCreateBudget'
import useAnomaliesAlertDialog from '../AnomaliesAlert/AnomaliesAlertDialog'
import css from './PerspectiveReportsAndBudgets.module.scss'

interface ListProps {
  grid: ReactNode
  buttonText: string
  hasData: boolean
  loading: boolean
  meta?: ReactNode
  showCreateButton?: boolean
  onButtonClick: () => void
}

interface TableActionsProps {
  onClickEdit: () => void
  onClickDelete: () => void
  className?: string
  canEdit?: boolean
  canDelete?: boolean
}

interface ReportsAndBudgetsProps {
  values?: CEView
  onPrevButtonClick: () => void
  onNext: () => void
}

interface SelectedAlertType {
  perspectiveId: string
  channels: CCMNotificationChannel[]
}

export interface UrlParams {
  perspectiveId: string
  accountId: string
}

const ReportsAndBudgets: React.FC<ReportsAndBudgetsProps> = ({ values, onPrevButtonClick, onNext }) => {
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(() => {
    return (values?.viewVisualization?.groupBy as QlceViewFieldInputInput) || DEFAULT_GROUP_BY
  })

  useEffect(() => {
    values?.viewVisualization?.groupBy && setGroupBy(values?.viewVisualization?.groupBy as QlceViewFieldInputInput)
  }, [values?.viewVisualization?.groupBy])

  const [chartType, setChartType] = useState<ViewChartType>(() => {
    return (values?.viewVisualization?.chartType as ViewChartType) || ViewChartType.StackedLineChart
  })

  const { getString } = useStrings()

  return (
    <Container className={css.mainContainer}>
      <Container className={css.innerContainer}>
        <Layout.Vertical
          spacing="medium"
          height="100%"
          padding={{
            left: 'large',
            right: 'xxlarge',
            bottom: 'xxlarge',
            top: 'large'
          }}
          style={{ overflowY: 'auto' }}
        >
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'large' }}>
            {getString('ce.perspectives.createPerspective.budgetsReportsAlerts')}
          </Text>
          <Budgets perspectiveName={values?.name || ''} />
          <ScheduledReports />
          <AnomalyAlerts />
          <FlexExpander />
          <Layout.Horizontal padding={{ top: 'medium' }} spacing="large">
            <Button icon="chevron-left" text={getString('previous')} onClick={onPrevButtonClick} />
            <Button intent="primary" icon="chevron-right" text={getString('next')} onClick={onNext} />
          </Layout.Horizontal>
        </Layout.Vertical>
        {values && (
          <PerspectiveBuilderPreview
            setGroupBy={(gBy: QlceViewFieldInputInput) => setGroupBy(gBy)}
            groupBy={groupBy}
            chartType={chartType}
            setChartType={(type: ViewChartType) => {
              setChartType(type)
            }}
            formValues={values}
          />
        )}
      </Container>
    </Container>
  )
}

const useFetchReports = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useGetReportSetting({
    accountIdentifier: accountId,
    queryParams: { perspectiveId }
  })
  return { reports: data?.data || [], loading, refetch }
}

export const ScheduledReports: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { trackEvent } = useTelemetry()
  const { reports, loading, refetch } = useFetchReports(accountId, perspectiveId)
  const { mutate: deleteReport } = useDeleteReportSetting({})
  const { openModal, hideModal } = useCreateReportModal({
    onSuccess: () => {
      trackEvent(USER_JOURNEY_EVENTS.PERSPECTIVE_REPORT_SCHEDULE_DONE, {})
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()

  const handleDelete = async (report: CEReportSchedule) => {
    try {
      const deleted = await deleteReport(accountId, {
        queryParams: { reportId: report?.uuid },
        headers: {
          'content-type': 'application/json'
        }
      })
      if (deleted) {
        showSuccess(
          getString('ce.perspectives.reports.reportDeletedTxt', {
            name: report.name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const columns: Column<CEReportSchedule>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.reports.reportName'),
        accessor: 'name',
        Cell: ReportName
      },
      {
        Header: getString('ce.perspectives.reports.frequency'),
        accessor: 'userCron',
        Cell: RenderReportFrequency
      },
      {
        Header: getString('ce.perspectives.reports.recipients'),
        accessor: 'recipients',
        Cell: ({ row }: CellProps<CEReportSchedule>) => {
          const recipients = [...(row.original.recipients || [])]
          return <RenderEmailAddresses emailAddresses={recipients} />
        }
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: CellProps<CEReportSchedule>) => (
          <RenderEditDeleteActions
            onClickEdit={() => openModal({ isEdit: true, selectedReport: row.original })}
            onClickDelete={() => handleDelete(row.original)}
          />
        )
      }
    ],
    []
  )

  const openCreateReportModal = () => {
    trackEvent(USER_JOURNEY_EVENTS.CREATE_PERSPECTIVE_ADD_NEW_REPORT, {})
    openModal()
  }

  const { state: isOpen, toggle: toggleCard } = useBooleanStatus()

  return (
    <Card className={cx(css.collapseCard, { [css.cardOpen]: isOpen })}>
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} onClick={toggleCard} className={css.chevron} />
        <Text color={isOpen ? Color.GREY_800 : Color.GREY_500} font={{ variation: FontVariation.H5 }}>
          {getString('ce.perspectives.reports.title', {
            count: reports.length || 0
          })}
        </Text>
        <FlexExpander />
        {reports.length ? (
          <Link
            onClick={openCreateReportModal}
            size={ButtonSize.SMALL}
            padding="none"
            margin="none"
            font={FontVariation.SMALL}
            variation={ButtonVariation.LINK}
            icon="plus"
            iconProps={{
              size: 10
            }}
          >
            {getString('ce.perspectives.reports.addReportSchedule')}
          </Link>
        ) : null}
      </Layout.Horizontal>
      <Collapse isOpen={isOpen} keepChildrenMounted>
        <Text
          padding={{ top: 'medium', bottom: 'medium' }}
          color={Color.GREY_800}
          font={{ variation: FontVariation.SMALL }}
        >
          {`${getString('ce.perspectives.reports.desc')} ${
            !reports.length ? getString('ce.perspectives.reports.msg') : ''
          }`}
        </Text>
        <List
          buttonText={getString('ce.perspectives.reports.createNew')}
          onButtonClick={openCreateReportModal}
          showCreateButton={!reports.length}
          hasData={!!reports.length}
          loading={loading}
          grid={<Table<CEReportSchedule> data={reports} columns={columns} />}
        />
      </Collapse>
    </Card>
  )
}

const useFetchBudget = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useListBudgetsForPerspective({
    queryParams: { accountIdentifier: accountId, perspectiveId: perspectiveId }
  })
  return { budgets: data?.data || [], loading, refetch }
}

export const Budgets = ({ perspectiveName }: { perspectiveName: string }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { mutate: deleteBudget } = useDeleteBudget({ queryParams: { accountIdentifier: accountId } })
  const { budgets, loading, refetch } = useFetchBudget(accountId, perspectiveId)
  const { trackEvent } = useTelemetry()
  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()
  const [canEdit, canDelete] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CCM_BUDGETS
      },
      permissions: [PermissionIdentifier.EDIT_CCM_BUDGET, PermissionIdentifier.DELETE_CCM_BUDGET]
    },
    []
  )

  const handleDeleteBudget: (budget: Budget) => void = async budget => {
    try {
      const deleted = await (budget?.uuid &&
        deleteBudget(budget.uuid, {
          headers: {
            'content-type': 'application/json'
          }
        }))
      if (deleted) {
        showSuccess(
          getString('ce.budgets.budgetDeletedTxt', {
            name: budget.name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const columns: Column<AlertThreshold>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.basedOn'),
        accessor: 'basedOn',
        Cell: RenderBasedOn
      },
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.percent'),
        accessor: 'percentage',
        Cell: RenderAlertThresholds
      },
      {
        Header: getString('ce.perspectives.reports.recipientLabel'),
        accessor: 'emailAddresses',
        Cell: ({ row }: CellProps<AlertThreshold>) => {
          const recipients = [...(row.original.emailAddresses || []), ...(row.original.slackWebhooks || [])] as string[]
          return <RenderEmailAddresses emailAddresses={recipients} />
        }
      }
    ],
    []
  )

  const renderMeta: (budget: Budget, index: number) => JSX.Element = (budget, index) => {
    const { budgetAmount = 0, growthRate } = budget

    return (
      <Container>
        <Text font={{ variation: FontVariation.H6 }}>
          {growthRate
            ? getString('ce.perspectives.budgets.budgetTextWithGrowthRate', {
                index: index + 1,
                amount: formatCost(budgetAmount),
                growth: growthRate
              })
            : getString('ce.perspectives.budgets.budgetText', {
                index: index + 1,
                amount: formatCost(budgetAmount)
              })}
        </Text>
      </Container>
    )
  }

  const renderGrid: (budget: Budget) => JSX.Element = budget => {
    const { alertThresholds = [] } = budget

    return (
      <Container>
        <Layout.Horizontal
          margin={{ top: 'large', bottom: 'medium' }}
          spacing="small"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
            {getString('ce.perspectives.budgets.sendAlerts')}
          </Text>
          <Container margin={{ right: 'large' }}>
            <RenderEditDeleteActions
              onClickEdit={() =>
                openModal({
                  perspectiveName: perspectiveName,
                  perspective: perspectiveId,
                  isEdit: true,
                  selectedBudget: budget,
                  source: PAGE_NAMES.PERSPECTIVE_BUILDER_PAGE
                })
              }
              onClickDelete={() => handleDeleteBudget(budget)}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </Container>
        </Layout.Horizontal>
        <Table<AlertThreshold> columns={columns} data={(alertThresholds || []) as any} />
      </Container>
    )
  }

  const openCreateNewBudgetModal = (): void => {
    trackEvent(USER_JOURNEY_EVENTS.CREATE_NEW_BUDGET, {
      pageName: PAGE_NAMES.PERSPECTIVE_BUILDER_PAGE,
      isEditMode: false
    })
    openModal({
      isEdit: false,
      perspectiveName: perspectiveName,
      perspective: perspectiveId,
      selectedBudget: {},
      source: PAGE_NAMES.PERSPECTIVE_BUILDER_PAGE
    })
  }

  const { state: isOpen, toggle: toggleCard } = useBooleanStatus()

  return (
    <Card className={cx(css.collapseCard, { [css.cardOpen]: isOpen })}>
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} onClick={toggleCard} className={css.chevron} />
        <Text color={isOpen ? Color.GREY_800 : Color.GREY_500} font={{ variation: FontVariation.H5 }}>
          {getString('ce.perspectives.budgets.perspectiveCreateBudgetTitle', {
            count: budgets.length || 0
          })}
        </Text>
        <FlexExpander />
        {budgets.length ? (
          <Link
            disabled={!canEdit}
            size={ButtonSize.SMALL}
            padding="none"
            margin="none"
            font={FontVariation.SMALL}
            variation={ButtonVariation.LINK}
            icon="plus"
            iconProps={{
              size: 10
            }}
            onClick={openCreateNewBudgetModal}
          >
            {getString('ce.budgets.addNewBudget')}
          </Link>
        ) : null}
      </Layout.Horizontal>
      <Collapse isOpen={isOpen} keepChildrenMounted>
        <Text
          padding={{ top: 'large', bottom: 'large' }}
          color={Color.GREY_800}
          font={{ variation: FontVariation.SMALL }}
        >
          {getString('ce.perspectives.budgets.desc')}
        </Text>
        {budgets.map((budget, idx) => {
          return (
            <List
              key={budget.uuid}
              buttonText={getString('ce.perspectives.budgets.createNew')}
              onButtonClick={openCreateNewBudgetModal}
              hasData={!isEmpty(budget)}
              loading={loading}
              showCreateButton={isEmpty(budget)}
              meta={renderMeta(budget, idx)}
              grid={renderGrid(budget)}
            />
          )
        })}
        {!budgets.length ? (
          <List
            grid={null}
            loading={loading}
            onButtonClick={openCreateNewBudgetModal}
            buttonText={getString('ce.perspectives.budgets.createNew')}
            hasData={false}
            showCreateButton={true}
          />
        ) : null}
      </Collapse>
    </Card>
  )
}

export const AnomalyAlerts = () => {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { perspectiveId, accountId } = useParams<UrlParams>()
  const [isRefetching, setRefetchingState] = useState(false)
  const selectedAlertInitState: SelectedAlertType = {
    perspectiveId: perspectiveId,
    channels: []
  }
  const [selectedAlert, setSelectedAlert] = useState(selectedAlertInitState)
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog({
    setRefetchingState: setRefetchingState,
    selectedAlert: selectedAlert,
    source: PAGE_NAMES.PERSPECTIVE_BUILDER_PAGE
  })

  const {
    data: notificationsList,
    loading,
    refetch: fetchNotificationList
  } = useGetNotificationSettings({
    perspectiveId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteNotificationAlert } = useDeleteNotificationSettings({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: perspectiveId
    }
  })

  useEffect(() => {
    if (isRefetching) {
      fetchNotificationList()
      setRefetchingState(false)
    }
  }, [fetchNotificationList, isRefetching])

  useEffect(() => {
    if (selectedAlert && selectedAlert.channels.length) {
      openAnomaliesAlertModal()
    }
  }, [openAnomaliesAlertModal, selectedAlert])

  const alertList = notificationsList?.data
  const channelsList = alertList?.channels || []

  const deleteNotification = async () => {
    try {
      const response = await deleteNotificationAlert(void 0, {
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

  const onEdit = () => {
    setSelectedAlert({
      perspectiveId: perspectiveId,
      channels: channelsList || []
    })
  }

  const columns: Column<CCMNotificationChannel>[] = useMemo(
    () => [
      {
        Header: getString('ce.anomalyDetection.alertType'),
        accessor: 'notificationChannelType'
      },
      {
        Header: getString('ce.anomalyDetection.alertReciepients'),
        Cell: ({ row }: CellProps<CCMNotificationChannel>) => {
          const recipients = [...(row.original.channelUrls || [])]
          return <RenderEmailAddresses emailAddresses={recipients} />
        }
      }
    ],
    []
  )

  const { state: isOpen, toggle: toggleCard } = useBooleanStatus()

  return (
    <Card className={cx(css.collapseCard, { [css.cardOpen]: isOpen })}>
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} onClick={toggleCard} className={css.chevron} />
        <Text color={isOpen ? Color.GREY_800 : Color.GREY_500} font={{ variation: FontVariation.H5 }}>
          {getString('ce.anomalyDetection.perspectiveCreateAnomalyAlertTitle', {
            count: channelsList.length || 0
          })}
        </Text>
        <FlexExpander />
        {channelsList.length ? (
          <Link
            size={ButtonSize.SMALL}
            padding="none"
            margin="none"
            font={FontVariation.SMALL}
            variation={ButtonVariation.LINK}
            icon="plus"
            iconProps={{
              size: 10
            }}
            onClick={() => onEdit()}
          >
            {getString('ce.anomalyDetection.addNewAnomalyAlert')}
          </Link>
        ) : null}
      </Layout.Horizontal>
      <Collapse isOpen={isOpen} keepChildrenMounted>
        <Text
          padding={{ top: 'large', bottom: 'large' }}
          color={Color.GREY_800}
          font={{ variation: FontVariation.SMALL }}
        >
          {getString('ce.anomalyDetection.addAnoamlyAlertDesc')}
        </Text>
        <Container className={css.anomalyAlertsWrapper}>
          {channelsList.length ? (
            <RenderEditDeleteActions
              onClickEdit={() => onEdit()}
              onClickDelete={() => deleteNotification()}
              className={css.anomalyAlertsActionBtn}
            />
          ) : null}
          <List
            buttonText={getString('ce.anomalyDetection.createNewAnomalyAlert')}
            onButtonClick={openAnomaliesAlertModal}
            showCreateButton={!channelsList.length}
            hasData={!!channelsList.length}
            loading={loading}
            grid={<Table<CCMNotificationChannel> data={channelsList} columns={columns} />}
          />
        </Container>
      </Collapse>
    </Card>
  )
}

const List = (props: ListProps): JSX.Element => {
  const { grid, buttonText, hasData, onButtonClick, loading, meta, showCreateButton } = props

  const renderLoader = (): JSX.Element => {
    return (
      <Container className={css.loader}>
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }

  const renderCreateNewButton = () => {
    return (
      <Layout.Horizontal
        spacing="small"
        style={{
          justifyContent: hasData ? 'flex-end' : 'center',
          alignItems: 'center'
        }}
      >
        <Button
          type="submit"
          withoutBoxShadow={true}
          className={css.createBtn}
          text={buttonText}
          onClick={onButtonClick}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <Container>
      {loading && renderLoader()}
      {!loading && hasData && (
        <>
          {meta}
          {grid}
        </>
      )}
      {!loading && showCreateButton && renderCreateNewButton()}
    </Container>
  )
}

const RenderReportFrequency: Renderer<CellProps<CEReportSchedule>> = ({ row }) => {
  const cron = row.original.userCron || ''
  return <span>{cronstrue.toString(cron)}</span>
}

const ReportName: Renderer<CellProps<CEReportSchedule>> = ({ row }) => {
  return (
    <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
      {row.original.name}
    </Text>
  )
}

const RenderBasedOn: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const { getString } = useStrings()
  const basedOn = row.original.basedOn!
  const map: Record<string, string> = useMemo(
    () => ({
      ACTUAL_COST: getString('ce.perspectives.budgets.actualSpend'),
      FORECASTED_COST: getString('ce.perspectives.budgets.forecastedCost')
    }),
    []
  )

  return <span>{map[basedOn]}</span>
}

const RenderEmailAddresses = ({ emailAddresses = [] }: { emailAddresses: string[] }) => {
  const email = emailAddresses.shift()
  const remainingEmailsCount = emailAddresses.length ? `(+${emailAddresses.length})` : ''

  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color={Color.GREY_700} font="small" lineClamp={1}>
        {email}
      </Text>
      {emailAddresses.length ? (
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.BOTTOM}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <div className={css.popoverContent}>
              <ul>
                {emailAddresses.map((em, idx) => (
                  <li key={idx}>{em}</li>
                ))}
              </ul>
            </div>
          }
        >
          <Text color="primary7" font="small">
            {remainingEmailsCount}
          </Text>
        </Popover>
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderEditDeleteActions = (props: TableActionsProps): JSX.Element => {
  const { onClickEdit, onClickDelete, className, canEdit = true, canDelete = true } = props
  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
      className={className}
    >
      <Button
        minimal
        icon="Edit"
        disabled={!canEdit}
        intent="primary"
        iconProps={{ size: 14 }}
        className={css.icon}
        data-testid="editIcon"
        onClick={onClickEdit}
      />
      <Button
        minimal
        icon="trash"
        disabled={!canDelete}
        intent="primary"
        iconProps={{ size: 14 }}
        className={css.icon}
        data-testid="deleteIcon"
        onClick={onClickDelete}
      />
    </Layout.Horizontal>
  )
}

const RenderAlertThresholds: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const percentage = row.original.percentage
  return <span>{percentage}%</span>
}

export default ReportsAndBudgets
