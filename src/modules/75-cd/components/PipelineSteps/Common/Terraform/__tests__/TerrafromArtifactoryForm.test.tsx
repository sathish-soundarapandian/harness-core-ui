/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { TFArtifactoryForm } from '../Editview/TerraformArtifactoryForm'

const props = {
  onSubmitCallBack: jest.fn(),
  previousStep: jest.fn(),
  isConfig: true,
  isTerraformPlan: true,
  allowableTypes: [
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.FIXED
  ] as AllowedTypesWithRunTime[]
}

const repoMock = {
  data: {
    repositories: {
      testRepo: 'generic-local',
      anotherRepo: 'generic repo'
    }
  }
}

const artifactsMock = {
  data: [
    {
      artifactName: 'config.tf.zip',
      artifactPath: 'generic-local/terraform/config.tf.zip'
    },
    {
      artifactName: 'localresource.tfvar.zip',
      artifactPath: 'generic-local/terraform/localresource.tfvar.zip'
    }
  ]
}

jest.mock('services/cd-ng', () => ({
  useGetRepositoriesDetailsForArtifactory: () => ({
    loading: false,
    data: repoMock,
    refetch: jest.fn()
  }),
  useGetArtifactsBuildsDetailsForArtifactory: () => ({
    loading: false,
    data: artifactsMock,
    refetch: jest.fn()
  })
}))

const renderForm = (prevStepData: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <TFArtifactoryForm {...props} prevStepData={prevStepData} />
    </TestWrapper>
  )
}

describe('Terraform artifactory tests', () => {
  test('initial render', async () => {
    const prevStepData = {
      identifier: 'test',
      formValues: {
        spec: {
          configuration: {
            command: 'Apply',
            configFiles: {
              store: {
                spec: {
                  connectorRef: {},
                  repositoryName: ''
                }
              }
            }
          }
        }
      }
    }
    const { container } = renderForm(prevStepData)
    expect(container).toMatchSnapshot()
  })

  test('initial render with form data for config in tf plan', async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            command: 'Apply',
            configFiles: {
              store: {
                spec: {
                  connectorRef: {
                    name: 'test',
                    identifier: 'test',
                    description: '',
                    orgIdentifier: 'default',
                    projectIdentifier: 'test',
                    type: 'Artifactory'
                  },
                  artifactPaths: [{ path: 'generic-local/terraform/config' }],
                  repositoryName: 'generic-local'
                }
              }
            }
          }
        }
      }
    }
    const { container } = renderForm(prevStepData)
    expect(container).toMatchSnapshot()
  })

  test('initial render with no form data for config and tf apply/destroy', async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    connectorRef: {},
                    repositoryName: ''
                  }
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    const { container } = renderForm(prevStepData)
    expect(container).toMatchSnapshot()
  })

  test('initial render with form data for config and tf apply/destroy', async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  type: 'Artifactory',
                  spec: {
                    connectorRef: {
                      connector: {
                        name: 'test',
                        identifier: 'test',
                        description: '',
                        orgIdentifier: 'default',
                        projectIdentifier: 'test',
                        type: 'Artifactory'
                      }
                    },
                    artifactPaths: [{ path: 'generic-local/terraform/config' }],
                    repositoryName: 'generic-local'
                  }
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    const { container } = renderForm(prevStepData)
    expect(container).toMatchSnapshot()
  })

  test('initial render with form data for var files ', async () => {
    const prevStepData = {
      varFile: {
        type: 'Remote',
        identifier: 'var file id',
        spec: {
          store: {
            type: 'Artifactory',
            spec: {
              repositoryName: 'generic-local',
              artifactPaths: [{ path: 'generic-local/terraform/config' }],
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'project',
                live: true,
                connector: {
                  name: 'test',
                  identifier: 'test',
                  orgIdentifier: 'default',
                  projectIdentifier: 'test',
                  type: 'Artifactory'
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = true
    props.isConfig = false
    const { container, getByText } = renderForm(prevStepData)
    const plusButton = getByText('cd.addTFVarFileLabel')

    //add, change value and submit
    await fireEvent.click(plusButton)

    fireEvent.change(container.querySelector('input[name="varFile.spec.store.spec.artifactPaths[1].path"]')!, {
      target: { value: 'test' }
    })
    const submitButton = getByText('submit')
    await fireEvent.click(submitButton)
    expect(container).toMatchSnapshot()
  })

  test('test submitting when terraform plan form', async () => {
    const prevStepData = {
      varFile: {
        type: 'Remote',
        identifier: 'var file id',
        spec: {
          store: {
            type: 'Artifactory',
            spec: {
              repositoryName: 'generic-local',
              artifactPaths: [{ path: 'generic-local/terraform/config' }],
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'project',
                live: true,
                connector: {
                  name: 'test',
                  identifier: 'test',
                  orgIdentifier: 'default',
                  projectIdentifier: 'test',
                  type: 'Artifactory'
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    props.isConfig = false
    const { container, getByText } = renderForm(prevStepData)
    const submitButton = getByText('submit')
    await fireEvent.click(submitButton)
    expect(container).toMatchSnapshot()
  })

  test('test click previous button', async () => {
    const prevStepData = {
      varFile: {
        type: 'Remote',
        identifier: 'var file id',
        spec: {
          store: {
            type: 'Artifactory',
            spec: {
              repositoryName: 'generic-local',
              artifactPaths: [{ path: 'generic-local/terraform/config' }],
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'project',
                live: true,
                connector: {
                  name: 'test',
                  identifier: 'test',
                  orgIdentifier: 'default',
                  projectIdentifier: 'test',
                  type: 'Artifactory'
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    props.isConfig = true
    const { container, getByText } = renderForm(prevStepData)
    const prevButton = getByText('back')
    await fireEvent.click(prevButton)
    expect(container).toMatchSnapshot()
  })

  test('submit when it is a config form', async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  type: 'Artifactory',
                  spec: {
                    connectorRef: {
                      connector: {
                        name: 'test',
                        identifier: 'test',
                        description: '',
                        orgIdentifier: 'default',
                        projectIdentifier: 'test',
                        type: 'Artifactory'
                      }
                    },
                    artifactPaths: [
                      { path: 'generic-local/terraform/config' },
                      { path: 'generic-local/terraform/tfConfig' }
                    ],
                    repositoryName: 'generic-local'
                  }
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    props.isConfig = true
    const { container, getByText } = renderForm(prevStepData)
    const submitButton = getByText('submit')
    await fireEvent.click(submitButton)
    expect(container).toMatchSnapshot()
  })

  test('when deleting a artifact path', async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  type: 'Artifactory',
                  spec: {
                    connectorRef: {
                      connector: {
                        name: 'test',
                        identifier: 'test',
                        description: '',
                        orgIdentifier: 'default',
                        projectIdentifier: 'test',
                        type: 'Artifactory'
                      }
                    },
                    artifactPaths: [
                      { path: 'generic-local/terraform/config' },
                      { path: 'generic-local/terraform/tfConfig' }
                    ],
                    repositoryName: 'generic-local'
                  }
                }
              }
            }
          }
        }
      }
    }
    props.isTerraformPlan = false
    props.isConfig = false
    const { container, getByTestId } = renderForm(prevStepData)
    const deletePath = getByTestId('remove-header-0')
    await fireEvent.click(deletePath)
    expect(container).toMatchSnapshot()
  })
})
