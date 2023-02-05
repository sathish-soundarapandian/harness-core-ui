/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const VerificationJobType: { [key: string]: string } = {
  TEST: 'TEST',
  CANARY: 'CANARY',
  BLUE_GREEN: 'BLUE_GREEN',
  ROLLING: 'ROLLING',
  NO_ANALYSIS: 'NO_ANALYSIS'
}

export enum HealthSourcesType {
  AppDynamics = 'AppDynamics',
  NewRelic = 'NewRelic',
  Prometheus = 'Prometheus',
  Stackdriver = 'Stackdriver',
  StackdriverLog = 'StackdriverLog',
  Splunk = 'Splunk'
}

export const appId = '_ia5NKUCSoytYrZJMM15mQ' //t0-jbpLoR7S2BTsNfsk4Iw'
export const ADD_NEW_VALUE = '@@add_new'
export const EXECUTED_BY = 'executedBy'
export const UPDATED_BY = 'updatedBy'

export const ThresholdPercentageToShowBanner = 75
