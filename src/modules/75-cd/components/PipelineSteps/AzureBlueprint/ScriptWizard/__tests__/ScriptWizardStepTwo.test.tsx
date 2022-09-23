/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ScriptWizardStepTwo } from '../ScriptWizardStepTwo'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <ScriptWizardStepTwo
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        handleSubmit={jest.fn()}
        isReadonly={false}
        {...props}
      />
    </TestWrapper>
  )
}

describe('ScriptWizardStepTwo', () => {
  test('should render stepTwo', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: 'account.BBsaasAmit',
                  gitFetchType: 'Commit',
                  folderPath: 'filePath',
                  TemplatePath: 'commitId'
                }
              }
            }
          }
        }
      }
    }
    const { getByText } = renderComponent(props)
    const submit = getByText('submit')
    expect(submit).toBeDefined()
  })

  test('runtime inputs', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Commit',
                  folderPath: RUNTIME_INPUT_VALUE,
                  repoName: RUNTIME_INPUT_VALUE,
                  commitId: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    }

    const { getByText } = renderComponent(props)

    const gitFetchTypeLabel = getByText('pipeline.manifestType.gitFetchTypeLabel')
    expect(gitFetchTypeLabel).toBeInTheDocument()

    const commitId = getByText('pipeline.manifestType.commitId')
    expect(commitId).toBeInTheDocument()

    const templatePath = getByText('cd.azureBlueprint.templateFolderPath')
    expect(templatePath).toBeInTheDocument()
  })

  test('git fetch type branch as runtime', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Branch',
                  folderPath: RUNTIME_INPUT_VALUE,
                  repoName: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      },
      prevStepData: {
        urlType: 'Account'
      }
    }

    const { getByText } = renderComponent(props)

    const repositoryName = getByText('common.repositoryName')
    expect(repositoryName).toBeInTheDocument()

    const gitFetchTypeLabel = getByText('pipeline.manifestType.gitFetchTypeLabel')
    expect(gitFetchTypeLabel).toBeInTheDocument()

    const branch = getByText('pipelineSteps.deploy.inputSet.branch')
    expect(branch).toBeInTheDocument()

    const templatePath = getByText('cd.azureBlueprint.templateFolderPath')
    expect(templatePath).toBeInTheDocument()
  })

  test('account repo type', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Branch',
                  folderPath: RUNTIME_INPUT_VALUE,
                  repoName: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      },
      prevStepData: {
        urlType: 'Account'
      }
    }

    const { container } = renderComponent(props)
    expect(container).toMatchSnapshot()
  })

  test('empty values', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Bitbucket'
              }
            }
          }
        }
      }
    }

    const { container } = renderComponent(props)

    const branch = queryByAttribute('name', container, 'branch')
    expect(branch).toHaveDisplayValue('')
    userEvent.clear(branch!)
    userEvent.type(branch!, 'main')
    expect(branch).toHaveDisplayValue('main')

    const folderPath = queryByAttribute('name', container, 'folderPath')
    expect(folderPath).toHaveDisplayValue('')
    userEvent.clear(folderPath!)
    userEvent.type(folderPath!, 'main')
    expect(folderPath).toHaveDisplayValue('main')
  })

  test('should render harness option', async () => {
    const props = {
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Harness',
                spec: {
                  files: ['account:/testFile']
                }
              }
            }
          }
        }
      },
      prevStepData: {
        store: 'Harness'
      }
    }

    const { getByText } = renderComponent(props)
    const fileType = getByText('pipeline.configFiles.selectFileType')
    expect(fileType).toBeInTheDocument()
  })
})
