/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { act, fireEvent, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import useCreateCompositeSloWarningModal from '../useCreateCompositeSloWarningModal'

const Wrapper = ({ onChange, prevStepData, handleRedirect }: any) => {
  const prevData = React.useRef(prevStepData)
  const [openSaveCancelModal, openPeriodUpdateModal] = useCreateCompositeSloWarningModal({
    onChange,
    prevStepData: prevData,
    handleRedirect
  })
  return (
    <>
      <Button onClick={openSaveCancelModal} title="openChangeModal" />
      <Button onClick={openPeriodUpdateModal} title="openPeriodModal" />
    </>
  )
}
describe('useCreateCompositeSloWarningModal', () => {
  test('validate with prevStepData as null values', () => {
    const { container } = render(
      <TestWrapper>
        <Wrapper onChange={jest.fn()} prevStepData={null} handleRedirect={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('validate with prevStepData as undefined values', async () => {
    const { container } = render(
      <TestWrapper>
        <Wrapper onChange={jest.fn()} prevStepData={undefined} handleRedirect={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('validate onCancel calls onChange', async () => {
    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <Wrapper onChange={onChangeMock} prevStepData={null} handleRedirect={jest.fn()} />
      </TestWrapper>
    )
    expect(container.querySelector('button[title="openPeriodModal"]')).toBeInTheDocument()
    act(() => {
      fireEvent.click(container.querySelector('button[title="openPeriodModal"]')!)
    })
    await waitFor(() => expect(document.querySelector('.bp3-dialog')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('cancel')).toBeInTheDocument())
    act(() => {
      userEvent.click(screen.getByText('cancel'))
    })
    expect(onChangeMock).toHaveBeenCalled()
  })
})
