/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Validation, VariableType } from '../VariablesUtils'

const variableCommonAccount = {
  name: 'name',
  identifier: 'identifier',
  description: 'description'
}

const variableCommonOrg = {
  ...variableCommonAccount,
  orgIdentifier: 'orgId'
}

const variableFormProject = {
  ...variableCommonOrg,
  projectIdentifier: 'projectId'
}

const StringType = { type: VariableType.String }
const StringFixed = {
  valueType: Validation.FIXED,
  fixedValue: 'customvalue'
}

export const StringFixedFormAccount = {
  ...variableCommonAccount,
  ...StringType,
  ...StringFixed
}

export const StringFixedFormOrg = {
  ...variableCommonOrg,
  ...StringType,
  ...StringFixed
}

export const StringFixedFormProject = {
  ...variableFormProject,
  ...StringType,
  ...StringFixed
}

export const StringFixedPayloadAcc = {
  variable: {
    ...variableCommonAccount,
    orgIdentifier: undefined,
    projectIdentifier: undefined,
    type: VariableType.String,
    spec: {
      ...StringFixed,
      allowedValues: undefined,
      defaultValue: undefined
    }
  }
}

export const StringFixedPayloadOrg = {
  variable: {
    ...variableCommonOrg,
    type: VariableType.String,
    spec: {
      ...StringFixed
    }
  }
}

export const StringFixedPayloadProj = {
  variable: {
    ...variableFormProject,
    type: VariableType.String,
    spec: {
      ...StringFixed
    }
  }
}
