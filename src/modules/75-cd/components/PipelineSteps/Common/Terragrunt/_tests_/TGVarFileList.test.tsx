/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { render, fireEvent, screen, getByText as getByTextBody, waitFor, act } from '@testing-library/react'
import { MultiTypeInputType, Formik } from '@harness/uicore'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import TGVarFileList from '../EditView/TGVarFileList'
import { formikValues } from './TerragruntTestHelper'

const mockGetFunction = jest.fn()
const defaultProps = {
  formik: formikValues,
  isReadonly: false,
  getNewConnectorSteps: mockGetFunction,
  setSelectedConnector: mockGetFunction,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
}

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <Formik formName="TgVarFileList" onSubmit={noop} initialValues={{}}>
        <TGVarFileList {...props} />
      </Formik>
    </TestWrapper>
  )
}

describe('Test TgPlanVarFileList', () => {
  test(`renders inline var file dialog`, async () => {
    renderComponent(defaultProps)
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)

    const addInlineButton = await screen.findByText('cd.addInline')
    fireEvent.click(addInlineButton)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    const identifierInput = dialog.querySelector('input[name="varFile.identifier"]') as HTMLInputElement
    fireEvent.change(identifierInput, { target: { value: 'id2' } })
    expect(identifierInput).toBeDefined()
    const submitBtn = dialog.querySelector('button[data-testid="submit-inlinevar"]') as Element
    fireEvent.click(submitBtn)
  })

  test(`renders remote var file dialog`, async () => {
    const { findByTestId } = renderComponent(defaultProps)
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)
    const addInlineButton = await screen.findByText('cd.addRemote')
    fireEvent.click(addInlineButton)
    const gitConnector = await findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()
    const dialog = findDialogContainer() as HTMLElement
    const closeButton = dialog.querySelector('span[icon="cross"]') as Element
    fireEvent.click(closeButton)
  })

  test('remove terraform var file', () => {
    const { getByTestId, container } = renderComponent(defaultProps)
    const removeLabel = getByTestId('remove-header-0')
    act(() => {
      userEvent.click(removeLabel)
    })
    expect(container.querySelector('span[data-icon="remote"]')).toBeInTheDocument()
  })

  test('edit terraform remote var file', async () => {
    const { findByTestId, container } = renderComponent(defaultProps)
    const editQueries = container.querySelectorAll('[data-icon="edit"]')
    // remote edit
    fireEvent.click(editQueries[0])
    const gitConnector = await findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()

    const gitlabConnector = await findByTestId('varStore-GitLab')
    expect(gitlabConnector).toBeInTheDocument()

    const githubbConnector = await findByTestId('varStore-Github')
    expect(githubbConnector).toBeInTheDocument()

    const bitBucketConnector = await findByTestId('varStore-Bitbucket')
    expect(bitBucketConnector).toBeInTheDocument()

    fireEvent.click(gitlabConnector)

    //close
    fireEvent.click(document.querySelector('[data-icon="cross"]') as HTMLElement)

    await fireEvent.click(editQueries[1])
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    fireEvent.click(document.querySelector('[data-icon="small-cross"]') as HTMLElement)
    waitFor(() => expect(dialog).toBeFalsy())
  })
})
