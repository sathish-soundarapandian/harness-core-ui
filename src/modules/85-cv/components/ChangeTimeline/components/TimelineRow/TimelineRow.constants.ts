/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const DATE_FORMAT = 'Do MMM hh:mm A'

export enum SLO_WIDGETS {
  DOWNTIME = 'Downtime',
  ANNOTATION = 'Annotation',
  ERROR_BUDGET_RESET = 'ErrorBudgetReset',
  DATA_COLLECTION_FAILURE = 'DataCollectionFailure'
}

export const INITIAL_MESSAGE_DETAILS = { message: '', id: '' }
