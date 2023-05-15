/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectorConfigureOptions, ConnectorConfigureOptionsProps } from '../ConnectorConfigureOptions'
import { connectorListResponse } from './mocks'

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorListResponse.data.content[1], refetch: jest.fn(), loading: false }
  })
}))

const connectorConfigureOptionsProps: ConnectorConfigureOptionsProps = {
  value: '<+input>',
  type: 'String',
  variableName: 'spec.connectorRef',
  showRequiredField: false,
  showDefaultField: false,
  isReadonly: false,
  connectorReferenceFieldProps: {
    accountIdentifier: 'accountIdentifier',
    projectIdentifier: 'projectIdentifier',
    orgIdentifier: 'default',
    type: 'Jira',
    label: 'Jira Connector',
    disabled: false
  }
}

const openConfigureOptionsModal = async (): Promise<void> => {
  const configureOptionsButton = queryByAttribute('id', document.body, 'configureOptions_spec.connectorRef')
  expect(configureOptionsButton).toBeInTheDocument()
  await userEvent.click(configureOptionsButton!)
  expect(await screen.findByText('common.configureOptions.configureOptions')).toBeInTheDocument()
}

const selectAllowedValuesRadio = async (): Promise<void> => {
  const allowedValuesRadio = screen.getByDisplayValue('AllowedValues')
  await userEvent.click(allowedValuesRadio)
}

describe('test <ConnectorConfigureOptions />', () => {
  test('can select connectors as allowed values', async () => {
    const onChange = jest.fn()
    render(
      <TestWrapper>
        <ConnectorConfigureOptions {...connectorConfigureOptionsProps} onChange={onChange} />
      </TestWrapper>
    )
    await openConfigureOptionsModal()

    await selectAllowedValuesRadio()

    const placeholder = await screen.findByText('common.entityPlaceholderText')
    await userEvent.click(placeholder)
    const accountTab = await screen.findByText(/^account$/i)
    await userEvent.click(accountTab)

    const connectorToSelect = await screen.findByText('jira_test')
    const applyButton = screen.getByText('entityReference.apply')

    await userEvent.click(connectorToSelect)
    await waitFor(() => expect(applyButton).toBeEnabled())
    await userEvent.click(applyButton)
    await waitFor(() => expect(accountTab).not.toBeInTheDocument())

    const submitButton = screen.getByText(/submit/i)

    await userEvent.click(submitButton)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('<+input>.allowedValues(account.jira_test)', undefined, undefined)
    )
  })

  test('should render an error if submit is clicked without selecting any connectors', async () => {
    render(
      <TestWrapper>
        <ConnectorConfigureOptions {...connectorConfigureOptionsProps} />
      </TestWrapper>
    )
    await openConfigureOptionsModal()

    await selectAllowedValuesRadio()

    const placeholder = await screen.findByText('common.entityPlaceholderText')
    expect(placeholder).toBeInTheDocument()

    const submitButton = screen.getByText(/submit/i)
    await userEvent.click(submitButton)

    expect(await screen.findByText('common.configureOptions.validationErrors.minOneAllowedValue')).toBeInTheDocument()
  })
})
