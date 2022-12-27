/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'

export const props = {
  stepName: 'Manifest details',
  selectedManifest: 'TasManifest' as ManifestTypes,
  manifestIdsList: [],
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  previousStep: jest.fn()
}
export const initialValues = {
  identifier: '',
  branch: undefined,
  commitId: undefined,
  gitFetchType: 'Branch',
  spec: {},
  type: ManifestDataType.TasManifest,
  cfCliVersion: 'V7'
}
export const prevStepData = {
  connectorRef: {
    connector: {
      spec: {
        connectionType: 'Account',
        url: 'accounturl-test'
      }
    }
  },
  store: 'Git'
}
export const fixedValueInitialValues = {
  identifier: 'testidentifier',
  type: ManifestDataType.TasManifest,
  spec: {
    cfCliVersion: 'V7',
    store: {
      spec: {
        branch: 'testBranch',
        commitId: undefined,
        connectorRef: '',
        gitFetchType: 'Branch',
        paths: ['test-path'],
        repoName: ''
      },
      type: undefined
    }
  }
}
export const runtimeInitialValues = {
  identifier: 'testidentifier',
  type: ManifestDataType.TasManifest,
  spec: {
    cfCliVersion: 'V7',
    varsPaths: RUNTIME_INPUT_VALUE,
    autoScalerPath: RUNTIME_INPUT_VALUE,
    store: {
      spec: {
        branch: 'testBranch',
        gitFetchType: 'Branch',
        connectorRef: 'testConnectorRef',
        paths: RUNTIME_INPUT_VALUE
      },
      type: 'Github'
    }
  }
}
export const prevStepDatWithRepoDetails = {
  store: 'Github',
  gitFetchType: 'Branch',
  branch: 'testBranch',
  selectedManifest: 'TasManifest' as ManifestTypes,
  paths: RUNTIME_INPUT_VALUE,
  connectorRef: {
    connector: {
      identifier: 'testConnectorRef',
      name: 'Test Conn Ref',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      type: 'Github',
      spec: {
        type: 'Repo'
      }
    },
    scope: 'Project',
    value: 'testConnectorRef'
  }
}

export const expressionInitialValues = {
  identifier: 'testidentifier',
  type: ManifestDataType.TasManifest,
  spec: {
    cfCliVersion: 'V7',
    varsPaths: ['<+tas.varsPath>'],
    autoScalerPath: ['<+tas.autoScalerPath>'],
    store: {
      spec: {
        branch: 'testBranch',
        gitFetchType: 'Branch',
        connectorRef: 'testConnectorRef',
        paths: ['<+tas.filePath>']
      },
      type: 'Github'
    }
  }
}
