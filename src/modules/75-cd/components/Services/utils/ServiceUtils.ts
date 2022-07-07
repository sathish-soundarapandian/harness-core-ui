/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, set } from 'lodash-es'
import type { ServiceDefinition } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'

export type ServicePipelineConfig = PipelineInfoConfig & { gitOpsEnabled: boolean }

export enum ServiceTabs {
  SUMMARY = 'summaryTab',
  Configuration = 'configuration',
  REFERENCED_BY = 'referencedByTab',
  ActivityLog = 'activityLog'
}

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_id'
export const DefaultNewServiceId = '-1'

export const newServiceState = {
  service: {
    name: '',
    identifier: '',
    description: '',
    tags: {},
    gitOpsEnabled: false,
    serviceDefinition: {
      type: '' as ServiceDefinition['type'],
      spec: {}
    }
  }
}

const DefaultService = {
  serviceDefinition: {
    spec: {}
  }
}

export const initialServiceState = {
  service: { ...DefaultService }
  // isLoading: false,
  // isBETemplateUpdated: false,
  // isDBInitialized: false,
  // isUpdated: false,
  // isInitialized: false,
  // gitDetails: {},
  // entityValidityDetails: {}
}

export const setNameIDDescription = (draftData: PipelineInfoConfig, updatedData: ServicePipelineConfig): void => {
  set(draftData, 'identifier', updatedData.identifier)
  set(draftData, 'name', updatedData.name)
  set(draftData, 'description', updatedData.description)
  set(draftData, 'tags', updatedData.tags)
  set(draftData, 'gitOpsEnabled', defaultTo(updatedData.gitOpsEnabled, false))
}
