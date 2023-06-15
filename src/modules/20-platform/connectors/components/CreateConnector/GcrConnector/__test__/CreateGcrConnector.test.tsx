/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { mockResponse, mockSecret, encryptedKeyMock } from './mocks'
import CreateGcrConnector from '../CreateGcrConnector'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

const createConnector = jest.fn()
const updateConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => {
    return {
      data: {
        status: 'SUCCESS',
        data: {
          status: 'SUCCESS',
          errors: null,
          errorSummary: null,
          testedAt: 1610018411047,
          delegateId: 'delegateId'
        },
        metaData: null,
        correlationId: 'e81aaf6f-582c-4bc1-a9af-8d4e972858be'
      },
      refetch: jest.fn(),
      error: null
    }
  })
}))

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('Create GCP connector Wizard', () => {
  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGcrConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    // match step 1
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // match step 2
    expect(container).toMatchSnapshot()
  })

  test('Should render form for edit authtype encryptedKey', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGcrConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={encryptedKeyMock as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'connectors.GCP.delegateOutClusterInfo')).toBeDefined()
    expect(container).toMatchSnapshot()

    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // expect(updateConnector).toBeCalledWith({
    //   connector: {
    //     description: 'devConnector description',
    //     identifier: 'devConnector',
    //     name: 'dummy name',
    //     orgIdentifier: '',
    //     projectIdentifier: '',
    //     spec: {
    //       credential: {
    //         spec: {
    //           secretKeyRef: 'account.s15656'
    //         },
    //         type: 'ManualConfig'
    //       }
    //     },
    //     tags: {},
    //     type: 'Gcr'
    //   }
    // })
  })
})
