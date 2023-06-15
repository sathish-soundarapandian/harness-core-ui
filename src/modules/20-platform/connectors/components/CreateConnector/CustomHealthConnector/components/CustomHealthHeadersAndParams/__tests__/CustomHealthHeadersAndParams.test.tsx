/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as secretField from '@secrets/utils/SecretField'
import { CustomHealthHeadersAndParams } from '../CustomHealthHeadersAndParams'
import type { CustomHealthHeadersAndParamsProps } from '../CustomHealthHeadersAndParams.types'
import { SpecHeaders, SpecParams } from './CustomHealthHeadersAndParams.mocks'

const props: CustomHealthHeadersAndParamsProps = {
  prevStepData: {},
  nextStep: jest.fn(),
  connectorInfo: {} as any,
  accountId: '1234_accountId',
  name: 'parameters',
  isEditMode: false,
  addRowButtonLabel: 'Parameters',
  nameOfObjectToUpdate: 'params'
}

describe('Unit tests for CustomHealthHeadersAndParams', () => {
  test('Ensure component shows spinner', async () => {
    jest.spyOn(secretField, 'setSecretField').mockReturnValue(new Promise(() => null))
    const { container } = render(
      <TestWrapper>
        <CustomHealthHeadersAndParams {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="spinner"]')))
  })

  test('ensure component loads when cached values are present', async () => {
    jest.spyOn(secretField, 'setSecretField').mockReturnValue(
      Promise.resolve({
        identifier: '1234_iden',
        name: 'some_name',
        referenceString: '12313_sdfsf',
        accountIdentifier: 'accountId_2134'
      })
    )

    const { container } = render(
      <TestWrapper>
        <CustomHealthHeadersAndParams
          {...props}
          prevStepData={{
            spec: {
              params: SpecParams,
              headers: SpecHeaders,
              baseURL: 'https://abcd.com'
            }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="keyValueContainer"]').length).toBe(2))
  })

  test('Ensure that submitting returns correct values', async () => {
    jest.spyOn(secretField, 'setSecretField').mockReturnValue(
      Promise.resolve({
        identifier: '1234_iden',
        name: 'some_name',
        referenceString: '12313_sdfsf',
        accountIdentifier: 'accountId_2134'
      })
    )

    const nextStepMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <CustomHealthHeadersAndParams
          {...props}
          nextStep={nextStepMock}
          prevStepData={{
            spec: {
              params: SpecParams,
              headers: SpecHeaders,
              baseURL: 'https://abcd.com'
            }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="keyValueContainer"]').length).toBe(2))
    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(nextStepMock).toHaveBeenCalledWith({
        accountId: '1234_accountId',
        baseURL: 'https://abcd.com',
        headers: [
          {
            key: 'header1',
            value: {
              fieldType: 'TEXT',
              textField: 'solo'
            }
          },
          {
            key: 'header2',
            value: {
              fieldType: 'ENCRYPTED',
              secretField: {
                accountIdentifier: 'accountId_2134',
                identifier: '1234_iden',
                name: 'some_name',
                referenceString: '12313_sdfsf'
              }
            }
          }
        ],
        orgIdentifier: undefined,
        params: [
          {
            key: 'param1',
            value: {
              fieldType: 'ENCRYPTED',
              secretField: {
                accountIdentifier: 'accountId_2134',
                identifier: '1234_iden',
                name: 'some_name',
                referenceString: '12313_sdfsf'
              }
            }
          },
          {
            key: 'param2',
            value: {
              fieldType: 'ENCRYPTED',
              secretField: {
                accountIdentifier: 'accountId_2134',
                identifier: '1234_iden',
                name: 'some_name',
                referenceString: '12313_sdfsf'
              }
            }
          }
        ],
        projectIdentifier: undefined,
        spec: {
          baseURL: 'https://abcd.com',
          headers: [
            {
              key: 'header1',
              value: 'solo',
              valueEncrypted: false
            },
            {
              encryptedValueRef: 'account.secret',
              key: 'header2',
              valueEncrypted: true
            }
          ],
          params: [
            {
              encryptedValueRef: 'account.secret',
              key: 'param1',
              valueEncrypted: true
            },
            {
              encryptedValueRef: 'account.secret2',
              key: 'param2',
              valueEncrypted: true
            }
          ]
        }
      })
    )
  })
})
