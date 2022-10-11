/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { screen, render, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import FileUpload, { FileUploadProps } from '../FileUpload'
import type { TargetData } from '../types'

const renderComponent = (props: Partial<FileUploadProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FileUpload onChange={jest.fn()} {...props} />
    </TestWrapper>
  )

const mockTargets: TargetData[] = [
  { name: 'Target 1', identifier: 't1' },
  { name: 'Target 2', identifier: 't2' },
  { name: 'Target 3', identifier: 't3' }
]

describe('FileUpload', () => {
  const uploadCSV = (targets: TargetData[] = mockTargets): void => {
    const targetsCSV = targets.map(({ name, identifier }) => [name, identifier].join()).join('\n')
    File.prototype.text = jest.fn().mockResolvedValueOnce(targetsCSV)

    userEvent.upload(
      screen.getByLabelText('cf.targets.uploadYourFile'),
      new File([targetsCSV], 'test.csv', { type: 'text/csv' })
    )
  }

  test('it should display the upload trigger', async () => {
    renderComponent()

    expect(screen.getByLabelText('cf.targets.uploadYourFile')).toBeInTheDocument()
  })

  test('it should hide the upload trigger and show the targets when a CSV is selected', async () => {
    renderComponent()

    const targets = cloneDeep(mockTargets)
    uploadCSV(targets)

    await waitFor(() => {
      expect(screen.queryByLabelText('cf.targets.uploadYourFile')).not.toBeInTheDocument()
      expect(screen.queryByText('cf.targets.uploadStats')).toBeInTheDocument()
    })

    targets.forEach(({ name }) => expect(screen.getByText(name)).toBeInTheDocument())
  })

  test('it should clear the targets when the clear all button is pressed', async () => {
    renderComponent()

    uploadCSV()

    await waitFor(() => expect(document.querySelectorAll('.bp3-tag')).toHaveLength(mockTargets.length))

    userEvent.click(screen.getByRole('button', { name: 'filters.clearAll' }))

    await waitFor(() => {
      expect(document.querySelectorAll('.bp3-tag')).toHaveLength(0)
      expect(screen.queryByLabelText('cf.targets.uploadYourFile')).toBeInTheDocument()
    })
  })

  test('it should filter out incomplete targets', async () => {
    renderComponent()

    const targets = cloneDeep(mockTargets)
    targets[1].identifier = ''

    uploadCSV(targets)

    await waitFor(() => {
      expect(document.querySelectorAll('.bp3-tag')).toHaveLength(targets.length - 1)
      expect(screen.getByText(targets[0].name)).toBeInTheDocument()
      expect(screen.queryByText(targets[1].name)).not.toBeInTheDocument()
    })
  })

  test('it should call the onChange callback when targets are added', async () => {
    const onChangeMock = jest.fn()
    renderComponent({ onChange: onChangeMock })

    expect(onChangeMock).not.toHaveBeenCalled()

    uploadCSV()

    await waitFor(() => expect(onChangeMock).toHaveBeenCalled())
  })
})
