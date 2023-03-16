/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { useHarnessEnvironmentModal } from '../HarnessEnvironmentModal'

const TestComponent = (): React.ReactElement => {
  const { openHarnessEnvironmentModal, closeHarnessEnvironmentModal } = useHarnessEnvironmentModal({
    data: {},
    isEnvironment: true,
    isEdit: false,
    onClose: noop,
    modalTitle: 'New Environment',
    onCreateOrUpdate: jest.fn()
  })
  return (
    <>
      <button className="open" onClick={openHarnessEnvironmentModal} />
      <button className="close" onClick={closeHarnessEnvironmentModal} />
    </>
  )
}

describe('open and close Harness Environment Modal', () => {
  describe('Rendering', () => {
    test('should open and close the Harness Environment modal', async () => {
      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(container.querySelector('.open')!)
      })

      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()

      act(() => {
        fireEvent.click(container.querySelector('.close')!)
      })

      const dialogAssert = findDialogContainer() as HTMLElement
      expect(dialogAssert).toBeNull()
    })
  })
})
