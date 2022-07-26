/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import TFPlanConfigForm from '../Editview/ConfigForm'

const props = {
  onClick: jest.fn(),
  data: {},
  onHide: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
}

const connectorMock = {
  data: {
    connector: {
      name: 'Git5',
      identifier: 'Git5',
      description: '',
      orgIdentifier: 'CV',
      projectIdentifier: 'Milos2',
      tags: {},
      type: 'Git',
      spec: {
        url: 'https://github.com/wings-software/template-yaml-bugbash.git',
        branchName: null,
        delegateSelectors: [],
        type: 'Http',
        connectionType: 'Repo',
        spec: {
          username: 'AutoUserHarness1',
          usernameRef: null,
          passwordRef: 'GitPass2'
        },
        gitSync: {
          enabled: false,
          customCommitAttributes: null,
          syncEnabled: false
        }
      }
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))
describe('TF Config Form tests', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <TFPlanConfigForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('edit view loads correctly', async () => {
    const editProps = {
      onClick: () => jest.fn(),

      data: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    connectorRef: 'Git5',
                    gitFetchType: 'pipelineSteps.commitIdValue',
                    branch: 'test-branch',
                    folderPath: 'test-folder',
                    commitId: RUNTIME_INPUT_VALUE
                  }
                }
              }
            }
          }
        }
      },
      onHide: () => jest.fn(),
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.EXPRESSION,
        MultiTypeInputType.RUNTIME
      ] as AllowedTypesWithRunTime[]
    }

    const { container } = render(
      <TestWrapper>
        <TFPlanConfigForm {...editProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render runtime correctly', async () => {
    const editProps = {
      onClick: () => jest.fn(),

      data: {
        spec: {
          configuration: {
            spec: {
              configFiles: {
                store: {
                  spec: {
                    connectorRef: {
                      connector: {
                        spec: {
                          connectionType: 'Account'
                        }
                      }
                    },
                    gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                    branch: RUNTIME_INPUT_VALUE,
                    folderPath: RUNTIME_INPUT_VALUE,
                    repoName: RUNTIME_INPUT_VALUE
                  }
                }
              }
            }
          }
        }
      },
      onHide: () => jest.fn(),
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.EXPRESSION,
        MultiTypeInputType.RUNTIME
      ] as AllowedTypesWithRunTime[]
    }

    const { container } = render(
      <TestWrapper>
        <TFPlanConfigForm {...editProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
