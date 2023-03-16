/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'

import { Icon, Layout } from '@harness/uicore'
import type { StreamingDestinationCards } from '@harnessio/react-audit-service-client'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import ALSCard from './ALSCard'
import css from './AuditLogStreamingCards.module.scss'

export interface AuditLogStreamingCardProps {
  cardsData?: StreamingDestinationCards
  className?: string
}

const ActiveInactiveCards = (
  getString: UseStringsReturn['getString'],
  data?: StreamingDestinationCards
): JSX.Element => {
  const activeCard = data?.countByStatusCard?.find(card => card?.status === 'ACTIVE')
  const inactiveCard = data?.countByStatusCard?.find(card => card?.status === 'INACTIVE')
  return (
    <>
      <ALSCard title={getString('auditTrail.logStreaming.activeDestinations')} subtitle={activeCard?.count || 0} />
      <ALSCard title={getString('auditTrail.logStreaming.inactiveDestinations')} subtitle={inactiveCard?.count || 0} />
    </>
  )
}

const LastStreamedCard = (getString: UseStringsReturn['getString'], data?: StreamingDestinationCards): JSX.Element => {
  const card = data?.lastStreamedCard
  return (
    <ALSCard
      className={css.lastStreamedCard}
      title={getString('auditTrail.logStreaming.lastStreamed')}
      subtitle={
        card?.lastStreamedAt ? (
          <ReactTimeago date={card?.lastStreamedAt} />
        ) : (
          getString('auditTrail.logStreaming.notStreamedYet')
        )
      }
    />
  )
}

const FailedStreamingCard = (
  getString: UseStringsReturn['getString'],
  data?: StreamingDestinationCards
): JSX.Element => {
  const card = data?.failureInfoCard
  return (
    <ALSCard
      className={css.failedStreamingCard}
      title={getString('auditTrail.logStreaming.failedStreaming')}
      subtitle={
        <span className={css.alignCenter}>
          {card?.count ? (
            <>
              <Icon name="danger-icon" size={25} margin={{ right: 'small' }} />
              <span>
                {getString('auditTrail.logStreaming.errorsInDestinations', {
                  count: card.count
                })}
              </span>
            </>
          ) : (
            getString('none')
          )}
        </span>
      }
    />
  )
}

const AuditLogStreamingCards: React.FC<AuditLogStreamingCardProps> = props => {
  const { cardsData, className } = props
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="xxxlarge" className={className}>
      {ActiveInactiveCards(getString, cardsData)}
      {LastStreamedCard(getString, cardsData)}
      {FailedStreamingCard(getString, cardsData)}
    </Layout.Horizontal>
  )
}

export default AuditLogStreamingCards
