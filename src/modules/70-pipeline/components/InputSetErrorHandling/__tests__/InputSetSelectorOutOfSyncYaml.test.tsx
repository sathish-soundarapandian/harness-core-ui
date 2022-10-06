/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, findByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as pipelineng from 'services/pipeline-ng'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import {
  GetInputSetYamlDiffInpSelector,
  GetOverlayISYamlDiffInpSelector,
  mockInvalidInputSetsList
} from './InputSetErrorHandlingMocks'

const commonProps: InputSetSelectorProps = {
  pipelineIdentifier: 'pipId'
}
const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.useFakeTimers()

const mockSuccessHandler = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: mockSuccessHandler,
    showError: jest.fn()
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetsListForPipeline: jest.fn(),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInpSelector)
}))

describe('INPUT SET SELECTOR -> Input Sets Error Exp', () => {
  test('Input Set - should open reconcile dialog on clicking reconcile button', async () => {
    jest.spyOn(pipelineng, 'useGetInputSetsListForPipeline').mockImplementation((): any => mockInvalidInputSetsList)
    render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()

    userEvent.click(screen.getByText('pipeline.inputSets.selectPlaceholder'))

    const inputSetName = await screen.findByText('is1')
    expect(inputSetName).toBeDefined()
    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    expect(reconcileBtns.length).toBe(2)
    userEvent.click(reconcileBtns[0])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByText(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findAllByRole('button', {
      name: 'pipeline.inputSets.removeInvalidFields'
    })
    expect(reconcileDialog).toMatchSnapshot('Reconcile Dialog - Input Set')
    userEvent.click(removeInvalidFieldBtn[0])
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('is1')).toBeDefined())
  })

  test('Overlay Input Set - should open reconcile dialog on clicking reconcile button', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetOverlayISYamlDiffInpSelector)
    render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()

    userEvent.click(screen.getByText('pipeline.inputSets.selectPlaceholder'))

    const inputSetName = await screen.findByText('is1')
    expect(inputSetName).toBeDefined()
    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    expect(reconcileBtns.length).toBe(2)
    userEvent.click(reconcileBtns[1])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByText(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findAllByRole('button', {
      name: 'pipeline.inputSets.removeInvalidFields'
    })
    expect(reconcileDialog).toMatchSnapshot('Reconcile Dialog - Overlay IS')
    userEvent.click(removeInvalidFieldBtn[0])
    await waitFor(() => expect(pipelineng.useUpdateOverlayInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('is1')).toBeDefined())
  })
})
