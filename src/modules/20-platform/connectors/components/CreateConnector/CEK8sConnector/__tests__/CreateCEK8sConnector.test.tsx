/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
jest.mock('copy-to-clipboard')
import c2cMock from 'copy-to-clipboard'
import type { UseMutateReturn } from 'restful-react'
import { findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import * as ccmService from 'services/ce'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit } from '@common/utils/JestFormHelper'
import CreateCEK8sConnector from '../CreateCEK8sConnector'
import { mockedConnectors, mockResponse, commonProps } from './mocks'

const updateConnector = jest.fn()
const createConnector = jest.fn()

jest.mock('@common/utils/downloadYamlUtils', () => ({
  downloadYamlAsFile: jest.fn().mockImplementation(() => Promise.resolve({ status: true }))
}))

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetConnectorListV2: jest
    .fn()
    .mockImplementation(() => ({ mutate: async () => ({ data: mockedConnectors }), loading: false }))
}))
const mockMutateFn = jest.fn().mockReturnValue(Promise.resolve('')) as unknown
const useDownloadYamlSpy = jest.spyOn(ccmService, 'useCloudCostK8sClusterSetup') as any
useDownloadYamlSpy.mockReturnValue({ mutate: mockMutateFn } as UseMutateReturn<any, any, any, any, any>)

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Create CE K8s Connector Wizard', () => {
  test('Step One', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <CreateCEK8sConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot() // Form validation for all required fields in step one
  })

  test('Proceed with following steps', async () => {
    ;(c2cMock as jest.Mock).mockImplementationOnce(() => true)
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <CreateCEK8sConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    // 1 - fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    const connectorDropdown = container.querySelector('input[name="referenceConnector"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="referenceConnector"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    expect(selectCaret).toBeTruthy()
    if (selectCaret) {
      await waitFor(() => {
        fireEvent.click(selectCaret!)
      })
      const connectorToSelect = await findByText(container, 'rishabhk8s')
      act(() => {
        fireEvent.click(connectorToSelect)
      })
      expect(connectorDropdown.value).toBe('rishabhk8s')
    }

    expect(container).toMatchSnapshot() // matching snapshot with data
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot() // Form validation for all required fields

    // 2 - Feature Selection step
    expect(await findByText(container, 'connectors.ceK8.chooseRequirements.heading')).toBeDefined()

    const featuresCard = container.querySelectorAll('.bp3-card')
    const optimizationCard = featuresCard && featuresCard[1]
    act(() => {
      fireEvent.click(optimizationCard)
    })

    // OPTIMIZATION is selected
    expect(optimizationCard.classList.contains('Card--selected')).toBeTruthy()

    const continueBtn = await findByText(container, 'continue', { selector: 'button span' })
    act(() => {
      fireEvent.click(continueBtn)
    })

    // 3 - selecting OPTIMIZATION should enable secret creation step
    expect(await findByText(container, 'Secret Creation', { selector: 'h2' })).toBeDefined()

    const continueBtn2 = await findByText(container, 'continue', { selector: 'button span' })
    act(() => {
      fireEvent.click(continueBtn2)
    })

    // 4 - Provide Permission step
    const downloadBtn = await findByText(container, 'connectors.ceK8.providePermissionsStep.downloadYamlBtnText', {
      selector: 'button span'
    })
    expect(downloadBtn).toBeTruthy()
    act(() => {
      fireEvent.click(downloadBtn)
    })
    expect(await findByText(container, 'connectors.ceK8.providePermissionsStep.downloadComplete')).toBeDefined()

    const doneBtn = await findByText(container, 'done', { selector: 'button span' })
    expect(doneBtn).toBeTruthy()
    act(() => {
      fireEvent.click(doneBtn)
    })
    expect(await findByText(container, 'connectors.ceK8.providePermissionsStep.successfulCommandExec')).toBeDefined()

    expect(container).toMatchSnapshot()

    const submit = await findByText(container, 'continue', { selector: 'button span' })
    expect(submit).toBeDefined()
    await act(async () => {
      fireEvent.click(submit)
    })
    expect(createConnector).toBeCalledTimes(1)
  })
})
