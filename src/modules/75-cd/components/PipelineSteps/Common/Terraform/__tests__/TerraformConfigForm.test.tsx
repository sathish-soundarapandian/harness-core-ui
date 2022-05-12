/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { TerraformConfigStepOne } from '../Editview/TerraformConfigFormStepOne'
import { TerraformConfigStepTwo } from '../Editview/TerraformConfigFormStepTwo'

const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
let isTerraformPlan = false
const renderStepOneComponent = (data: any): void => {
  render(
    <TestWrapper>
      <TerraformConfigStepOne
        data={data}
        isReadonly={false}
        isEditMode={false}
        allowableTypes={allowableTypes}
        setConnectorView={jest.fn()}
        setSelectedConnector={jest.fn()}
        selectedConnector={'Git'}
        isTerraformPlan={isTerraformPlan}
      />
    </TestWrapper>
  )
}

const testData = {
  spec: {
    configuration: {
      spec: {
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              skipResourceVersioning: false,
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'Git',
                  gitFetchType: 'Branch',
                  branch: 'master',
                  repoName: 'repoName',
                  commidId: undefined
                }
              }
            }
          }
        }
      }
    }
  }
}

describe('TerraformConfigForm StepOne tests', () => {
  test(`renders without crashing with no initial data`, async () => {
    renderStepOneComponent({})
    // all connector options displayed
    const gitConnector = await screen.findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()

    const gitlabConnector = await screen.findByTestId('varStore-GitLab')
    expect(gitlabConnector).toBeInTheDocument()

    const githubbConnector = await screen.findByTestId('varStore-Github')
    expect(githubbConnector).toBeInTheDocument()

    const bitBucketConnector = await screen.findByTestId('varStore-Bitbucket')
    expect(bitBucketConnector).toBeInTheDocument()
  })

  test(`new connector view works correctly`, async () => {
    renderStepOneComponent({})
    const gitConnector = await screen.findByTestId('varStore-Git')
    fireEvent.click(gitConnector)

    const newConnectorLabel = await screen.findByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeInTheDocument()
    fireEvent.click(newConnectorLabel)

    const nextStepButton = await screen.findByText('continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)

    expect(screen).toMatchSnapshot()
  })

  test(`new connector view works correctly with previously selected connector`, () => {
    renderStepOneComponent(testData)

    expect(screen).toMatchSnapshot()
  })

  test(`renders when terraform plan and artifactory`, async () => {
    isTerraformPlan = true
    const testPlanData = {
      spec: {
        configuration: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: {
                      connector: {
                        type: 'Git'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    renderStepOneComponent(testPlanData)

    const artifactoryConnector = await screen.findByTestId('varStore-Artifactory')
    fireEvent.click(artifactoryConnector)
    expect(screen).toMatchSnapshot()
  })

  test(`renders when terraform plan and artifactory`, async () => {
    isTerraformPlan = true
    const testPlanData = {
      spec: {
        configuration: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                connectorRef: {
                  connector: {
                    type: 'Git'
                  }
                }
              }
            }
          }
        }
      }
    }
    renderStepOneComponent(testPlanData)

    const artifactoryConnector = await screen.findByTestId('varStore-Artifactory')
    fireEvent.click(artifactoryConnector)
    expect(screen).toMatchSnapshot()
  })

  test(`renders when terraform plan`, () => {
    isTerraformPlan = true
    const testPlanData = {
      spec: {
        configuration: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                skipResourceVersioning: false,
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: {
                      connector: {
                        type: 'Git'
                      }
                    },
                    gitFetchType: 'Branch',
                    branch: 'master',
                    repoName: 'repoName',
                    commidId: undefined
                  }
                }
              }
            }
          }
        }
      }
    }
    renderStepOneComponent(testPlanData)
    expect(screen).toMatchSnapshot()
  })
})

const renderStepTwoComponent = (data?: any): void => {
  render(
    <TestWrapper defaultAppStoreValues={{ featureFlags: { TF_MODULE_SOURCE_INHERIT_SSH: true } }}>
      <TerraformConfigStepTwo
        isTerraformPlan={isTerraformPlan}
        prevStepData={data}
        isReadonly={false}
        allowableTypes={allowableTypes}
        onSubmitCallBack={jest.fn()}
      />
    </TestWrapper>
  )
}

describe('TerraformConfigForm StepTwo tests', () => {
  test(`renders without crashing with no initial data`, async () => {
    isTerraformPlan = false
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '',
                    gitFetchType: '',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        type: 'Git',
                        spec: {
                          type: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    renderStepTwoComponent(prevStepData)
    // all inputs are displayed
    const fetchType = await screen.findByPlaceholderText('- pipeline.manifestType.gitFetchTypeLabel -')
    expect(fetchType).toBeInTheDocument()

    const folderPath = await screen.findByPlaceholderText('pipeline.manifestType.pathPlaceholder')
    expect(folderPath).toBeInTheDocument()
    expect(screen).toMatchSnapshot()
  })
  test(`renders without crashing with no initial data and when terraform plan`, async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            configFiles: {
              store: {
                spec: {
                  repoName: '',
                  gitFetchType: '',
                  commitId: '',
                  folderPath: '',
                  connectorRef: {
                    connector: {
                      spec: {}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    isTerraformPlan = true
    renderStepTwoComponent(prevStepData)
    // all inputs are displayed
    const fetchType = await screen.findByPlaceholderText('- pipeline.manifestType.gitFetchTypeLabel -')
    expect(fetchType).toBeInTheDocument()

    const folderPath = await screen.findByPlaceholderText('pipeline.manifestType.pathPlaceholder')
    expect(folderPath).toBeInTheDocument()
  })

  test(`loads data in edit mode`, async () => {
    isTerraformPlan = false
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: 'git name',
                    gitFetchType: 'pipelineSteps.commitIdValue',
                    commitId: 'test-commit',
                    folderPath: 'test-folder',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const testRepoName = await screen.getByDisplayValue('git name')
    expect(testRepoName).toBeInTheDocument()

    const testFetchType = await screen.getByDisplayValue('gitFetchTypes.fromCommit')
    expect(testFetchType).toBeInTheDocument()

    const testCommitId = await screen.getByDisplayValue('test-commit')
    expect(testCommitId).toBeInTheDocument()

    const testFolderPath = await screen.getByDisplayValue('test-folder')
    expect(testFolderPath).toBeInTheDocument()
  })

  test(`should show error message when missing fields`, async () => {
    const prevStepData = {
      urlType: 'Account',
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: 'git name',
                    gitFetchType: 'pipelineSteps.commitIdValue',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const submit = await screen.getByText('submit')
    await waitFor(() => {
      fireEvent.click(submit)
    })

    const errorMessage = screen.getByText('pipeline.manifestType.folderPathRequired')
    expect(errorMessage).toBeInTheDocument()
    expect(screen).toMatchSnapshot()
  })

  test(`should not show errors when submitting`, async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '<+input>',
                    gitFetchType: 'pipelineSteps.commitIdValue',
                    commitId: '<+input>',
                    folderPath: '<+input>',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const submit = await screen.getByText('submit')
    await waitFor(() => {
      fireEvent.click(submit)
    })

    expect(screen).toMatchSnapshot()
  })

  test(`can update input fields`, async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '',
                    gitFetchType: 'pipelineSteps.commitIdValue',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const commitPlaceholder = await screen.queryByPlaceholderText('pipeline.manifestType.commitPlaceholder')
    fireEvent.change(commitPlaceholder!, { target: { value: 'test' } })
    expect(screen).toMatchSnapshot()

    const repoName = await screen.queryByPlaceholderText('pipelineSteps.repoName')
    fireEvent.change(repoName!, { target: { value: 'test repo name' } })
    expect(screen).toMatchSnapshot()

    const pathPlaceholder = await screen.queryByPlaceholderText('pipeline.manifestType.pathPlaceholder')
    fireEvent.change(pathPlaceholder!, { target: { value: 'test path' } })
    expect(screen).toMatchSnapshot()
  })

  test(`can update select input field`, async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '',
                    gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const commitPlaceholder = await screen.queryByPlaceholderText('pipeline.manifestType.branchPlaceholder')
    fireEvent.change(commitPlaceholder!, { target: { value: 'test branch' } })
    expect(screen).toMatchSnapshot()
  })

  test(`can press previous button`, async () => {
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '',
                    gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    renderStepTwoComponent(prevStepData)
    const previousButton = await screen.getByTestId('previous-button')
    fireEvent.click(previousButton)
    expect(screen).toMatchSnapshot()
  })

  test(`should show module source section`, async () => {
    isTerraformPlan = false
    const prevStepData = {
      formValues: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    repoName: '',
                    gitFetchType: '',
                    commitId: '',
                    folderPath: '',
                    connectorRef: {
                      connector: {
                        type: 'Git',
                        spec: {
                          type: 'Account'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    renderStepTwoComponent(prevStepData)
    // all inputs are displayed
    const fetchType = await screen.findByPlaceholderText('- pipeline.manifestType.gitFetchTypeLabel -')
    expect(fetchType).toBeInTheDocument()

    const folderPath = await screen.findByPlaceholderText('pipeline.manifestType.pathPlaceholder')
    expect(folderPath).toBeInTheDocument()

    const githubbConnector = await screen.findByTestId('advanced-config-summary')
    expect(githubbConnector).toBeInTheDocument()

    fireEvent.click(githubbConnector)

    const useConnectorCredentials = await screen.findByTestId('useConnectorCredentials')
    expect(useConnectorCredentials).toBeInTheDocument()

    expect(screen).toMatchSnapshot()
  })
})
