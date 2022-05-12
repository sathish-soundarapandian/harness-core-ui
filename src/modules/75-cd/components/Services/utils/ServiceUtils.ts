/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum ServiceTabs {
  SUMMARY = 'summaryTab',
  Configuration = 'configuration',
  REFERENCED_BY = 'refrencedByTab',
  ActivityLog = 'activityLog'
}

const DefaultService = {
  serviceDefinition: {
    spec: {
      variables: []
    }
  }
}

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_id'

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
