/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as cfServicesMock from 'services/cf'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import { SelectFeatureFlagsModalButton, SelectFeatureFlagsModalButtonProps } from '../SelectFeatureFlagsModalButton'

const renderComponent = (props: Partial<SelectFeatureFlagsModalButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SelectFeatureFlagsModalButton
        gitSync={{ ...mockGitSync, isGitSyncEnabled: false }}
        accountIdentifier="test"
        environmentIdentifier=""
        orgIdentifier=""
        modalTitle="test modal title"
        projectIdentifier=""
        shouldDisableItem={jest.fn()}
        onSubmit={jest.fn().mockResolvedValue({})}
        text="+ Add to Flag"
        {...props}
      />
    </TestWrapper>
  )
}

describe('AddToFlagButton', () => {
  beforeEach(() => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: false, isFreePlan: true })
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })

    jest.spyOn(cfServicesMock, 'useGetAllFeatures').mockReturnValue({
      refetch: jest.fn(),
      data: { features: [mockFeature] },
      loading: false
    } as any)
  })

  test('it should render modal correctly when "Add to Flag" button clicked', async () => {
    renderComponent()

    expect(screen.getByText('+ Add to Flag')).toBeInTheDocument()

    await userEvent.click(screen.getByText('+ Add to Flag'))

    expect(screen.getByText('test modal title')).toBeInTheDocument()

    // assert the flag appears in the list
    expect(screen.getByText('new flag')).toBeInTheDocument()

    // assert buttons
    expect(screen.getByText('add')).toBeInTheDocument()
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  test('it should call callback correctly when "Add" button clicked', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue({})

    renderComponent({ onSubmit: onSubmitMock })

    await userEvent.click(screen.getByText('+ Add to Flag'))

    // select a variation first
    await userEvent.click(screen.getByPlaceholderText('- Select -'))
    await waitFor(() => expect(screen.getByText('True')).toBeInTheDocument())

    await userEvent.click(screen.getByText('True'))

    expect(screen.getByPlaceholderText('- Select -')).toHaveValue('True')

    // await userEvent.click(screen.getByTestId('flag_row_0_input'))
    await waitFor(() => expect(screen.getByTestId('flag_row_0_input')).toBeChecked())

    await userEvent.click(screen.getByText('add'))

    await waitFor(() => expect(onSubmitMock).toBeCalled())

    // assert modal closes
    expect(screen.queryByText('test modal title')).not.toBeInTheDocument()
  })
})
