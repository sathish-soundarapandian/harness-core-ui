import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Icon, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { LogFeedback } from 'services/cv'
import { useTicketsFindTicketById } from 'services/ticket-service/ticketServiceComponents'
import type { Ticket } from 'services/ticket-service/ticketServiceSchemas'
import { JiraViewDetailsDisplay } from './components/JiraViewDetailsDisplay'
import css from '../JiraCreationDrawer.module.scss'

interface JiraViewDetailsPropsType {
  feedback?: LogFeedback
  onHideCallback: () => void
}

export const JiraViewDetails = ({ feedback, onHideCallback }: JiraViewDetailsPropsType): JSX.Element | null => {
  const { ticket } = feedback || {}

  const { getString } = useStrings()

  const { accountId, projectIdentifier: projectId, orgIdentifier: orgId } = useParams<ProjectPathProps>()

  const {
    data: ticketDetails,
    isLoading,
    error,
    refetch
  } = useTicketsFindTicketById<Ticket>({
    pathParams: {
      id: ticket?.id as string
    },
    queryParams: {
      module: 'srm',
      accountId,
      orgId,
      projectId
    }
  })

  const openJiraLink = (): void => {
    window.open(ticketDetails?.url, '_blank')?.focus()
  }

  if (!feedback || (!ticketDetails && !isLoading && !error)) {
    return null
  }

  if (error) {
    return (
      <Container className={css.messageContainer} data-testid="jiraDetailsDrawer_error">
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            refetch()
          }}
        />
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container className={css.spinnerContainer} height={300} data-testid="jiraDetailsDrawer_loading">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  return (
    <>
      <Container className={css.jiraDetailsMain}>
        <JiraViewDetailsDisplay
          label={getString('projectLabel')}
          testId={'jiraDetails_project'}
          value={ticketDetails?.projectName}
        />

        <JiraViewDetailsDisplay
          label={getString('common.resourceCenter.ticketmenu.issueType')}
          testId={'jiraDetails_issueType'}
          value={ticketDetails?.issueType}
        />

        <div className={css.jiraDetailsDivider} />

        <JiraViewDetailsDisplay
          label={getString('cv.logs.jiraFormLable.ticketSummary')}
          testId={'jiraDetails_title'}
          value={ticketDetails?.title}
        />

        <JiraViewDetailsDisplay
          label={getString('description')}
          testId={'jiraDetails_description'}
          value={ticketDetails?.description}
        />

        <JiraViewDetailsDisplay
          label={getString('common.resourceCenter.ticketmenu.priority')}
          testId={'jiraDetails_priority'}
          value={ticketDetails?.priority}
        />

        <JiraViewDetailsDisplay
          label={getString('status')}
          testId={'jiraDetails_status'}
          value={ticketDetails?.status}
        />

        <JiraViewDetailsDisplay
          label={getString('cv.logs.jiraFormLable.assignee')}
          testId={'jiraDetails_assignee'}
          value={ticketDetails?.assignee?.displayName}
        />

        <div className={css.jiraDetailsDivider} />
      </Container>
      <Button
        text={getString('cv.logs.jiraDetails.viewInJira')}
        onClick={openJiraLink}
        variation={ButtonVariation.PRIMARY}
        margin={{ right: 'small' }}
        data-testid="jiraDetailsLink_button"
      />
      <Button
        text={getString('close')}
        onClick={() => onHideCallback()}
        variation={ButtonVariation.SECONDARY}
        data-testid="jiraDetailsClose_button"
      />
    </>
  )
}
