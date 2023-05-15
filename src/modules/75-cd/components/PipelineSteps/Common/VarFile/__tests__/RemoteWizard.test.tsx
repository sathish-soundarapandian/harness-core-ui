/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { RemoteWizard } from '../RemoteWizard'
import { remoteWizardProps } from './VarFileTestHelper'

describe('Remote Wizard tests', () => {
  test('should be able to load edit mode correctly', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <RemoteWizard {...remoteWizardProps} />
      </TestWrapper>
    )

    const testRepoName = await screen.getByDisplayValue('repo name')
    expect(testRepoName).toBeInTheDocument()

    const testFolderPath = await screen.getByDisplayValue('path1')
    expect(testFolderPath).toBeInTheDocument()

    fireEvent.click(getByText('cd.addTFVarFileLabel')!)
    expect(
      queryByAttribute('name', container, 'varFile.spec.store.spec.paths[1].path') as HTMLInputElement
    ).toBeDefined()

    const deleteQueries = container.querySelectorAll('[data-icon="main-trash"]')
    fireEvent.click(deleteQueries[1])
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
                gitFetchType: 'Branch',
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
    const { container } = render(
      <TestWrapper>
        <RemoteWizard {...defaultProps} />
      </TestWrapper>
    )

    const testFilePath = queryByAttribute('name', container, 'varFile.spec.store.spec.paths')
    expect(testFilePath).toHaveValue('<+input>')
    expect(testFilePath).toBeDisabled()
  })

  test('change Git Fetch Type value to Commit and submit', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <RemoteWizard {...remoteWizardProps} />
      </TestWrapper>
    )

    const gitFetchTypeInput = queryByAttribute(
      'name',
      container,
      'varFile.spec.store.spec.gitFetchType'
    ) as HTMLInputElement
    await userEvent.click(gitFetchTypeInput)
    const specifiCommitIdOption = getByText('gitFetchTypes.fromCommit')
    await waitFor(() => expect(specifiCommitIdOption).toBeInTheDocument())
    await userEvent.click(getByText('gitFetchTypes.fromCommit'))
    await waitFor(() => expect(gitFetchTypeInput.value).toBe('gitFetchTypes.fromCommit'))

    const commitIdInput = container.querySelector('input[name="varFile.spec.store.spec.commitId"]') as HTMLInputElement
    act(() => {
      fireEvent.change(commitIdInput, { target: { value: 'abc123' } })
    })
    await waitFor(() => expect(commitIdInput.value).toBe('abc123'))
    await userEvent.click(getByText('submit').parentElement!)
    await waitFor(() => {
      expect(remoteWizardProps.onSubmitCallBack).toHaveBeenCalledTimes(1)
    })
  })
})
