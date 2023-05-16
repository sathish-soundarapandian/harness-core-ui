/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { MultiSelectDropDown } from '@harness/uicore'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { MultiselectEnv} from '../EnvironmentSelectOrCreateHook';
import { useEnvironmentSelectOrCreate } from '../EnvironmentSelectOrCreateHook'

jest.mock('@common/modals/HarnessEnvironmentModal/HarnessEnvironmentModal', () => {
  return {
    useHarnessEnvironmentModal: jest.fn(data => {
      return {
        openHarnessEnvironmentModal: jest.fn(() => {
          data.onCreateOrUpdate()
        })
      }
    })
  }
})
const WrapperComponent = (props: MultiselectEnv) => {
  const { environmentOptions, openHarnessEnvironmentModal } = useEnvironmentSelectOrCreate({
    options: props.options,
    onNewCreated: jest.fn()
  })
  return (
    <>
      <MultiSelectDropDown items={environmentOptions} buttonTestId={'sourceFilter'} />
      <button
        className="open"
        onClick={() => {
          openHarnessEnvironmentModal()
        }}
      />
    </>
  )
}
describe('EnvironmentSelectOrCreateHook', () => {
  test('Should render the test option in the dropdown values', async () => {
    const options = [
      { value: 'env101', label: 'env101' },
      { value: 'env102', label: 'env102' }
    ]

    const { getByTestId, getByText } = render(
      <TestWrapper>
        <WrapperComponent options={options} onNewCreated={jest.fn()} />
      </TestWrapper>
    )
    const sourcesDropdown = getByTestId('sourceFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('env102')).toBeTruthy())
    await waitFor(() => expect(getByText('env101')).toBeTruthy())
    await waitFor(() => {
      fireEvent.click(getByText('env102')!)
    })
  })

  test('Should render the test option in the dropdown values', async () => {
    const options = [
      { value: 'env101', label: 'env101' },
      { value: 'env102', label: 'env102' }
    ]

    const { getByTestId, getByText, container } = render(
      <TestWrapper>
        <WrapperComponent options={options} onNewCreated={jest.fn()} />
      </TestWrapper>
    )
    const sourcesDropdown = getByTestId('sourceFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('env102')).toBeTruthy())
    await waitFor(() => expect(getByText('env101')).toBeTruthy())
    await waitFor(() => {
      fireEvent.click(container.querySelector('.open')!)
    })
  })
})
