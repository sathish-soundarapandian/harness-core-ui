/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Formik, MultiTypeInputType } from '@wings-software/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import ConfigSection from '../InputSteps/TfConfigSection'

const defaultProps = {
  inputSetData: {
    template: {
      spec: {
        configuration: {
          type: 'Inline',
          spec: {
            configFiles: {
              store: {
                type: 'Artifactory',
                spec: {
                  connectorRef: '',
                  repositoryName: '',
                  artifactPaths: ''
                }
              }
            }
          }
        }
      }
    }
  },
  initialValues: {
    spec: {
      configuration: {
        spec: {
          configFiles: {
            store: {
              spec: {
                connectorRef: ''
              }
            }
          }
        }
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
                              type: 'Inline',
                              spec: {
                                configFiles: {
                                  store: {
                                    type: 'Artifactory',
                                    spec: {
                                      connectorRef: '',
                                      repositoryName: ''
                                    }
                                  }
                                }
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
          }
        }
      ]
    }
  },
  path: 'stages[0].stage.spec.infrastructure.infrastructureDefinition.provisioner.steps[0].step',
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
      <Formik formName="TFConfigSection" onSubmit={noop} initialValues={{}}>
        <ConfigSection {...props} />
      </Formik>
    </TestWrapper>
  )
}

describe('Config section tests', () => {
  test('initial render with basic data', async () => {
    const { container } = renderForm(defaultProps)
    expect(container).toMatchSnapshot()
  })
  test('render with artifactory data', async () => {
    defaultProps.inputSetData.template.spec.configuration.spec.configFiles.store.spec.repositoryName = '<+input>'
    defaultProps.inputSetData.template.spec.configuration.spec.configFiles.store.spec.artifactPaths = '<+input>'
    const { container } = renderForm(defaultProps)
    expect(container).toMatchSnapshot()
  })
})
