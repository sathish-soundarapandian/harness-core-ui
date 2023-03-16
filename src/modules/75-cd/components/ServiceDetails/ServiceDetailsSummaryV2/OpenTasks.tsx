/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Card,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  PageError,
  Text,
  useToaster
} from '@harness/uicore'
import ReactTimeago from 'react-timeago'
import { Drawer } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { GetOpenTasksQueryParams, useGetOpenTasks } from 'services/cd-ng'
import { iconMap } from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { mapToExecutionStatus } from '@pipeline/components/Dashboards/shared'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { useServiceContext } from '@cd/context/ServiceContext'
import { StringKeys, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import openTaskEmptyState from './openTaskEmptyState.svg'
import css from './ServiceDetailsSummaryV2.module.scss'
import style from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'

interface StatusMapFields {
  color: string
  message: StringKeys
}

const statusMap: Partial<Record<ExecutionStatus, StatusMapFields>> = {
  Aborted: { color: Color.GREY_700, message: 'cd.openTask.openTaskStatusMsgAborted' },
  AbortedByFreeze: { color: Color.GREY_700, message: 'cd.openTask.openTaskStatusMsgAbortedByFreeze' },
  Failed: { color: Color.RED_600, message: 'cd.openTask.openTaskStatusMsgFailed' },
  Expired: { color: Color.GREY_700, message: 'cd.openTask.openTaskStatusMsgExpired' },
  ApprovalWaiting: { color: Color.ORANGE_700, message: 'cd.openTask.openTaskStatusMsgApprovalWaiting' }
}

export default function OpenTasks(): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [bannerVisible, setBannerVisible] = useState<boolean>(true)
  const { drawerOpen, setDrawerOpen, setNotificationPopoverVisibility } = useServiceContext()
  const drawerOpenFromBanner = React.useRef(false)
  const { getString } = useStrings()
  const { showError } = useToaster()

  //3 days ago
  const startTime = useMemo(() => Date.now() - 3 * 24 * 60 * 60000, [])

  const queryParams: GetOpenTasksQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    startTime
  }

  const { data, loading, error, refetch } = useGetOpenTasks({ queryParams })

  const openTasksData = data?.data
  const countOfTasks = openTasksData?.pipelineDeploymentDetails?.length

  /* istanbul ignore next */
  function handleClick(pipelineId?: string, executionIdentifier?: string): void {
    if (pipelineId && executionIdentifier) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineId,
        executionIdentifier,
        projectIdentifier,
        accountId,
        module: 'cd',
        source: 'deployments'
      })

      window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  return (
    <>
      {bannerVisible && countOfTasks ? (
        <Container className={css.openTaskBannerStyle}>
          <Layout.Horizontal>
            <Text
              padding={{ right: 'small' }}
              font={{ variation: FontVariation.SMALL_SEMI }}
              icon="warning-icon"
              iconProps={{ color: Color.ORANGE_700 }}
            >
              {getString('cd.openTask.bannerMsg', { count: countOfTasks })}
            </Text>
            <Button
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              text={getString('cd.openTask.seeOpenTask')}
              onClick={() => {
                drawerOpenFromBanner.current = true
                setDrawerOpen?.(true)
                setBannerVisible(false)
              }}
            />
          </Layout.Horizontal>
          <Icon
            name="Stroke"
            color={Color.GREY_700}
            onClick={() => {
              setBannerVisible(false)
              setNotificationPopoverVisibility?.(true)
            }}
            className={css.cursor}
          />
        </Container>
      ) : null}
      <Drawer enforceFocus={false} size={'calc(100% - 650px)'} isOpen={!!drawerOpen} data-testid={'openTaskDrawer'}>
        <Button
          minimal
          className={style.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            setDrawerOpen?.(false)
            drawerOpenFromBanner.current && setNotificationPopoverVisibility?.(true)
            drawerOpenFromBanner.current = false
          }}
        />
        <Layout.Vertical padding="xxxlarge" className={css.openTasksBgColor} height={'100vh'}>
          <Text font={{ variation: FontVariation.BLOCKQUOTE }} padding={{ bottom: 'xlarge' }}>
            {getString('cd.openTask.title')}
          </Text>
          <Layout.Vertical className={css.overflowOpenTasks}>
            {openTasksData?.pipelineDeploymentDetails?.length ? (
              openTasksData.pipelineDeploymentDetails?.map((item, idx) => {
                const status = defaultTo(mapToExecutionStatus(defaultTo(item.status, '').toUpperCase()), '')
                return (
                  item && (
                    <Card key={`${item.identifier}_${idx}`} className={css.openTaskCardStyle}>
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        {status && <Icon {...iconMap[status]} color={statusMap[status]?.color} size={16} />}
                        <Layout.Vertical padding={{ left: 'medium' }}>
                          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>{`${defaultTo(
                            item.name,
                            '-'
                          )} ${
                            status
                              ? getString(defaultTo(statusMap[status]?.message, 'pipeline.executionStatus.Unknown'))
                              : ''
                          }`}</Text>
                          {item.lastExecutedAt && (
                            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
                              {getString('cd.since')} <ReactTimeago date={item.lastExecutedAt} />
                            </Text>
                          )}
                        </Layout.Vertical>
                      </Layout.Horizontal>
                      <Button
                        variation={ButtonVariation.SECONDARY}
                        size={ButtonSize.SMALL}
                        height={32}
                        text={getString('cd.openExecution')}
                        onClick={() => handleClick(item.identifier, item.planExecutionId)}
                      />
                    </Card>
                  )
                )
              })
            ) : (
              <Layout.Vertical
                flex={{ alignItems: 'center', justifyContent: 'center' }}
                className={css.openTaskEmptyState}
              >
                {loading ? (
                  <Icon name="spinner" color={Color.BLUE_500} size={30} />
                ) : error ? (
                  <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
                ) : (
                  <>
                    <img src={openTaskEmptyState} alt={getString('cd.openTask.openTaskEmptyStateMsg')} />
                    <Text font={{ variation: FontVariation.BODY }}>
                      {getString('cd.openTask.openTaskEmptyStateMsg')}
                    </Text>
                  </>
                )}
              </Layout.Vertical>
            )}
          </Layout.Vertical>
        </Layout.Vertical>
      </Drawer>
    </>
  )
}
