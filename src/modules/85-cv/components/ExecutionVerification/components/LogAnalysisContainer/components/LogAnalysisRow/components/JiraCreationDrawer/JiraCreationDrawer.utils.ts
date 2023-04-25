import * as Yup from 'yup'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { TicketRequestDto } from 'services/cv'
import type { Priority, Project, TicketType } from 'services/ticket-service/ticketServiceSchemas'
import type { JiraFormType } from './JiraCreationDrawer.types'

export const getYupJiraValidation = (getString: UseStringsReturn['getString']): Yup.ObjectSchema<object | undefined> =>
  Yup.object().shape({
    projectKey: Yup.string().trim().required(getString('common.validation.projectIsRequired')),
    title: Yup.string().trim().required(getString('cv.logs.jiraFormValidation.ticketSummary')),
    description: Yup.string().trim().required(getString('pipeline.serviceNowCreateStep.validations.description')),
    issueType: Yup.string().trim().required(getString('cv.logs.jiraFormValidation.issueType')),
    identifiers: Yup.array().of(
      Yup.object().shape({
        key: Yup.string().required('Key is required'),
        value: Yup.object().required('Value is required')
      })
    )
  })

export const getPlaceholderLoadingText = (getString: UseStringsReturn['getString'], isLoading: boolean): string => {
  return isLoading ? getString('loading') : getString('select')
}

const isArrayEmpty = <T>(data?: T): boolean => {
  return !Array.isArray(data) || !data.length
}

export const getIdentifiersPayload = (identifiers: JiraFormType['identifiers']): TicketRequestDto['identifiers'] => {
  if (!identifiers || isArrayEmpty(identifiers)) {
    return undefined
  }

  return identifiers.reduce((acc, value) => ({ ...acc, [value.key]: Object.keys(value.value) }), {})
}

export const getJiraDrawerButtonTitle = (getString: UseStringsReturn['getString'], titketId?: string): string => {
  return titketId
    ? getString('pipeline.verification.logs.viewJiraTicket')
    : getString('pipeline.verification.logs.createJiraTicket')
}

export const getProjectsDropdownOptions = (projects?: Project[]): SelectOption[] => {
  if (!projects || isArrayEmpty<Project[]>(projects)) {
    return []
  }

  const options = projects.map(project => {
    const { key, name } = project
    if (key && name) {
      return { label: name, value: key }
    }

    return null
  })

  return options.filter(option => Boolean(option)) as SelectOption[]
}

export const getProjectIssueTypesDropdownOptions = (ticketTypes?: TicketType[]): SelectOption[] => {
  if (!ticketTypes || isArrayEmpty(ticketTypes)) {
    return []
  }

  const options = ticketTypes.map(ticketType => {
    const { name } = ticketType
    if (name) {
      return { label: name, value: name }
    }

    return null
  })

  return options.filter(option => Boolean(option)) as SelectOption[]
}

export const getPrioritiesDropdownOptions = (priorities?: Priority[]): SelectOption[] => {
  if (!priorities || isArrayEmpty(priorities)) {
    return []
  }

  const options = priorities.map(priority => {
    const { id, name } = priority
    if (id && name) {
      return { label: name, value: id }
    }

    return null
  })

  return options.filter(option => Boolean(option)) as SelectOption[]
}
