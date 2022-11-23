/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import TFRemoteSection from '../InputSteps/RemoteVarSection'

const defaultProps = {
  remoteVar: {
    varFile: {
      identifier: 'plan var id',
      type: 'Remote',
      spec: {
        store: {
          type: 'Artifactory',
          spec: {
            repositoryName: '',
            connectorRef: 'test connector',
            artifactPaths: ''
          }
        }
      }
    }
  },
  initialValues: {
    spec: {
      configuration: {
        varFiles: [
          {
            varFile: {
              identifier: 'plan var id',
              type: 'Remote',
              spec: {
                store: {
                  type: 'Artifactory',
                  spec: {
                    repositoryName: '',
                    connectorRef: '',
                    artifactPaths: ''
                  }
                }
              }
            }
          }
        ]
      }
    }
  },
  formik: {
    values: {
      stages: [
        {
          stage: {
            spec: {
              infrastructure: {
                infrastructureDefinition: {
                  provisioner: {
                    steps: [
                      {
                        step: {
                          identifier: 'tfApply',
                          type: 'TerraformApply',
                          spec: {
                            configuration: {
                              varFiles: [
                                {
                                  varFile: {
                                    identifier: 'plan var id',
                                    type: 'Remote',
                                    spec: {
                                      store: {
                                        type: 'Artifactory',
                                        spec: {
                                          repositoryName: '',
                                          connectorRef: '',
                                          artifactPaths: ''
                                        }
                                      }
                                    }
                                  }
                                }
                              ]
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
        }
      ]
    }
  },
  path: 'stages[0].stage.spec.infrastructure.infrastructureDefinition.provisioner.steps[0].step',
  index: 0,
  readonly: false,
  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
}

const repoMock = {
  data: {
    repositories: {
      testRepo: 'generic-local',
      anotherRepo: 'generic repo'
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetRepositoriesDetailsForArtifactory: () => ({
    loading: false,
    data: repoMock,
    refetch: jest.fn()
  })
}))

const renderForm = (props: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <TFRemoteSection {...props} />
    </TestWrapper>
  )
}

describe('Config section tests', () => {
  test('initial render with basic data', async () => {
    const { container } = renderForm(defaultProps)
    expect(container).toMatchSnapshot()
  })
  test('render with artifactory data', async () => {
    defaultProps.remoteVar.varFile.spec.store.spec.repositoryName = '<+input>'
    defaultProps.remoteVar.varFile.spec.store.spec.artifactPaths = '<+input>'
    const { container } = renderForm(defaultProps)
    expect(container).toMatchSnapshot()
  })
})
