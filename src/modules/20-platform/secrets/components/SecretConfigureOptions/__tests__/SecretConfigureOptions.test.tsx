/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdNgService from 'services/cd-ng'
import { SecretConfigureOptions, SecretConfigureOptionsProps } from '../SecretConfigureOptions'
import { projectSecretsResponse } from './mock'

const openConfigureOptionsModal = async (baseElement: HTMLElement): Promise<void> => {
  const configureOptionsButton = await waitFor(() => {
    const button = queryByAttribute('id', baseElement, 'configureOptions_secret_var')
    expect(button).toBeInTheDocument()
    return button
  })

  userEvent.click(configureOptionsButton!)
  expect(await screen.findByText('common.configureOptions.configureOptions')).toBeInTheDocument()
}

const selectAllowedValuesRadio = async (): Promise<void> => {
  const allowedValuesRadio = await screen.findByDisplayValue('AllowedValues')
  userEvent.click(allowedValuesRadio)
}

describe('<SecretConfigureOptions />', () => {
  const secretConfigureOptionsProps: SecretConfigureOptionsProps = {
    value: '<+input>',
    type: 'Secret',
    variableName: 'secret_var',
    isReadonly: false
  }

  test('should select Secrets as allowed values', async () => {
    jest.spyOn(cdNgService, 'listSecretsV2Promise').mockResolvedValue(projectSecretsResponse)

    const onChange = jest.fn()
    const { baseElement } = render(
      <TestWrapper>
        <SecretConfigureOptions {...secretConfigureOptionsProps} onChange={onChange} />
      </TestWrapper>
    )

    await openConfigureOptionsModal(baseElement)
    await selectAllowedValuesRadio()

    const placeholder = await screen.findByText('secrets.selectSecrets')
    userEvent.click(placeholder)
    const accountTab = await screen.findByText('account')
    userEvent.click(accountTab)

    const secretToSelect = await screen.findByText('secret_test_1')
    const anotherSecretToSelect = screen.getByText('secret_test_2')
    userEvent.click(secretToSelect)
    userEvent.click(anotherSecretToSelect)

    const applyButton = screen.getByText('entityReference.apply')
    await waitFor(() => expect(applyButton).toBeEnabled())
    userEvent.click(applyButton)

    await waitFor(() => expect(accountTab).not.toBeInTheDocument())

    userEvent.click(screen.getByText(/submit/i))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        '<+input>.allowedValues(account.secret_test_1,account.secret_test_2)',
        undefined,
        undefined
      )
    )
  })

  test('should render an error if submit is clicked without selecting any Secrets', async () => {
    const { baseElement } = render(
      <TestWrapper>
        <SecretConfigureOptions {...secretConfigureOptionsProps} />
      </TestWrapper>
    )

    await openConfigureOptionsModal(baseElement)
    await selectAllowedValuesRadio()

    const placeholder = await screen.findByText('secrets.selectSecrets')
    expect(placeholder).toBeInTheDocument()

    userEvent.click(screen.getByText(/submit/i))

    expect(await screen.findByText('common.configureOptions.validationErrors.minOneAllowedValue')).toBeInTheDocument()
  })
})
