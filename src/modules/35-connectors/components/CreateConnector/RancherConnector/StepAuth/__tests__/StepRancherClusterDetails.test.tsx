import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { mockSecret } from '@connectors/components/CreateConnector/RancherConnector/__tests__/rancherMock'

import StepRancherClusterDetails from '../StepRancherClusterDetails'

const updateConnector = jest.fn()
const createConnector = jest.fn()

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  onConnectorCreated: noop,
  setIsEditMode: noop,
  hideModal: noop
}
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('StepRacnherClusterDetails', () => {
  test('render ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StepRancherClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={false}
          connectorInfo={{ name: 'rancher', identifier: 'id', type: 'Rancher', spec: {} } as any}
        />
      </TestWrapper>
    )

    fireEvent.click(getByText('continue'))
    fireEvent.click(container.querySelector('input[value="ManualConfig"]')!)
    await waitFor(() => expect(getByText('validation.accessToken')).toBeDefined())

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'rancherUrl',
        value: 'dummyRancherUrl'
      }
    ])
  })
  test('render edit mode ', async () => {
    const { getByText } = render(
      <TestWrapper>
        <StepRancherClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dummyname',
              identifier: 'dummyId',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'Rancher',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    rancherUrl: 'dummyRancherUrl',
                    auth: {
                      type: 'Bearer Token',
                      spec: { passwordRef: 'account.abc123' }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
  })
})
