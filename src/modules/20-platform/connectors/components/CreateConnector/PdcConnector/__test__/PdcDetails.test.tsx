/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, getAllByText, fireEvent, createEvent } from '@testing-library/react'
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
    const { container, getByText } = render(
      <TestWrapper path="/account/pass" pathParams={{ accountId: 'account1' }}>
        <PdcDetails isEditMode={false} name="pdc-details" nextStep={nextStep} />
      </TestWrapper>
    )

    const radioButtonElement = getByText('connectors.pdc.uploadJson')
    fireEvent.click(radioButtonElement)

    await waitFor(() => {
      expect(getByText('connectors.pdc.hostsUpload1')).toBeDefined()
    })

    const fileName = 'values.json'
    const str = JSON.stringify(fileValues)
    const blob = new Blob([str])
    const file = new File([blob], fileName, {
      type: 'application/JSON'
    })

    const input = container.querySelector('input')

    const eventData = { dataTransfer: { files: [file] } }

    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(input!), eventData)

      fireEvent(input!, dragStartEvent)
      fireEvent.dragEnter(input!)
      fireEvent.dragEnd(input!)
      fireEvent.dragLeave(input!)

      const dropEffectEvent = Object.assign(createEvent.dragOver(input!), eventData)
      fireEvent(input!, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(input!), eventData)
      fireEvent(input!, dropEvent)

      const areaJson = waitFor(() => getAllByText(container, 'JSON content')[0])
      expect(areaJson).toBeDefined()
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
