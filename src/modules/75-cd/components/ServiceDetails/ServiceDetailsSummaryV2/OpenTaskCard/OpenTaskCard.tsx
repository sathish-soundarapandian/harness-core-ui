/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { defaultTo, isEmpty } from 'lodash-es'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Card,
  Container,
  Icon,
  Layout,
  Text,
  useToaster,
  useToggleOpen
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ServicePipelineWithRevertInfo } from 'services/cd-ng'
import type { StringKeys} from 'framework/strings';
import { useStrings } from 'framework/strings'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { mapToExecutionStatus } from '@pipeline/components/Dashboards/shared'
import { iconMap } from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import css from './OpenTaskCard.module.scss'

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

interface OpenTaskCardProps {
  openTask: ServicePipelineWithRevertInfo
}

export function OpenTaskCard(props: OpenTaskCardProps): JSX.Element {
  const { openTask } = props

  const { isOpen: seeMoreClicked, toggle: toggleSeeMoreClicked } = useToggleOpen()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()
  const { showError } = useToaster()
  const { getString } = useStrings()

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

  const status = defaultTo(mapToExecutionStatus(defaultTo(openTask.status, '').toUpperCase()), '')

  return (
    <Card className={css.openTaskCardStyle}>
      <Container className={css.openTaskCardInitialContentDetails}>
        <Layout.Vertical>
          <Layout.Horizontal flex={{ alignItems: 'center' }}>
            {status && <Icon {...iconMap[status]} color={statusMap[status]?.color} size={16} />}
            <Layout.Vertical padding={{ left: 'medium' }}>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>{`${defaultTo(
                openTask.name,
                '-'
              )} ${
                status ? getString(defaultTo(statusMap[status]?.message, 'pipeline.executionStatus.Unknown')) : ''
              }`}</Text>
              {openTask.lastExecutedAt && (
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
                  {getString('cd.since')} <ReactTimeago date={openTask.lastExecutedAt} />
                </Text>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
          {!isEmpty(openTask.failureDetail) && (
            <Button
              variation={ButtonVariation.LINK}
              text={seeMoreClicked ? getString('common.seeLess') : getString('common.seeMore')}
              onClick={toggleSeeMoreClicked}
              className={css.seeMoreButton}
            />
          )}
        </Layout.Vertical>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          height={32}
          text={getString('cd.openExecution')}
          onClick={() => handleClick(openTask.identifier, openTask.planExecutionId)}
        />
      </Container>
      {seeMoreClicked && <Container className={css.openTaskFailureDetails}>{openTask.failureDetail}</Container>}
    </Card>
  )
}
