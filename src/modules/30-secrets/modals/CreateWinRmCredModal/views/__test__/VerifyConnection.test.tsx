/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, queryByText, render } from '@testing-library/react'
import React from 'react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import VerifyConnection from '@secrets/modals/CreateWinRmCredModal/views/VerifyConnection'
import { clickSubmit } from '@common/utils/JestFormHelper'
import type { ResponseSecretValidationResultDTO } from 'services/cd-ng'

const responseSecretValidation: ResponseSecretValidationResultDTO = {
  status: 'SUCCESS',
  data: { success: true },
  metaData: {}
}

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useValidateSecret: jest
    .fn()
    .mockImplementation(() => ({ mutate: () => Promise.resolve({ responseSecretValidation }) }))
}))

const delegateResponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

jest.mock('services/portal', () => ({
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: delegateResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create WinRm Cred Wizard Step Verify', () => {
  test('Test for winrm step verify', async () => {
    const { container } = render(
      <TestWrapper>
        <VerifyConnection identifier="dummy" closeModal={noop} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="host"]')!, { target: { value: 'host' } })

      const target = container.querySelector('button[type="submit"]')
      expect(target).toBeDefined()
    })

    await act(async () => {
      clickSubmit(container)
    })

    const verifyRetestBtn = queryByText(container, 'secrets.createSSHCredWizard.verifyRetest')
    expect(verifyRetestBtn).toBeDefined()
    if (verifyRetestBtn) fireEvent.click(verifyRetestBtn)

    expect(container).toMatchSnapshot()
  })
})
