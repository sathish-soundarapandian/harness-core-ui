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
import { MultiSelectService, useServiceSelectOrCreate } from '../UseServiceSelectOrCreate'

jest.mock('@common/modals/HarnessServiceModal/HarnessServiceModal', () => {
  return {
    useHarnessServicetModal: jest.fn(data => {
      return {
        openHarnessServiceModal: jest.fn(() => {
          data.onCreateOrUpdate()
        })
      }
    })
  }
})
const WrapperComponent = (props: MultiSelectService) => {
  const { serviceOptions, openHarnessServiceModal } = useServiceSelectOrCreate({
    options: props.options,
    onNewCreated: jest.fn()
  })
  return (
    <>
      <MultiSelectDropDown items={serviceOptions} buttonTestId={'sourceFilter'} />
      <button
        className="open"
        onClick={() => {
          openHarnessServiceModal()
        }}
      />
    </>
  )
}
describe('ServiceSelectOrCreateHook', () => {
  test('Should render the test option in the dropdown values', async () => {
    const options = [
      { value: 'service101', label: 'service101' },
      { value: 'service102', label: 'service102' }
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
    await waitFor(() => expect(getByText('service102')).toBeTruthy())
    await waitFor(() => expect(getByText('service101')).toBeTruthy())
    await waitFor(() => {
      fireEvent.click(getByText('service102')!)
    })
  })

  test('Should render the test option in the dropdown values', async () => {
    const options = [
      { value: 'service101', label: 'service101' },
      { value: 'service102', label: 'service102' }
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
    await waitFor(() => expect(getByText('service102')).toBeTruthy())
    await waitFor(() => expect(getByText('service101')).toBeTruthy())
    await waitFor(() => {
      fireEvent.click(container.querySelector('.open')!)
    })
  })
})
