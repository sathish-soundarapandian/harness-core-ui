/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, getAllByText } from '@testing-library/react'
import user from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import PdcDetails from '@connectors/components/CreateConnector/PdcConnector/StepDetails/PdcDetails'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

const nextStep = jest.fn()

const fileValues = [{ hosts: 'localhost1' }]
const prevStepDataSpecHosts = { spec: { hosts: [{ hostname: 'localhost2' }, { hostname: '1.2.3.4' }] } }
const prevStepDataHosts = { hosts: 'localhost3\nlocalhost5' }

describe('Test PdcDetails component with spec.hosts', () => {
  test('Render component', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{ accountId: 'account1' }}>
        <PdcDetails prevStepData={prevStepDataSpecHosts} isEditMode={false} name="pdc-details" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(container.querySelector('localhost2')).toBeDefined()
    })
  })
  test('Render component with hosts', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{ accountId: 'account1' }}>
        <PdcDetails prevStepData={prevStepDataHosts} isEditMode={false} name="pdc-details" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(container.querySelector('localhost3')).toBeDefined()
    })
  })
  test('Render component and try upload file', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{ accountId: 'account1' }}>
        <PdcDetails prevStepData={prevStepDataHosts} isEditMode={false} name="pdc-details" nextStep={nextStep} />
      </TestWrapper>
    )

    const str = JSON.stringify(fileValues)
    const blob = new Blob([str])
    const file = new File([blob], 'values.json', {
      type: 'application/JSON'
    })
    File.prototype.text = jest.fn().mockResolvedValueOnce(str)
    const input = container.querySelector('input')

    act(() => {
      user.upload(input!, file)
    })

    waitFor(() => {
      expect(container.innerHTML).toContain('localhost5')
    })

    act(async () => {
      const continueBtn = getAllByText(container, 'continue')[0]
      await user.click(continueBtn!)
    })

    waitFor(() => {
      expect(nextStep).toBeCalled()
    })
  })
})
