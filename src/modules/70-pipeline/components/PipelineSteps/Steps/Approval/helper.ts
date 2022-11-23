/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { ApproverInputsSubmitCallInterface, HarnessApprovalData } from './types'

const getInitialValueForMinCount = (valueFromData: string | number): string | number => {
  if (getMultiTypeFromValue(valueFromData) === MultiTypeInputType.FIXED) {
    // type is FIXED
    if (valueFromData) {
      // type is FIXED and value exists i.e. user has typed some numbers, convert them to number and return
      return Number(valueFromData)
    }
    // If the type is FIXED but the value doesn't exist i.e. opening the form for the first time
    // return the default value of 1
    return 1
  }
  // if the type is not FIXED i.e. runtime or expression, return the string as it is
  return valueFromData
}

export const processFormData = (data: HarnessApprovalData): HarnessApprovalData => {
  const toReturn: HarnessApprovalData = { ...data }
  if (data.spec.approverInputs) {
    if (getMultiTypeFromValue(data.spec.approverInputs as string) === MultiTypeInputType.RUNTIME) {
      toReturn.spec.approverInputs = data.spec.approverInputs
    } else if (Array.isArray(data.spec.approverInputs)) {
      toReturn.spec.approverInputs = (data.spec.approverInputs as ApproverInputsSubmitCallInterface[])
        ?.filter(input => input.name)
        ?.map(
          (input: ApproverInputsSubmitCallInterface) =>
            ({
              name: input.name,
              defaultValue: input.defaultValue
            } as ApproverInputsSubmitCallInterface)
        )
    }
  }
  return toReturn
}

// Converting API call data for formik values, to populate while editing the step
export const processForInitialValues = (data: HarnessApprovalData): HarnessApprovalData => {
  const toReturn: HarnessApprovalData = {
    ...data,
    spec: {
      ...data.spec,
      approvers: {
        ...data.spec?.approvers,
        minimumCount: getInitialValueForMinCount(data.spec?.approvers?.minimumCount)
      }
    }
  }

  if (data.spec?.approverInputs) {
    if (getMultiTypeFromValue(data.spec?.approverInputs as string) === MultiTypeInputType.RUNTIME) {
      toReturn.spec.approverInputs = data.spec?.approverInputs
    } else if (Array.isArray(data.spec?.approverInputs)) {
      toReturn.spec.approverInputs = (data.spec?.approverInputs as ApproverInputsSubmitCallInterface[])?.map(
        (input: ApproverInputsSubmitCallInterface) =>
          ({
            name: input.name,
            defaultValue: input.defaultValue
          } as ApproverInputsSubmitCallInterface)
      )
    }
  }

  return toReturn
}
