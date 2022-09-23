/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import useCreateConnector, {
  NoConnectorDataHandling,
  useCreateConnectorMinimal,
  UseCreateConnectorProps
} from '../CreateConnector'

const params = {
  accountId: 'TEST_ACC'
}

const TestComponent = (props: UseCreateConnectorProps): React.ReactElement => {
  const { openModal } = useCreateConnector({ onSuccess: props.onSuccess, onClose: props.onClose })
  return (
    <>
      <button className="open" onClick={openModal} />
    </>
  )
}

const TestConnectorComponent = (props: UseCreateConnectorProps): React.ReactElement => {
  const { openModal, closeModal } = useCreateConnectorMinimal({ onSuccess: props.onSuccess, onClose: props.onClose })
  return (
    <>
      <button className="open" onClick={openModal} />
      <button className="close" onClick={closeModal} />
    </>
  )
}

describe('Should render the create connector dialog', () => {
  test('Test case for no connector data', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <NoConnectorDataHandling />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render the connector modal', () => {
    const { container } = render(
      <TestWrapper>
        <TestComponent onSuccess={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)

    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toMatchSnapshot()
  })

  test('Should render the minimal connector modal', () => {
    const { container } = render(
      <TestWrapper>
        <TestConnectorComponent onSuccess={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)

    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toMatchSnapshot()

    fireEvent.click(container.querySelector('.close')!)
    const dialogElm = findDialogContainer() as HTMLElement
    expect(dialogElm).not.toBeInTheDocument()
  })
})
