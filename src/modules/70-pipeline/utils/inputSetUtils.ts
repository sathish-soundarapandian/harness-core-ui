/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isNull, isUndefined, omitBy } from 'lodash-es'
import type { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetSummaryResponse } from 'services/pipeline-ng'
import { changeEmptyValuesToRunTimeInput } from './stageHelpers'
import type { InputSetDTO } from './types'

export interface InputSetSummaryResponseExtended extends InputSetSummaryResponse {
  outdated?: boolean // BE sends isOutdated in list view and outdated in Details view
  action?: string
  lastUpdatedBy?: string
  createdBy?: string
  inputFieldSummary?: string
}

export const isInputSetInvalid = (data: InputSetSummaryResponseExtended): boolean => {
  if (data.entityValidityDetails?.valid === false) {
    return true
  }
  if (
    data.inputSetErrorDetails?.uuidToErrorResponseMap &&
    Object.keys(data.inputSetErrorDetails.uuidToErrorResponseMap)?.length
  ) {
    return true
  }
  if (data.overlaySetErrorDetails && Object.keys(data.overlaySetErrorDetails)?.length) {
    return true
  }
  if (data.isOutdated || data.outdated) {
    return true
  }
  return false
}

export const isInputSetStoreTypeInvalid = (
  pipelineStoreType: StoreType | undefined,
  inputSetStoreType: InputSetSummaryResponse['storeType']
): boolean => {
  return inputSetStoreType !== pipelineStoreType
}

export const clearNullUndefined = /* istanbul ignore next */ (data: InputSetDTO): InputSetDTO => {
  const omittedInputset = omitBy(omitBy(data, isUndefined), isNull)
  return changeEmptyValuesToRunTimeInput(cloneDeep(omittedInputset), '')
}

export const hasStoreTypeMismatch = (
  pipelineStoreType: StoreMetadata['storeType'],
  inputSetStoreType: StoreMetadata['storeType'],
  isEdit: boolean
): boolean => {
  return isEdit && pipelineStoreType !== inputSetStoreType
}
