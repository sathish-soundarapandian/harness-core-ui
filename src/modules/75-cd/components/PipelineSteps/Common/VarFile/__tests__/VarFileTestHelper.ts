/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

export const formikValues = {
  values: {
    spec: {
      configuration: {
        spec: {
          varFiles: [
            {
              varFile: {
                identifier: 'plan var id',
                type: 'Remote',
                spec: {
                  type: 'Git',
                  store: {
                    spec: {
                      gitFetchType: 'Branch',
                      branch: '',
                      connectorRef: '',
                      paths: ''
                    }
                  }
                }
              }
            },
            {
              varFile: {
                identifier: 'plan id',
                type: 'Inline',
                spec: {
                  content: 'test'
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const formikValuesforArtifactoryForm = {
  values: {
    spec: {
      configuration: {
        spec: {
          varFiles: [
            {
              varFile: {
                identifier: 'plan var id',
                type: 'Remote',
                spec: {
                  type: 'Artifactory',
                  spec: {
                    repositoryName: '',
                    connectorRef: '',
                    artifactPaths: ''
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const remoteWizardProps = {
  name: 'Terraform Var File Details',
  onSubmitCallBack: jest.fn(),
  isEditMode: true,
  previousStep: jest.fn(),
  prevStepData: {
    varFile: {
      identifier: 'test',
      spec: {
        store: {
          spec: {
            branch: 'testBranch',
            gitFetchType: 'Branch',
            paths: ['path1'],
            repoName: 'repo name',
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
        }
      }
    }
  },
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
}
