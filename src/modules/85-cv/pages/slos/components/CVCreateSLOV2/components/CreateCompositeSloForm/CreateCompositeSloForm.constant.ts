/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum SLOWeight {
  MIN = 0.01,
  MAX = 99.99,
  STEP = 0.01
}

export const MinNumberOfSLO = 2
export const MaxNumberOfSLO = 20

export const serviceLevelObjectiveKeys = [
  'accountId',
  'orgIdentifier',
  'projectIdentifier',
  'serviceLevelObjectiveRef',
  'weightagePercentage'
]
