/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, queryByText, fireEvent, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockBitBucketSCM, mockSecretResponse } from '@user-profile/utils/__tests__/mockData'
import SourceCodeManagerForm from '../SourceCodeManagerForm'

const pathParams = { accountId: 'dummy' }

const getSecret = jest.fn(() => mockSecretResponse)
const saveSourceCodeManager = jest.fn()
const updateSourceCodeManager = jest.fn()

jest.mock('services/cd-ng', () => ({
  getSecretV2Promise: jest.fn().mockImplementation(() => getSecret()),
  useSaveSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { mutate: saveSourceCodeManager, loading: false, data: mockBitBucketSCM }
  }),
  useUpdateSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { mutate: updateSourceCodeManager, loading: false, data: mockBitBucketSCM }
  })
}))

describe('Test SourceCodeManagerForm', () => {
  test('Should render SourceCodeManagerForm for new User with default state', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <SourceCodeManagerForm onSubmit={noop} onClose={noop} />
      </TestWrapper>
    )
    //By defult Github provider type should be supported
    await waitFor(() => expect(queryByText(container, 'common.repo_provider.githubLabel')).toBeInTheDocument())
    // User should get option to change SCM
    expect(queryByText(container, 'change')).toBeInTheDocument()
    //Defult authType type PAT should be preselected
    expect(queryByText(container, 'personalAccessToken')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Options to select another SCM should be available
    const changeButton = getByText('change')
    act(() => {
      fireEvent.click(changeButton)
    })
    await waitFor(() => expect(queryByText(container, 'change')).toBeNull())
    expect(queryByText(container, 'common.repo_provider.bitbucketLabel')).toBeInTheDocument()
  })

  test('Should render SourceCodeManagerForm for existing User with bitBucket SCM', async () => {
    const { container } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <SourceCodeManagerForm onSubmit={noop} onClose={noop} initialValues={mockBitBucketSCM} />
      </TestWrapper>
    )
    //Secret should be aoto filled
    await waitFor(() => expect(findByText(container, 'dummySecret')).not.toBeNull())
    expect(queryByText(container, 'common.repo_provider.bitbucketLabel')).toBeInTheDocument()
    //AuthType type Password should be auto selected
    expect(queryByText(container, 'password')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
