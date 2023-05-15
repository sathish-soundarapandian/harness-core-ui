/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import SaveFlagRepoStep, { SaveFlagRepoStepProps } from '../SaveFlagRepoStep'

jest.mock('@cf/hooks/useGitSync', () => ({
  useGitSync: jest.fn(() => ({
    getGitSyncFormMeta: jest.fn(() => ({
      gitSyncInitialValues: {
        gitDetails: {
          branch: 'main',
          filePath: '/flags.yaml',
          repoIdentifier: 'harnesstest',
          rootFolder: '/.harness/',
          commitMsg: ''
        },
        autoCommit: false
      },
      gitSyncValidationSchema: yup.object().shape({
        commitMsg: yup.string().required('cf.gitSync.commitMsgRequired')
      })
    })),
    isAutoCommitEnabled: false,
    isGitSyncEnabled: true,
    handleAutoCommit: jest.fn()
  }))
}))

const renderComponent = (props?: Partial<SaveFlagRepoStepProps>): void => {
  const TOTAL_WIZARD_STEPS = (): number => 2

  render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SaveFlagRepoStep
        name="Create Boolean Flag Step 1"
        isLoadingCreateFeatureFlag={false}
        previousStep={jest.fn()}
        nextStep={jest.fn()}
        currentStep={TOTAL_WIZARD_STEPS}
        totalSteps={TOTAL_WIZARD_STEPS}
        prevStepData={{}}
        {...props}
      />
    </TestWrapper>
  )
}

describe('SaveFlagRepoStep', () => {
  test('it should render form data correctly', () => {
    const prevStepData = {
      name: 'test flag',
      identifier: 'testflag1234'
    }
    renderComponent({ prevStepData })

    expect(screen.getByTestId('save-flag-to-git-form')).toHaveFormValues({
      flagName: 'test flag',
      'gitDetails.filePath': '/flags.yaml',
      'gitDetails.rootFolder': '/.harness/',
      'gitDetails.branch': 'main'
    })

    expect(screen.getByText('testflag1234')).toBeInTheDocument()
  })

  test('it should display "Save and Close" button if at end of wizard', async () => {
    const nextStepMock = jest.fn()

    renderComponent({ nextStep: nextStepMock })

    await userEvent.type(screen.getByPlaceholderText('common.git.commitMessage'), 'this is my commit messsage')

    const nextButton = screen.getByText('cf.creationModal.saveAndClose')
    expect(nextButton).toBeInTheDocument()

    await userEvent.click(nextButton)

    await waitFor(() =>
      expect(nextStepMock).toHaveBeenCalledWith({
        autoCommit: false,
        gitDetails: {
          commitMsg: 'this is my commit messsage',
          repoIdentifier: 'harnesstest',
          rootFolder: '/.harness/',
          filePath: '/flags.yaml',
          branch: 'main'
        },
        flagIdentifier: '',
        flagName: ''
      })
    )
  })

  test('it should call previousStep callback on "back" click', async () => {
    const previousStepMock = jest.fn()
    const previouStepDataMock = { name: 'test 1' }
    renderComponent({ previousStep: previousStepMock, prevStepData: previouStepDataMock })

    const backButton = screen.getByText('back')
    expect(backButton).toBeInTheDocument()

    await userEvent.click(backButton)

    expect(previousStepMock).toHaveBeenCalledWith(previouStepDataMock)
  })
})
