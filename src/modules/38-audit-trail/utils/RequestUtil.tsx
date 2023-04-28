/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption } from '@harness/uicore'
import { uniqBy } from 'lodash-es'
import type { IconProps } from '@harness/icons'
import type {
  StreamingDestinationDto,
  UpdateStreamingDestinationProps,
  AwsS3StreamingDestinationSpecDto,
  CreateStreamingDestinationsRequestBody
} from '@harnessio/react-audit-service-client'
import type { IStreamingDestinationForm } from '@audit-trail/interfaces/LogStreamingInterface'
import { StreamingDestinationSpecDTOTypeMap } from '@audit-trail/interfaces/LogStreamingInterface'
import type { AuditTrailFormType, ProjectSelectOption } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import type { AuditEventDTO, AuditFilterProperties, ResourceScopeDTO } from 'services/audit'
import type { StringKeys } from 'framework/strings'
import type { OrganizationAggregateDTO, ProjectResponse } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { UseQueryParamsOptions, useQueryParamsOptions } from '@common/hooks/useQueryParams'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'

export const actionToLabelMap: Record<AuditEventDTO['action'], StringKeys> = {
  CREATE: 'created',
  UPDATE: 'common.updated',
  RESTORE: 'auditTrail.actions.restored',
  DELETE: 'deleted',
  UPSERT: 'auditTrail.actions.upserted',
  INVITE: 'auditTrail.actions.invited',
  RESEND_INVITE: 'auditTrail.actions.invite_resent',
  REVOKE_INVITE: 'auditTrail.actions.invite_revoked',
  ADD_COLLABORATOR: 'auditTrail.actions.added_collaborator',
  REMOVE_COLLABORATOR: 'auditTrail.actions.removed_collaborator',
  ADD_MEMBERSHIP: 'auditTrail.actions.added_membership',
  REMOVE_MEMBERSHIP: 'auditTrail.actions.removed_membership',
  CREATE_TOKEN: 'auditTrail.actions.create_token',
  REVOKE_TOKEN: 'auditTrail.actions.revoke_token',
  FORCE_DELETE: 'auditTrail.actions.force_deleted',
  LOGIN: 'auditTrail.actions.login',
  LOGIN2FA: 'auditTrail.actions.login2fa',
  UNSUCCESSFUL_LOGIN: 'auditTrail.actions.unsuccessfullLogin',
  ERROR_BUDGET_RESET: 'cv.resetErrorBudget',
  START: 'start',
  END: 'auditTrail.actions.end',
  PAUSE: 'auditTrail.actions.pause',
  RESUME: 'auditTrail.actions.resume',
  ABORT: 'abort',
  TIMEOUT: 'pipelineSteps.timeoutLabel'
}

export const moduleToLabelMap: Record<AuditEventDTO['module'], StringKeys> = {
  CD: 'common.module.cd',
  CE: 'common.module.ce',
  CF: 'common.module.cf',
  CV: 'common.module.cv',
  CI: 'common.module.ci',
  CORE: 'common.module.core',
  CHAOS: 'common.module.chaos',
  PMS: 'common.module.pms',
  TEMPLATESERVICE: 'common.module.templateService',
  STO: 'common.module.sto',
  GOVERNANCE: 'common.module.governance',
  IACM: 'common.iacm',
  SRM: 'cv.srmTitle',
  CODE: 'common.purpose.code.name',
  IDP: 'common.purpose.idp.shortName',
  CET: 'common.module.cet'
}

export const getModuleNameFromAuditModule = (auditModule: AuditEventDTO['module']): Module | undefined => {
  switch (auditModule) {
    case 'CD':
      return 'cd'
    case 'CI':
      return 'ci'
    case 'CF':
      return 'cf'
    case 'CE':
      return 'ce'
    case 'CV':
      return 'cv'
    case 'CHAOS':
      return 'chaos'
  }
  return undefined
}

interface ModuleInfo {
  moduleLabel: StringKeys
  icon: IconProps
}

export const moduleInfoMap: Record<AuditEventDTO['module'], ModuleInfo> = {
  CD: {
    moduleLabel: 'common.purpose.cd.continuous',
    icon: { name: 'cd' }
  },
  CI: {
    moduleLabel: 'common.purpose.ci.continuous',
    icon: { name: 'ci-main' }
  },
  CF: {
    moduleLabel: 'common.purpose.cf.continuous',
    icon: { name: 'cf-main' }
  },
  CE: {
    moduleLabel: 'cloudCostsText',
    icon: { name: 'ce-main' }
  },
  CV: {
    moduleLabel: 'common.purpose.cv.serviceReliability',
    icon: { name: 'cv-main' }
  },
  PMS: {
    moduleLabel: 'common.pipeline',
    icon: { name: 'pipeline' }
  },
  CORE: {
    moduleLabel: 'common.resourceCenter.ticketmenu.platform',
    icon: { name: 'nav-settings' }
  },
  TEMPLATESERVICE: {
    moduleLabel: 'common.templateServiceLabel',
    icon: { name: 'nav-settings' }
  },
  STO: {
    moduleLabel: 'common.module.sto',
    icon: { name: 'sto-grey' }
  },
  GOVERNANCE: {
    moduleLabel: 'common.module.governance',
    icon: { name: 'governance' }
  },
  CHAOS: {
    moduleLabel: 'common.module.chaos',
    icon: { name: 'chaos-main' }
  },
  IACM: {
    moduleLabel: 'common.iacm',
    icon: { name: 'iacm' }
  },
  SRM: {
    moduleLabel: 'cv.srmTitle',
    icon: { name: 'cv-main' }
  },
  CODE: {
    moduleLabel: 'common.purpose.code.name',
    icon: { name: 'code' }
  },
  IDP: {
    moduleLabel: 'common.purpose.idp.shortName',
    icon: { name: 'idp' }
  },
  CET: {
    moduleLabel: 'common.module.cet',
    icon: { name: 'cet' }
  }
}

export type ShowEventFilterType = Exclude<AuditFilterProperties['staticFilter'], undefined>

export const showEventTypeMap: Record<ShowEventFilterType, StringKeys> = {
  EXCLUDE_LOGIN_EVENTS: 'auditTrail.excludeLoginEvents',
  EXCLUDE_SYSTEM_EVENTS: 'auditTrail.excludeSystemEvents'
}

export const getFilterPropertiesFromForm = (formData: AuditTrailFormType, accountId: string): AuditFilterProperties => {
  const filterProperties: AuditFilterProperties = { filterType: 'Audit' }
  const { actions, modules, users, resourceType, organizations, projects, resourceIdentifier } = formData
  if (actions) {
    filterProperties['actions'] = actions.map(action => action.value) as AuditFilterProperties['actions']
  }
  if (modules) {
    filterProperties['modules'] = modules.map(
      (module: MultiSelectOption) => module.value
    ) as AuditFilterProperties['modules']
  }

  if (users) {
    filterProperties['principals'] = users.map(user => ({
      type: 'USER',
      identifier: user.value
    })) as AuditFilterProperties['principals']
  }

  if (resourceType) {
    filterProperties['resources'] = resourceType.map(type => ({
      type: type.value,
      identifier: resourceIdentifier || ''
    })) as AuditFilterProperties['resources']
  }

  if (projects && projects.length > 0) {
    filterProperties['scopes'] = projects.map(projectData => ({
      projectIdentifier: projectData.value as string,
      accountIdentifier: accountId,
      orgIdentifier: projectData.orgIdentifier
    }))
  }

  if (organizations) {
    if (!filterProperties['scopes']) {
      filterProperties['scopes'] = organizations.map(org => ({
        accountIdentifier: accountId,
        orgIdentifier: org.value as string
      }))
    } else {
      organizations.forEach(org => {
        if (filterProperties['scopes']?.findIndex(scope => scope.orgIdentifier === org.value) === -1) {
          filterProperties['scopes'].push({
            accountIdentifier: accountId,
            orgIdentifier: org.value as string
          })
        }
      })
    }
  }

  return filterProperties
}

const getOrgAndProjects = (scopes: ResourceScopeDTO[]) => {
  const organizations: MultiSelectOption[] = []
  const projects: ProjectSelectOption[] = []
  scopes.forEach(scope => {
    if (scope.orgIdentifier) {
      if (scope.projectIdentifier) {
        projects.push({
          label: scope.projectIdentifier,
          value: scope.projectIdentifier,
          orgIdentifier: scope.orgIdentifier
        })
      }
      organizations.push({ label: scope.orgIdentifier, value: scope.orgIdentifier })
    }
  })
  return {
    organizations: uniqBy(organizations, org => org.value),
    projects
  }
}

export const getFormValuesFromFilterProperties = (
  filterProperties: AuditFilterProperties,
  getString: (key: StringKeys, vars?: Record<string, any>) => string
): AuditTrailFormType => {
  const formData: AuditTrailFormType = {}
  const { actions, modules, principals, scopes, resources } = filterProperties
  if (actions) {
    formData['actions'] = actions?.map(action => ({ label: getString(actionToLabelMap[action]), value: action }))
  }

  if (modules) {
    formData['modules'] = modules?.map(module => ({ label: getString(moduleToLabelMap[module]), value: module }))
  }

  if (principals) {
    formData['users'] = principals?.map(principal => ({
      label: principal.identifier,
      value: principal.identifier
    }))
  }

  if (resources) {
    formData['resourceType'] = resources?.map(resource => {
      const label = AuditTrailFactory.getResourceHandler(resource.type)?.resourceLabel
      return {
        label: label ? getString(label) : resource.type,
        value: resource.type
      }
    })
    if (resources.length === 1 && resources[0].identifier) {
      formData['resourceIdentifier'] = resources[0].identifier
    }
  }

  return {
    ...formData,
    ...(scopes ? getOrgAndProjects(scopes) : {})
  }
}

export const formToLabelMap = (obj: Record<string, any>) => {
  const labelMap: {
    [key: string]: any
  } = {}
  Object.keys(obj).forEach((key: string) => {
    labelMap[key] = Array.isArray(obj[key]) ? obj[key].map((value: MultiSelectOption) => value.value) : obj[key]
  })
  return labelMap
}

export const getProjectDropdownList = (list: ProjectResponse[]): ProjectSelectOption[] => {
  return list.map(project => ({
    label: project.project.name,
    value: project.project.identifier,
    orgIdentifier: project.project.orgIdentifier as string
  }))
}

export const getOrgDropdownList = (list: OrganizationAggregateDTO[]): MultiSelectOption[] => {
  return list.map(org => ({
    label: org.organizationResponse.organization.name,
    value: org.organizationResponse.organization.identifier
  }))
}

const SEPARATOR = '|'
export const getStringFromSubtitleMap = (map: Record<string, string | undefined>): string => {
  const keysArr = Object.keys(map)
  const arr: string[] = keysArr.reduce((finalArr: string[], key: string) => {
    return map[key] ? [...finalArr, `${key}: ${map[key]}`] : finalArr
  }, [])
  return arr.reduce((str, text) => `${str} ${SEPARATOR} ${text}`)
}

export const buildUpdateSDPayload = (
  sd: StreamingDestinationDto,
  overrideFields?: any
): UpdateStreamingDestinationProps => {
  const payload: UpdateStreamingDestinationProps = {
    body: {
      connector_ref: sd.connector_ref || '',
      identifier: sd.identifier || '',
      name: sd.name || '',
      spec: sd.spec,
      status: sd.status,
      ...overrideFields
    },
    'streaming-destination': sd.identifier || ''
  }
  return payload
}

export const buildStreamingDestinationSpecByType = (data: any): StreamingDestinationDto['spec'] => {
  const specObj: StreamingDestinationDto['spec'] = { type: data?.type }
  switch (data?.type) {
    case StreamingDestinationSpecDTOTypeMap.AWS_S3: {
      ;(specObj as AwsS3StreamingDestinationSpecDto).bucket = data?.bucket
      break
    }
    default:
      break
  }
  return specObj
}

export const buildCreateStreamingDestinationPayload = (
  data: IStreamingDestinationForm
): CreateStreamingDestinationsRequestBody => {
  const payload: CreateStreamingDestinationsRequestBody = {
    connector_ref: data?.connector_ref,
    description: data?.description,
    identifier: data?.streamingDestinationIdentifier,
    name: data?.name,
    status: data?.status || 'INACTIVE',
    tags: data?.tags,
    spec: buildStreamingDestinationSpecByType(data)
  }

  return payload
}

export enum View {
  AUDIT_LOGS = 'auditLogs',
  AUDIT_LOG_STREAMING = 'auditLogStreaming'
}

export interface AuditDateFilter {
  startTime: string
  endTime: string
}

export type AuditTrailQueryParams = {
  view?: View
  dateFilter?: AuditDateFilter
  staticFilter?: AuditFilterProperties['staticFilter']
} & CommonPaginationQueryParams
export type AuditTrailQueryParamsWithDefaults = RequiredPick<
  AuditTrailQueryParams,
  'page' | 'size' | 'view' | 'dateFilter'
>

export const AUDIT_TRAIL_PAGE_INDEX = 0
export const AUDIT_TRAIL_PAGE_SIZE = 25

export const useAuditTrailQueryParamOptions = (): UseQueryParamsOptions<AuditTrailQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return useQueryParamsOptions({
    page: AUDIT_TRAIL_PAGE_INDEX,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : AUDIT_TRAIL_PAGE_SIZE,
    view: View.AUDIT_LOGS,
    dateFilter: {
      startTime: start.getTime().toString(),
      endTime: end.getTime().toString()
    }
  })
}
