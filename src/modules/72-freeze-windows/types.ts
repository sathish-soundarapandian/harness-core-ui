/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { PartiallyRequired } from '@pipeline/utils/types'
import type { FreezeFilterPropertiesDTO, GetFreezeListQueryParams } from 'services/cd-ng'
import type { NotificationRules } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export enum FreezeWindowLevels {
  ACCOUNT = 'ACCOUNT',
  ORG = 'ORG',
  PROJECT = 'PROJECT'
}

export enum FIELD_KEYS {
  EnvType = 'EnvType',
  Service = 'Service',
  Org = 'Org',
  ExcludeOrgCheckbox = 'ExcludeOrgCheckbox',
  ExcludeOrg = 'ExcludeOrg',
  Proj = 'Project',
  ExcludeProjCheckbox = 'ExcludeProjCheckbox',
  ExcludeProj = 'ExcludeProj'
}

export interface EntityType {
  type: FIELD_KEYS
  filterType: 'All' | 'Equals' | 'NotEquals'
  entityRefs?: string[]
}

export interface EntityConfig {
  name: string
  entities: EntityType[]
}

export enum EnvironmentType {
  All = 'All',
  PROD = 'PROD',
  NON_PROD = 'NON_PROD'
}

export interface WindowPathProps extends ProjectPathProps {
  windowIdentifier: string
}

// This should come from BE
export interface FreezeEvent {
  type?: 'FreezeWindowEnabled' | 'DeploymentRejectedDueToFreeze' | 'TriggerInvocationRejectedDueToFreeze'
}

// This should come from BE
export interface FreezeNotificationRules extends NotificationRules {
  events: FreezeEvent[]
}

export type ProjctsByOrgId = { projects: SelectOption[]; projectsMap: Record<string, SelectOption> }

export interface ResourcesInterface {
  orgs: SelectOption[]
  orgsMap: Record<string, SelectOption>
  projects: SelectOption[]
  projectsMap: Record<string, SelectOption>
  services: SelectOption[]
  servicesMap: Record<string, SelectOption>
  freezeWindowLevel: FreezeWindowLevels
  projectsByOrgId: Record<string, ProjctsByOrgId>
}

type OptionalFreezeListUrlQueryParams = Pick<GetFreezeListQueryParams, 'page' | 'size'> &
  Pick<FreezeFilterPropertiesDTO, 'freezeStatus' | 'searchTerm' | 'sort'> & {
    startTime?: number
    endTime?: number
  }

export type FreezeListUrlQueryParams = PartiallyRequired<OptionalFreezeListUrlQueryParams, 'page' | 'size' | 'sort'>

export interface SortBy {
  sort: 'lastUpdatedAt' | 'name'
  order: 'ASC' | 'DESC'
}
