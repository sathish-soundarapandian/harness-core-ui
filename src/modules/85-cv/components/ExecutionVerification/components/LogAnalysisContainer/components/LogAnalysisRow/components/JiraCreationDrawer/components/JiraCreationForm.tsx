import React, { useEffect, useMemo, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikHelpers } from 'formik'
import {
  Button,
  ButtonVariation,
  FormInput,
  Formik,
  useToaster,
  Container,
  Icon,
  FormikForm,
  SelectOption
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage, getErrorMessageForReactQuery } from '@cv/utils/CommonUtils'
import useDidMountEffect from '@ce/common/useDidMountEffect'
import {
  useMetadataGetProject,
  useMetadataListPriorities,
  useMetadataListProjects
} from 'services/ticket-service/ticketServiceComponents'
import type {
  ListPrioritiesResponse,
  ListProjectsResponse,
  Project
} from 'services/ticket-service/ticketServiceSchemas'
import { LogFeedback, TicketRequestDto, useCreateTicketForFeedback } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { JiraFormType } from '../JiraCreationDrawer.types'
import {
  getIdentifiersPayload,
  getPlaceholderLoadingText,
  getPrioritiesDropdownOptions,
  getProjectIssueTypesDropdownOptions,
  getProjectsDropdownOptions,
  getYupJiraValidation
} from '../JiraCreationDrawer.utils'
import { jiraFormInitialValues } from '../../../LogAnalysisRow.constants'
import { JIRA_FORM_FIELDS } from './JiraCreationFormConstants'
import { JiraCreationFormOptionalConfig } from './components/JiraCreationFormOptionalConfig'
import css from '../../UpdateEventPreferenceDrawer/UpdateEventPreferenceDrawer.module.scss'
import style from '../JiraCreationDrawer.module.scss'

interface JiraCreationFormPropsType {
  onHideCallback: (isCallAPI?: boolean) => void
  feedback?: LogFeedback
}

export default function JiraCreationForm({ onHideCallback, feedback }: JiraCreationFormPropsType): JSX.Element {
  const { showError } = useToaster()

  const { accountId, projectIdentifier: projectId, orgIdentifier: orgId } = useParams<ProjectPathProps>()

  const { feedbackId: logFeedbackId } = feedback || {}

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const { getString } = useStrings()

  const { mutate: createJiraTicket } = useCreateTicketForFeedback({
    accountIdentifier: accountId,
    orgIdentifier: orgId,
    projectIdentifier: projectId,
    logFeedbackId: logFeedbackId as string
  })

  const queryParams = useMemo(() => ({ accountId, orgId, projectId, module: 'srm' }), [accountId, orgId, projectId])

  // ⭐️ JIRA Projects fetch call
  const {
    data: jiraProjectsData,
    isLoading: isJiraProjectsLoading,
    error: jiraProjectsFetchError
  } = useMetadataListProjects<ListProjectsResponse>(
    {
      queryParams
    },
    { retry: false }
  )

  // ⭐️ JIRA Issue types fetch call
  const {
    data: jiraIssueTypesData,
    isLoading: isIssueTypesLoading,
    refetch: refetchIssueTypes,
    error: issueTypesFetchError
  } = useMetadataGetProject<Project>(
    {
      pathParams: { id: selectedProject as string },
      queryParams
    },
    { retry: false, enabled: false }
  )

  // ⭐️ JIRA Priorities fetch call
  const {
    data: prioritiesData,
    isLoading: isJiraPrioritiesLoading,
    error: jiraPrioritiesFetchError
  } = useMetadataListPriorities<ListPrioritiesResponse>(
    {
      queryParams
    },
    { retry: false }
  )

  const submitData = async (formData: JiraFormType, formikActions: FormikHelpers<JiraFormType>): Promise<void> => {
    const formErrors = await formikActions.validateForm()

    if (!isEmpty(formErrors)) {
      return
    }

    const { description, issueType, projectKey, title, priority, identifiers } = formData

    const updatedData: TicketRequestDto = {
      identifiers: getIdentifiersPayload(identifiers),
      description,
      priority,
      issueType,
      projectKey,
      title
    }

    try {
      setIsSubmitting(true)

      await createJiraTicket(updatedData)

      setIsSubmitting(false)
      onHideCallback(true)
    } catch (e) {
      setIsSubmitting(false)
      showError(getErrorMessage(e))
    }
  }

  useEffect(() => {
    const occuredError = jiraProjectsFetchError || issueTypesFetchError || jiraPrioritiesFetchError
    if (occuredError) {
      showError(getErrorMessageForReactQuery(occuredError))
    }
  }, [jiraProjectsFetchError, issueTypesFetchError, jiraPrioritiesFetchError])

  useDidMountEffect(refetchIssueTypes, [selectedProject])

  const isProjectKeyDisabled = isJiraProjectsLoading || Boolean(jiraProjectsFetchError)
  const isPriorityDisabled = isJiraPrioritiesLoading || Boolean(jiraPrioritiesFetchError)
  const isIssueTypeDropdownDisabled = Boolean(issueTypesFetchError) || isIssueTypesLoading

  const handleProjectChange = ({ value }: SelectOption): void => {
    setSelectedProject(value as string)
  }

  return (
    <Formik<JiraFormType>
      validateOnMount
      data-testid="jiraCreationDrawer_form"
      formName="JiraCreationDrawerForm"
      initialValues={jiraFormInitialValues}
      validationSchema={getYupJiraValidation(getString)}
      onSubmit={submitData}
    >
      {formikProps => {
        if (isSubmitting) {
          return (
            <Container className={css.spinnerContainer}>
              <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
            </Container>
          )
        }

        return (
          <FormikForm>
            <FormInput.Select
              name={JIRA_FORM_FIELDS.PROJECT_KEY}
              data-testid="projectsDropdown"
              className={css.modalInputElement}
              disabled={isProjectKeyDisabled}
              placeholder={getPlaceholderLoadingText(getString, isJiraProjectsLoading && !jiraProjectsFetchError)}
              onChange={selectedOption => {
                handleProjectChange(selectedOption)
              }}
              label={getString('pipeline.jiraApprovalStep.project')}
              items={getProjectsDropdownOptions(jiraProjectsData?.projects)}
            />
            <FormInput.Select
              name={JIRA_FORM_FIELDS.ISSUE_TYPE}
              data-testid="issueTypeDropdown"
              placeholder={getPlaceholderLoadingText(
                getString,
                Boolean(formikProps.values.projectKey && isIssueTypesLoading && !issueTypesFetchError)
              )}
              className={css.modalInputElement}
              disabled={!formikProps.values.projectKey || isIssueTypeDropdownDisabled}
              label={getString('pipeline.jiraApprovalStep.issueType')}
              items={getProjectIssueTypesDropdownOptions(jiraIssueTypesData?.ticketTypes)}
            />

            <FormInput.Select
              name={JIRA_FORM_FIELDS.PRIORITY}
              data-testid="priorityDropdown"
              disabled={isPriorityDisabled}
              placeholder={getPlaceholderLoadingText(getString, isJiraPrioritiesLoading && !jiraPrioritiesFetchError)}
              className={css.modalInputElement}
              label={getString('cv.logs.jiraFormLable.priority')}
              items={getPrioritiesDropdownOptions(prioritiesData?.priorities)}
            />

            <FormInput.Text
              name={JIRA_FORM_FIELDS.TITLE}
              data-testid="ticketTitle"
              label={getString('cv.logs.jiraFormLable.ticketSummary')}
              className={css.modalInputElement}
              placeholder={getString('pipeline.jiraCreateStep.summaryPlaceholder')}
            />

            <FormInput.TextArea
              name={JIRA_FORM_FIELDS.DESCRIPTION}
              data-testid="description"
              label={getString('description')}
              className={style.jiraDescription}
              placeholder={getString('pipeline.jiraCreateStep.descriptionPlaceholder')}
            />

            <div className={style.divider} />

            <JiraCreationFormOptionalConfig />

            <Button
              text={getString('submit')}
              type="submit"
              variation={ButtonVariation.PRIMARY}
              margin={{ right: 'small' }}
              data-testid="jiraDrawerSubmit_button"
            />
            <Button
              text={getString('cancel')}
              onClick={() => onHideCallback()}
              variation={ButtonVariation.SECONDARY}
              data-testid="jiraDrawerClose_button"
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
