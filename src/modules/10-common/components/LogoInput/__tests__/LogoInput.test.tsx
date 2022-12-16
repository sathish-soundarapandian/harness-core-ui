/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import LogoInput, { LogoInputProps } from '../LogoInput'

const commonProps = {
  name: 'logo',
  label: 'logo-input-label'
}
const renderLogoInput = (props: LogoInputProps): ReturnType<typeof render> =>
  render(
    <TestWrapper>
      <Formik initialValues={{ logo: '' }} onSubmit={jest.fn()} formName="testForm">
        <FormikForm>
          <LogoInput {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )

describe('<LogoInput /> tests', () => {
  test('file upload', async () => {
    const onChange = jest.fn()
    renderLogoInput({ ...commonProps, accept: 'image/png', onChange })

    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByLabelText('logo-input-label') as HTMLInputElement
    const uploadIcon = screen.getByTestId('upload-icon')

    expect(uploadIcon).toBeInTheDocument()

    userEvent.upload(input, file)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
    expect(input.files![0]).toStrictEqual(file)
    expect(input.files!.item(0)).toStrictEqual(file)
    expect(input.files).toHaveLength(1)
  })

  test('renders a preview of the logo if present', async () => {
    renderLogoInput({ ...commonProps, logo: 'logo-url' })

    const previewImage = screen.getByRole('img')
    expect(previewImage).toBeInTheDocument()
    expect(previewImage).toHaveAttribute('src', 'logo-url')
    expect(screen.getByTestId('delete-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('upload-icon')).not.toBeInTheDocument()
  })

  test('calls onRemove when a logo is present and input is clicked', () => {
    const onRemove = jest.fn()
    const onChange = jest.fn()
    renderLogoInput({ ...commonProps, accept: 'image/png', onRemove, onChange, name: 'test', logo: 'logo-url' })

    const logoInputContainer = screen.getByTestId('logo-input-test')
    const previewImage = screen.getByRole('img')
    expect(logoInputContainer).toBeInTheDocument()
    expect(previewImage).toBeInTheDocument()

    userEvent.click(logoInputContainer)

    expect(onRemove).toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })
})
