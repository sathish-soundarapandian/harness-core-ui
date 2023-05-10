/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as cdNg from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import AccessTokenCalloutForCommit from '../AccessTokenCalloutForCommit'
import { githubConnectorMock, userAccessTokenMock } from './mockData'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'defaultproject' }
const refetchUserAccessTokenMock = jest.fn(() => Promise.resolve(userAccessTokenMock))
const userAccessTokenMockWithNoData = {
  status: 'SUCCESS',
  data: {
    userSourceCodeManagerResponseDTOList: []
  },
  metaData: null,
  correlationId: 'dummy'
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: githubConnectorMock }
  }),
  useSaveUserSourceCodeManager: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetUserSourceCodeManagers: jest
    .fn()
    .mockImplementation(() => ({ data: userAccessTokenMock, refetch: () => refetchUserAccessTokenMock() }))
}))

describe('AccessTokenCalloutForCommit test suite', () => {
  test('It should show correct messgae with userName if accessToken is availble', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenCalloutForCommit connectorIdWithScope="sunnyGithub" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(getByText('common.oAuth.usingUserAccessToken')).toBeInTheDocument()
    })

    expect(refetchUserAccessTokenMock).toBeCalled()
    expect(document.querySelector('.bp3-callout')?.classList?.contains('callout')).toEqual(true)
    expect(document.querySelector('.bp3-callout')?.classList?.contains('calloutWarning')).toEqual(false)
  })

  test('It should show setUp accessToken messgae if accessToken is not availble', async () => {
    jest.spyOn(cdNg, 'useGetUserSourceCodeManagers').mockImplementation((): any => {
      return { data: userAccessTokenMockWithNoData, refetch: () => Promise.resolve(userAccessTokenMockWithNoData) }
    })
    const { getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenCalloutForCommit connectorIdWithScope="sunnyGithub" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(getByText('common.oAuth.setUpUserAccessTokenMessage')).toBeInTheDocument()
    })
    expect(document.querySelector('.bp3-callout')?.classList?.contains('calloutWarning')).toEqual(true)
  })

  test('It should show setUp accessToken messgae if accessToken is not availble', async () => {
    jest.spyOn(cdNg, 'useGetUserSourceCodeManagers').mockImplementation((): any => {
      return {
        data: userAccessTokenMockWithNoData,
        refetch: () => Promise.resolve(userAccessTokenMockWithNoData),
        loading: true
      }
    })
    const { getByText, container } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenCalloutForCommit connectorIdWithScope="sunnyGithub" />
      </TestWrapper>
    )

    expect(getByText('common.oAuth.fetchingUserAccessTokens')).toBeInTheDocument()
    expect(document.querySelector('.bp3-callout')?.classList?.contains('calloutWarning')).toEqual(true)
    // This is just a single text snapshot to test that it is rendered with correct state
    expect(container).toMatchSnapshot()
  })

  test('Connector API failure should not show Oauth userName', async () => {
    refetchUserAccessTokenMock.mockReset()
    jest.spyOn(cdNg, 'useGetConnector').mockImplementation((): any => {
      return {
        data: { status: 'FAILURE' }
      }
    })
    render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenCalloutForCommit connectorIdWithScope="sunnyGithub" />
      </TestWrapper>
    )

    expect(document.querySelector('.bp3-callout')?.classList?.contains('calloutWarning')).toEqual(true)
    expect(refetchUserAccessTokenMock).not.toBeCalled()
  })

  test('Access token API failure should not show Oauth userName', async () => {
    jest.spyOn(cdNg, 'useGetUserSourceCodeManagers').mockImplementation((): any => {
      return {
        data: { status: 'FAILURE', data: {}, metaData: null, correlationId: 'dummy' },
        refetch: () => Promise.resolve({ status: 'FAILURE', data: {}, metaData: null, correlationId: 'dummy' }),
        loading: false
      }
    })
    const { getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenCalloutForCommit connectorIdWithScope="sunnyGithub" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(getByText('common.oAuth.setUpUserAccessTokenMessage')).toBeInTheDocument()
    })
  })
})
