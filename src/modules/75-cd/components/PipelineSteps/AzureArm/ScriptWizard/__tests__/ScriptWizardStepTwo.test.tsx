/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ScriptWizardStepTwo } from '../ScriptWizardStepTwo'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <ScriptWizardStepTwo
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        handleSubmit={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('ScriptWizardStepTwo', () => {
  test('should render stepTwo', async () => {
    const props = {
      isReadonly: false,
      isParam: false,
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: 'account.BBsaasAmit',
                  gitFetchType: 'Commit',
                  paths: ['filePath'],
                  commitId: 'commitId'
                }
              }
            }
          }
        }
      }
    }
    const { getByTestId } = renderComponent(props)
    const submit = await getByTestId('submit')
    expect(submit).toBeDefined()
  })

  test('runtime inputs', async () => {
    const props = {
      isReadonly: false,
      isParam: false,
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Branch',
                  paths: RUNTIME_INPUT_VALUE,
                  repoName: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    }

    const { getByText } = renderComponent(props)
    const templatePath = getByText('pipeline.manifestType.osTemplatePath')
    expect(templatePath).toBeInTheDocument()
    const branch = getByText('pipelineSteps.deploy.inputSet.branch')
    expect(branch).toBeInTheDocument()
    const repositoryName = getByText('common.repositoryName')
    expect(repositoryName).toBeInTheDocument()
  })

  test('parameter runtime inputs', async () => {
    const props = {
      isReadonly: false,
      isParam: true,
      initialValues: {
        spec: {
          configuration: {
            parameters: {
              store: {
                type: 'Bitbucket',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Commit',
                  paths: RUNTIME_INPUT_VALUE,
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
    const paramFilePath = getByText('cd.azureArm.paramFilePath')
    expect(paramFilePath).toBeInTheDocument()
    const commit = getByText('pipeline.manifestType.commitId')
    expect(commit).toBeInTheDocument()
    const repositoryName = getByText('common.repositoryName')
    expect(repositoryName).toBeInTheDocument()
  })

  test('render harness option', async () => {
    const props = {
      isReadonly: true,
      isParam: false,
      initialValues: {
        spec: {
          configuration: {
            template: {
              store: {
                type: 'Harness',
                spec: {}
              }
            }
          }
        }
      },
      prevStepData: { store: 'Harness' }
    }

    const { getByText, getAllByText } = renderComponent(props)

    const selectFileType = getByText('pipeline.configFiles.selectFileType')
    expect(selectFileType).toBeInTheDocument()

    const encrypted = getAllByText('encrypted')
    expect(encrypted.length).toEqual(2)
  })

  test('render parameter harness option', async () => {
    const props = {
      isReadonly: true,
      isParam: true,
      initialValues: {
        spec: {
          configuration: {
            parameters: {
              store: {
                type: 'Harness',
                spec: {}
              }
            }
          }
        }
      },
      prevStepData: { store: 'Harness' }
    }

    const { getByText, getAllByText } = renderComponent(props)

    const selectFileType = getByText('pipeline.configFiles.selectFileType')
    expect(selectFileType).toBeInTheDocument()

    const encrypted = getAllByText('encrypted')
    expect(encrypted.length).toEqual(2)
  })
})
