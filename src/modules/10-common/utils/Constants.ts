/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
export const DEFAULT_ORG_ID = 'default'

export const DEFAULT_PROJECT_NAME = 'Default Project'

export const DEFAULT_PROJECT_ID = 'Default_Project'

export const DEFAULT_ORG_NAME = 'Default Organization'

export enum Status {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  FAILURE = 'FAILURE',
  IN_PROGRESS = 'IN_PROGRESS',
  TO_DO = 'TO_DO'
}

export enum Environment {
  LOCALHOST = 'localhost',
  PR = 'pr',
  QA = 'qa',
  PRE_QA = 'stress',
  UAT = 'uat',
  APP = 'app'
}
