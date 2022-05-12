/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServiceMock from 'services/cf'

import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import FlagActivationDetails from '../FlagActivationDetails'

jest.mock('services/cf')

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({
    data: [],
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    EnvironmentSelect: function EnvironmentSelect() {
      return <div />
    }
  })
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagActivationDetails
        gitSync={mockGitSync}
        featureFlag={mockFeature}
        refetchFlag={jest.fn()}
        setGovernanceMetadata={jest.fn()}
      />
    </TestWrapper>
  )
}

describe('FlagActivationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest
      .spyOn(cfServiceMock, 'useGetAllFeatures')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useGetTargetsAndSegmentsInfo')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useGetAllSegments')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useGetAllTargetAttributes')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useGetFeatureEvaluations')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useGetAllTargets')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
    jest
      .spyOn(cfServiceMock, 'useDeleteFeatureFlag')
      .mockReturnValue({ data: [], loading: false, mutate: jest.fn() } as any)
  })

  test('it should render rbac menu correctly', async () => {
    renderComponent()

    userEvent.click(document.querySelectorAll("[data-icon='Options']")[0])

    await waitFor(() => expect(document.getElementsByTagName('li')[0]).toHaveTextContent(/edit/i))
  })

  test('it should render edit flag modal correctly', async () => {
    renderComponent()

    userEvent.click(document.querySelectorAll("[data-icon='Options']")[0])

    await waitFor(() => expect(document.getElementsByTagName('li')[0]).toBeInTheDocument())
    userEvent.click(document.getElementsByTagName('li')[0].getElementsByTagName('a')[0])

    await waitFor(() => expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument())
    expect(screen.getByTestId('edit-flag-form')).toMatchSnapshot()
  })
})
