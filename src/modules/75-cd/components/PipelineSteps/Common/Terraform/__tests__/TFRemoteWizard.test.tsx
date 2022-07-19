/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { TFRemoteWizard } from '../Editview/TFRemoteWizard'

const props = {
  name: 'Terraform Var File Details',
  onSubmitCallBack: jest.fn(),
  isEditMode: false,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
}

const testProps = {
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
            gitFetchType: 'pipelineSteps.commitIdValue',
            branch: 'test-path',
            paths: ['path1', 'path2'],
            repoName: 'test',
            commitId: 'testCommitID',
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
  },
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
}

describe('Terraform Remote Form tests', () => {
  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <TFRemoteWizard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should be able to load edit mode correctly', async () => {
    const defaultProps = {
      name: 'Terraform Var File Details',
      onSubmitCallBack: jest.fn(),
      isEditMode: true,
      prevStepData: {
        varFile: {
          identifier: 'test',
          spec: {
            store: {
              spec: {
                gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                branch: 'test-path',
                paths: ['path1', 'path2'],
                repoName: 'test',
                commitId: 'testCommitID',
                connectorRef: {
                  connector: {
                    spec: {
                      type: 'Account'
                    }
                  }
                }
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
    const { container, getByText } = render(
      <TestWrapper>
        <TFRemoteWizard {...defaultProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('back'))
    expect(container).toMatchSnapshot()
  })

  test('should be able to remove and add paths', async () => {
    const defaultProps = {
      name: 'Terraform Var File Details',
      onSubmitCallBack: jest.fn(),
      isEditMode: true,
      prevStepData: {
        varFile: {
          identifier: 'test',
          spec: {
            store: {
              spec: {
                gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                branch: 'test-path',
                paths: ['path1', 'path2']
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
    const { container, getByText } = render(
      <TestWrapper>
        <TFRemoteWizard {...defaultProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('cd.addTFVarFileLabel')!)
    expect(container).toMatchSnapshot()
  })

  test('should be able to load edit mode correctly - with runtime inputs', async () => {
    const defaultProps = {
      name: 'Terraform Var File Details',
      onSubmitCallBack: jest.fn(),
      isEditMode: true,
      prevStepData: {
        varFile: {
          identifier: 'test',
          spec: {
            store: {
              spec: {
                gitFetchType: 'pipelineSteps.deploy.inputSet.branch',
                branch: '<+input>',
                paths: '<+input>'
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
    const { container, getByText } = render(
      <TestWrapper>
        <TFRemoteWizard {...defaultProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('submit'))
    expect(container).toMatchSnapshot()
  })

  test('should be able to load with commitId edit mode correctly', () => {
    const defaultProps = {
      name: 'Terraform Var File Details',
      onSubmitCallBack: jest.fn(),
      isEditMode: true,
      prevStepData: {
        varFile: {
          identifer: 'test',
          spec: {
            store: {
              spec: {
                gitFetchType: 'pipelineSteps.commitIdValue',
                commitId: 'test-path',
                paths: ['path1', 'path2']
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
    const { container } = render(
      <TestWrapper>
        <TFRemoteWizard {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render with more data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TFRemoteWizard {...testProps} />
      </TestWrapper>
    )
    //remove path and submit
    const deleteQueries = container.querySelectorAll('[data-icon="main-trash"]')
    fireEvent.click(deleteQueries[0])

    fireEvent.click(getByText('submit'))
    expect(container).toMatchSnapshot()
  })
})
