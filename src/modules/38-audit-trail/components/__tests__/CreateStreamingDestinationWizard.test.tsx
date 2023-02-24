/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
  RenderResult,
  queryByAttribute,
  queryByText,
  findByText as findByTextFromRTL,
  getByText as getByTextFromRTL
} from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import {
  validateUniqueIdentifier,
  createStreamingDestinations,
  updateStreamingDestination
} from '@harnessio/react-audit-service-client'

import { VIEWS } from '@audit-trail/pages/AuditTrails/AuditTrailsPage'
import {
  mockResponseCreateOrUpdateStreamingDestination,
  mockAggregateListResponse
} from '@audit-trail/pages/AuditTrails/views/__tests__/mockAuditLogStreaming'
import routes from '@common/RouteDefinitions'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import { CreateStreamingDestinationWizard } from '../CreateStreamingDestination/CreateStreamingDestinationWizard'
import { logStreamingConnectorListMock, getConnectorResponseMock } from './mockData'

const getConnector = jest.fn(() => Promise.resolve(getConnectorResponseMock))
const getConnectorList = jest.fn(() => Promise.resolve(logStreamingConnectorListMock))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ refetch: getConnector, loading: false })),
  getConnectorListPromise: jest.fn().mockImplementation(() => {
    return getConnectorList()
  })
}))

jest.mock('@harnessio/react-audit-service-client')
const validateUniqueIdentifierMock = validateUniqueIdentifier as jest.MockedFunction<any>
validateUniqueIdentifierMock.mockImplementation(() => {
  return true
})
const updateStreamingDestinationMock = updateStreamingDestination as jest.MockedFunction<any>
updateStreamingDestinationMock.mockImplementation(() => {
  return Promise.resolve(mockResponseCreateOrUpdateStreamingDestination)
})
const createStreamingDestinationsMock = createStreamingDestinations as jest.MockedFunction<any>
createStreamingDestinationsMock.mockImplementation(() => {
  return mockResponseCreateOrUpdateStreamingDestination
})

const setIsEditMode = jest.fn()

const commonProps = {
  isEditMode: false,
  setIsEditMode: setIsEditMode
}

describe('CreateStreamingDestinationWizard Create Flow', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.AUDIT_LOG_STREAMING }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <CreateStreamingDestinationWizard {...commonProps} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('auditTrail.streamingDestination'))
  })

  test('Create flow step one and step two', async () => {
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    await act(async () => {
      clickSubmit(container)
    })

    const connnectorRefInput = queryByAttribute('data-testid', container, /connector_ref/) as HTMLInputElement

    expect(connnectorRefInput).toBeTruthy()
    fireEvent.click(connnectorRefInput!)

    await waitFor(() => expect(getConnectorList).toHaveBeenCalledTimes(1))

    const connectorName = logStreamingConnectorListMock.data.content[0].connector.name
    const connectorName2 = logStreamingConnectorListMock.data.content[1].connector.name

    const dialogList = document.getElementsByClassName('bp3-dialog')
    const firstDialogElement = dialogList[0] as HTMLElement
    expect(firstDialogElement).toBeTruthy()

    const connector = await findByTextFromRTL(firstDialogElement as HTMLElement, connectorName)
    expect(connector).toBeTruthy()
    const connector2 = await findByTextFromRTL(firstDialogElement as HTMLElement, connectorName2)
    expect(connector2).toBeTruthy()
    await act(async () => {
      fireEvent.click(connector)
    })

    const applySelected = getByTextFromRTL(firstDialogElement, 'entityReference.apply')
    expect(applySelected).toBeTruthy()
    await act(async () => {
      fireEvent.click(applySelected)
    })

    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'bucket',
        value: 'testBucketName'
      }
    ])
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    await waitFor(() => expect(createStreamingDestinationsMock).toBeCalledTimes(1))
    await waitFor(() =>
      expect(createStreamingDestinationsMock).toHaveBeenCalledWith({
        body: {
          connector_ref: 'account.ListIdentifier1',
          description: '',
          identifier: 'dummy_name',
          name: 'dummy name',
          spec: {
            bucket: 'testBucketName',
            type: 'AWS_S3'
          },
          status: 'INACTIVE',
          tags: {}
        }
      })
    )
  })
})

describe('CreateStreamingDestinationWizard edit flow', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.AUDIT_LOG_STREAMING }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <CreateStreamingDestinationWizard {...commonProps} isEditMode={true} data={mockAggregateListResponse[0]} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('auditTrail.streamingDestination'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Edit flow step one and step two', async () => {
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    await act(async () => {
      clickSubmit(container)
    })

    await waitFor(() => {
      getAllByText('auditTrail.logStreaming.streamingConnector')
    })

    const connnectorRefInputBtn = queryByAttribute('data-testid', container, /connector_ref/) as HTMLInputElement

    expect(connnectorRefInputBtn).toBeTruthy()

    await waitFor(() => queryByText(connnectorRefInputBtn, mockAggregateListResponse[0].connector_info.name))

    await act(async () => {
      clickSubmit(container)
    })

    expect(updateStreamingDestinationMock).toBeCalledTimes(1)
    expect(updateStreamingDestinationMock).toBeCalledWith({
      body: {
        connector_ref: 'account.awsConn',
        description: '',
        identifier: 'idWithNoRelationToName',
        name: 'dummy name',
        spec: {
          bucket: 'bucketStopsHere',
          type: 'AWS_S3'
        },
        status: 'INACTIVE',
        streamingDestinationIdentifier: 'idWithNoRelationToName',
        tags: {}
      },
      'streaming-destination': 'idWithNoRelationToName'
    })
  })
})
