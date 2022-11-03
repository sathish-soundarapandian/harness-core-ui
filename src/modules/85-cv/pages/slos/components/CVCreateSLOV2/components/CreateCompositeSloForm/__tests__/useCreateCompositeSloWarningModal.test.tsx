/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { render } from '@testing-library/react'
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
    <TestWrapper>
      <Button onClick={() => openSaveCancelModal()}>open SaveCancel Modal</Button>
      <Button onClick={() => openPeriodUpdateModal()}>open Period Update Modal </Button>
    </TestWrapper>
  )
}
describe('useCreateCompositeSloWarningModal', () => {
  test('validate with prevStepData as null values', () => {
    const { container } = render(<Wrapper onChange={jest.fn()} prevStepData={null} handleRedirect={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })
  test('validate with prevStepData as undefined values', () => {
    const { container } = render(<Wrapper onChange={jest.fn()} prevStepData={undefined} handleRedirect={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })
})
