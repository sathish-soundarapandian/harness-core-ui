/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, findByText, act } from '@testing-library/react'
import type { MultiSelectOption } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ADD_NEW_VALUE } from '@cv/constants'
import { ServiceMultiSelectOrCreate, ServiceMultiSelectOrCreateProps } from '../ServiceMultiSelectOrCreate'

const onNewCreated = jest.fn()

jest.mock(
  '@cv/components/HarnessServiceAndEnvironment/components/UseServiceSelectOrCreate/UseServiceSelectOrCreate',
  () => ({
    useServiceSelectOrCreate: jest.fn().mockReturnValue({
      serviceOptions: [
        { label: '+ Add New', value: ADD_NEW_VALUE },
        { value: 'service101', label: 'service101' },
        { value: 'service102', label: 'service102' }
      ],
      openHarnessServiceModal: jest.fn()
    })
  })
)

const Wrapper = (props: ServiceMultiSelectOrCreateProps): JSX.Element => {
  return (
    <TestWrapper>
      <ServiceMultiSelectOrCreate {...props} className="multiSelectService" />
    </TestWrapper>
  )
}

describe('ServiceSelectOrCreate', () => {
  test('Should render multi select option dropdown', async () => {
    const { getByTestId, getByText } = render(
      <Wrapper
        options={[{ value: 'service101', label: 'service101' }]}
        onSelect={jest.fn()}
        onNewCreated={onNewCreated}
      />
    )
    const sourcesDropdown = getByTestId('multiSelectService') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('service101')).toBeTruthy())
  })

  test('Should render multi select option dropdown with value', async () => {
    const { container } = render(
      <Wrapper
        options={[{ value: 'service101', label: 'service101' }]}
        onSelect={jest.fn()}
        onNewCreated={onNewCreated}
        item={[{ value: 'service101', label: 'service101' }]}
      />
    )
    expect(container.querySelector('.MultiSelectDropDown--counter')?.textContent).toEqual('01')
  })

  test('Should render with no options', async () => {
    const { getByText, getByTestId } = render(<Wrapper options={[]} onSelect={jest.fn()} onNewCreated={onNewCreated} />)
    const sourcesDropdown = getByTestId('multiSelectService') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
  })

  test('Should be disabled', async () => {
    const { container } = render(
      <Wrapper
        options={[{ value: 'service101', label: 'service101' }]}
        onSelect={jest.fn()}
        onNewCreated={onNewCreated}
        disabled
      />
    )
    expect(container.querySelector('.MultiSelectDropDown--disabled')).toBeInTheDocument()
  })

  test('OnSelect should work for multidropdown', async () => {
    const options = [
      { value: 'service101', label: 'service101' },
      { value: 'service102', label: 'service102' }
    ]
    const onSelect = jest.fn()

    const { getByTestId, getByText, container } = render(
      <Wrapper options={options} onSelect={onSelect} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('multiSelectService') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('service102')).toBeTruthy())

    const typeToSelect1 = await findByText(container, 'service102')
    const typeToSelect2 = await findByText(container, 'service101')
    expect(typeToSelect1).toBeInTheDocument()
    expect(typeToSelect2).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.click(typeToSelect1!)
      fireEvent.click(typeToSelect2!)
    })

    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining([{ label: 'service102', value: 'service102' }]))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining([{ label: 'service101', value: 'service101' }]))
  })

  test('should select add new and open the model', async () => {
    const options = [
      { value: 'service101', label: 'service101' },
      { value: 'service102', label: 'service102' }
    ]
    const onSelect = (selectProps: MultiSelectOption[]) => {
      expect(selectProps).toMatchObject([options[1]])
    }
    const { getByTestId, getByText, container } = render(
      <Wrapper options={options} onSelect={onSelect} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('multiSelectService') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('service102')).toBeTruthy())

    const typeToSelect = await findByText(container, '+ Add New')

    expect(typeToSelect).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.click(typeToSelect!)
    })
  })

  test('Should render multi selct option dropdownd', async () => {
    const options = [
      { value: 'service101', label: 'service101' },
      { value: 'service102', label: 'service102' }
    ]
    const onSelect = jest.fn()
    const { container, getByTestId, getByText } = render(
      <Wrapper options={options} onSelect={onSelect} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('multiSelectService') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('service102')).toBeTruthy())
    await waitFor(() => expect(getByText('service101')).toBeTruthy())

    const typeToSelect = await findByText(container, 'service102')
    expect(typeToSelect).toBeInTheDocument()

    act(() => {
      fireEvent.click(typeToSelect)
    })
    const typeToSelect2 = await findByText(container, 'service101')
    expect(typeToSelect2).toBeInTheDocument()

    act(() => {
      fireEvent.click(typeToSelect2)
    })
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenNthCalledWith(1, [options[1]])
    expect(onSelect).toHaveBeenLastCalledWith([options[0]])
  })
})
