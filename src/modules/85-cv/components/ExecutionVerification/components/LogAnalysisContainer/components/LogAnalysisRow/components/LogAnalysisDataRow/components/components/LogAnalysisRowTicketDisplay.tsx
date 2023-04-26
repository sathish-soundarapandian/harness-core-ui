import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import type { TicketResponseDto } from 'services/cv'
import css from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/LogAnalysisRow.module.scss'

interface LogAnalysisRowTicketDisplay {
  ticketDetails?: TicketResponseDto
}

export function LogAnalysisRowTicketDisplay({ ticketDetails }: LogAnalysisRowTicketDisplay): JSX.Element {
  const openJiraTicket = (): void => {
    window.open(ticketDetails?.url, '_blank')?.focus()
  }

  return (
    <Button
      className={css.jiraTicketLink}
      data-testid="createdJiraTicketIdDisplay"
      onClick={openJiraTicket}
      variation={ButtonVariation.LINK}
      icon="service-jira"
      withoutCurrentColor
      iconProps={{ size: 16 }}
    >
      {ticketDetails?.externalId}
    </Button>
  )
}
