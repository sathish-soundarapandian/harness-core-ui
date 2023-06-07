/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Drawer, IDrawerProps } from '@blueprintjs/core'
import { Avatar, Card, Container, Layout, TableV2, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { Column, Renderer, CellProps } from 'react-table'
import { useStrings } from 'framework/strings'
import type { AuditEventDTO } from 'services/audit'
import { getReadableDateTime } from '@common/utils/dateUtils'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import { actionToLabelMap, getStringFromSubtitleMap } from '@audit-trail/utils/RequestUtil'
import YamlDiffButton from './YamlDiffButton'
import css from './EventSummary.module.scss'

const drawerStates: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  hasBackdrop: true,
  usePortal: true,
  isOpen: true,
  size: 790
}

interface EventSummaryProps {
  onClose?: () => void
  auditEvent: AuditEventDTO
}

interface EventCard {
  key: string
  title: string | ReactElement
  subTitle?: string | ReactElement
  content: ReactElement
  condition?: boolean
}

const renderColumnUser: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { labels, principal } = row.original.authenticationInfo
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar className={css.avatar} name={row.original.authenticationInfo.principal.identifier} hoverCard={false} />
      <Text lineClamp={1}>{labels?.username || principal.identifier}</Text>
    </Layout.Horizontal>
  )
}

const renderResourceName: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { resource } = row.original
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text lineClamp={1}>{resource.labels?.resourceName || resource.identifier}</Text>
    </Layout.Horizontal>
  )
}

const EventSummary: React.FC<EventSummaryProps> = ({ onClose, auditEvent }) => {
  const {
    auditId,
    resourceScope: { accountIdentifier, projectIdentifier, orgIdentifier },
    timestamp,
    httpRequestInfo: { requestMethod } = {},
    requestMetadata: { clientIP } = {}
  } = auditEvent

  const { getString } = useStrings()
  const { moduleLabel = 'na' } = AuditTrailFactory.getResourceHandler(auditEvent.resource.type) || {}

  const subTitle = {
    [getString('common.moduleLabel')]: getString(moduleLabel),
    [getString('projectLabel')]: projectIdentifier,
    [getString('orgLabel')]: orgIdentifier
  }

  const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    return (
      <Layout.Horizontal padding={{ right: 'xlarge' }}>
        <Text lineClamp={1}>{getString(actionToLabelMap[row.original.action])}</Text>
      </Layout.Horizontal>
    )
  }

  const renderResourceType: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    const label = AuditTrailFactory.getResourceHandler(row.original.resource.type)?.resourceLabel

    return (
      <Layout.Horizontal padding={{ right: 'xlarge' }}>
        <Text lineClamp={1}>{label ? getString(label) : row.original.resource.type}</Text>
      </Layout.Horizontal>
    )
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: getString('common.userLabel'),
      id: 'user',
      width: '25%',
      Cell: renderColumnUser
    },
    {
      Header: getString('action'),
      id: 'action',
      width: '25%',
      Cell: renderColumnAction
    },
    {
      Header: getString('common.resourceTypeLabel'),
      id: 'resourceType',
      width: '25%',
      Cell: renderResourceType
    },
    {
      Header: getString('auditTrail.resourceNameLabel'),
      id: 'resourceName',
      width: '25%',
      Cell: renderResourceName
    }
  ]

  const renderYamlDiffCard = (): ReactElement => {
    return (
      <>
        <TableV2<AuditEventDTO>
          className={css.table}
          data={[auditEvent]}
          columns={columns}
          getRowClassName={() => css.tableRow}
        />
        {auditId && accountIdentifier && <YamlDiffButton auditId={auditId} accountIdentifier={accountIdentifier} />}
      </>
    )
  }

  const renderSupplementaryDetails = (): ReactElement => {
    return (
      <>
        <Text
          color={Color.GREY_350}
          font={{ variation: FontVariation.SMALL_SEMI }}
          margin={{ bottom: 'xsmall', top: 'xlarge' }}
        >
          {getString('auditTrail.eventSource')}
        </Text>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }}>
          {getString('auditTrail.http', {
            method: requestMethod,
            clientIP
          })}
        </Text>
      </>
    )
  }

  const cards: EventCard[] = [
    {
      key: 'yamlDiff',
      title: getReadableDateTime(timestamp, 'MMM DD, YYYY, hh:mm a'),
      subTitle: getStringFromSubtitleMap(subTitle),
      content: renderYamlDiffCard()
    },
    {
      key: 'supplementaryDetails',
      title: getString('auditTrail.supplementaryDetails'),
      content: renderSupplementaryDetails(),
      condition: Boolean(requestMethod && clientIP)
    }
  ]

  return (
    <Drawer
      className={css.drawer}
      {...drawerStates}
      title={<Text font={{ variation: FontVariation.H4 }}>{getString('auditTrail.eventSummary')}</Text>}
      onClose={onClose}
    >
      <Container height="100%" background={Color.GREY_100} padding="xlarge">
        {cards.map(card => {
          if (card.condition !== false) {
            return (
              <Card key={card.key} className={css.card}>
                <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_800}>
                  {card.title}
                </Text>
                {card.subTitle && (
                  <Text
                    color={Color.GREY_350}
                    font={{ variation: FontVariation.SMALL_SEMI }}
                    margin={{ bottom: 'large', top: 'xsmall' }}
                  >
                    {card.subTitle}
                  </Text>
                )}
                {card.content}
              </Card>
            )
          }
          return undefined
        })}
      </Container>
    </Drawer>
  )
}

export default EventSummary
