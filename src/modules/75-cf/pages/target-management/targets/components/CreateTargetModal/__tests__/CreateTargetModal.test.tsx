/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import CreateTargetModal, { CreateTargetModalProps } from '../CreateTargetModal'

const renderComponent = (props: Partial<CreateTargetModalProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <CreateTargetModal loading={false} onSubmitTargets={jest.fn()} onSubmitTargetFile={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('CreateTargetModal', () => {
  const openModal = async (): Promise<void> => {
    userEvent.click(screen.getByRole('button', { name: 'plus cf.targets.create' }))

    await waitFor(() => expect(screen.getByText('cf.targets.addTargetsLabel')).toBeInTheDocument())
  }

  test('it should render initial state correctly', async () => {
    renderComponent()
    await openModal()

    expect(document.querySelector('.ModalDialog--container')).toMatchSnapshot()
  })

  test('it should submit entered targets', async () => {
    const name = 'Test Target'
    const identifier = 'testTarget'
    const onSubmitTargetsMock = jest.fn()

    renderComponent({ onSubmitTargets: onSubmitTargetsMock })
    await openModal()

    await userEvent.type(screen.getByPlaceholderText('cf.targets.enterName'), name, { allAtOnce: true })
    await userEvent.type(screen.getByPlaceholderText('cf.targets.enterValue'), identifier, { allAtOnce: true })

    const submitButton = screen.getByRole('button', { name: 'add' })

    await waitFor(() => expect(submitButton).toBeEnabled())

    userEvent.click(submitButton)

    await waitFor(() => expect(onSubmitTargetsMock).toHaveBeenCalled())
  })

  test('it should allow adding and removing rows', async () => {
    renderComponent()
    await openModal()

    expect(screen.getAllByPlaceholderText('cf.targets.enterName')).toHaveLength(1)
    expect(screen.getAllByPlaceholderText('cf.targets.enterValue')).toHaveLength(1)
    expect(screen.queryAllByRole('button', { name: 'cf.targets.removeRow' })).toHaveLength(0)

    userEvent.click(screen.getByRole('button', { name: 'cf.targets.addRow' }))

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('cf.targets.enterName')).toHaveLength(2)
      expect(screen.getAllByPlaceholderText('cf.targets.enterValue')).toHaveLength(2)
      expect(screen.queryAllByRole('button', { name: 'cf.targets.removeRow' })).toHaveLength(2)
    })

    userEvent.click(screen.getAllByRole('button', { name: 'cf.targets.removeRow' })[0])

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('cf.targets.enterName')).toHaveLength(1)
      expect(screen.getAllByPlaceholderText('cf.targets.enterValue')).toHaveLength(1)
      expect(screen.queryAllByRole('button', { name: 'cf.targets.removeRow' })).toHaveLength(0)
    })
  })

  test('it should toggle upload options', async () => {
    renderComponent()
    await openModal()

    const addATargetOption = screen.getByRole('radio', { name: 'cf.targets.list' })
    const uploadTargetsOption = screen.getByRole('radio', { name: 'cf.targets.upload' })

    expect(addATargetOption).toBeChecked()
    expect(uploadTargetsOption).not.toBeChecked()
    expect(screen.queryByPlaceholderText('cf.targets.enterName')).toBeInTheDocument()
    expect(screen.queryByLabelText('cf.targets.uploadYourFile')).not.toBeInTheDocument()

    userEvent.click(uploadTargetsOption)

    await waitFor(() => {
      expect(addATargetOption).not.toBeChecked()
      expect(uploadTargetsOption).toBeChecked()
      expect(screen.queryByPlaceholderText('cf.targets.enterName')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('cf.targets.uploadYourFile')).toBeInTheDocument()
    })

    userEvent.click(addATargetOption)

    await waitFor(() => {
      expect(addATargetOption).toBeChecked()
      expect(uploadTargetsOption).not.toBeChecked()
      expect(screen.queryByPlaceholderText('cf.targets.enterName')).toBeInTheDocument()
      expect(screen.queryByLabelText('cf.targets.uploadYourFile')).not.toBeInTheDocument()
    })
  })

  test('it should clear the form when closed', async () => {
    renderComponent()
    await openModal()

    await userEvent.type(screen.getByPlaceholderText('cf.targets.enterName'), 'test', { allAtOnce: true })
    userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => expect(screen.queryByText('cf.targets.addTargetsLabel')).not.toBeInTheDocument())

    await openModal()

    expect(screen.getByPlaceholderText('cf.targets.enterName')).toHaveValue('')
  })

  test('it should hide the modal when the hideModal function is called after the form is submitted with manually entered targets', async () => {
    const onSubmitTargetsMock = jest.fn((targets, hideModal) => {
      expect(targets).toEqual([{ name: 'test', identifier: 'test' }])
      hideModal()
    })
    renderComponent({ onSubmitTargets: onSubmitTargetsMock })
    await openModal()

    await userEvent.type(screen.getByPlaceholderText('cf.targets.enterName'), 'test', { allAtOnce: true })
    await userEvent.type(screen.getByPlaceholderText('cf.targets.enterValue'), 'test', { allAtOnce: true })

    const submitBtn = screen.getByRole('button', { name: 'add' })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    userEvent.click(submitBtn)

    await waitFor(() => expect(screen.queryByText('cf.targets.addTargetsLabel')).not.toBeInTheDocument())
  })

  test('it should hide the modal when the hideModal function is called after the form is submitted with a CSV upload', async () => {
    File.prototype.text = jest.fn().mockResolvedValueOnce('hello,world')
    const csv = new File(['hello,world'], 'test.csv', { type: 'text/csv' })

    const onSubmitTargetFileMock = jest.fn((uploadedFile, hideModal) => {
      expect(uploadedFile).toBe(csv)
      hideModal()
    })
    renderComponent({ onSubmitTargetFile: onSubmitTargetFileMock })
    await openModal()

    userEvent.click(screen.getByRole('radio', { name: 'cf.targets.upload' }))

    const fileInput = await screen.findByLabelText('cf.targets.uploadYourFile')
    userEvent.upload(fileInput, csv)

    await waitFor(() => expect(fileInput).not.toBeInTheDocument())

    const submitBtn = screen.getByRole('button', { name: 'add' })
    await waitFor(() => expect(submitBtn).toBeEnabled())
    userEvent.click(submitBtn)

    await waitFor(() => expect(screen.queryByText('cf.targets.addTargetsLabel')).not.toBeInTheDocument())
  })

  test('it should should allow the modal to open when user is within MAU limit', async () => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'plus cf.targets.create' }))

    await waitFor(() => {
      expect(screen.getByText('cf.targets.addTargetsLabel')).toBeInTheDocument()
      expect(screen.queryByText('cf.planEnforcement.upgradeRequiredMau')).not.toBeInTheDocument()
    })
  })

  test('it should show plan enforcement tooltip when user exceeds MAU limit', async () => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })

    const mockedReturnValue = new Map<FeatureIdentifier, CheckFeatureReturn>()
    mockedReturnValue.set(FeatureIdentifier.MAUS, {
      enabled: false,
      featureDetail: {
        enabled: false,
        featureName: FeatureIdentifier.MAUS,
        moduleType: 'CF',
        count: 100,
        limit: 100
      }
    })

    jest.spyOn(useFeaturesMock, 'useFeatures').mockReturnValue({ features: mockedReturnValue })

    renderComponent()

    const createTargetButton = screen.getByRole('button', { name: 'plus cf.targets.create' })
    fireEvent.mouseOver(createTargetButton)

    await waitFor(() => {
      expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument()
      expect(createTargetButton).toHaveAttribute('disabled')
    })
  })
})
