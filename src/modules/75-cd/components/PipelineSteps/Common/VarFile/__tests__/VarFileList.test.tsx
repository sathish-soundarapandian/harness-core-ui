/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, screen, fireEvent, waitFor, getByText as getByTextBody, act } from '@testing-library/react'
import { MultiTypeInputType, Formik } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import VarFileList from '../VarFileList'
import { formikValues, formikValuesforArtifactoryForm } from './VarFileTestHelper'

const mockGetFunction = jest.fn()
const defaultProps = {
  varFilePath: 'spec.configuration.spec.varFiles',
  formik: formikValues,
  isReadonly: false,
  getNewConnectorSteps: mockGetFunction,
  setSelectedConnector: mockGetFunction,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
}

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <Formik formName="varFileList" onSubmit={noop} initialValues={{}}>
        <VarFileList {...props} />
      </Formik>
    </TestWrapper>
  )
}

describe('Test VarFileList', () => {
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
    const addVarFile = await screen.findByText('cd.addRemote')
    fireEvent.click(addVarFile)
    const gitConnector = await findByTestId('varStore-Git')
    expect(gitConnector).toBeInTheDocument()
    const dialog = findDialogContainer() as HTMLElement
    const closeButton = dialog.querySelector('span[icon="cross"]') as Element
    fireEvent.click(closeButton)
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

  test(`renders with Artifactory connector`, async () => {
    const props = {
      varFilePath: 'spec.configuration.spec.varFiles',
      formik: formikValuesforArtifactoryForm,
      isReadonly: false,
      getNewConnectorSteps: mockGetFunction,
      setSelectedConnector: mockGetFunction,
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME],
      selectedConnector: 'Artifactory'
    } as any
    const { container, getByText } = renderComponent(props)

    const editVarFile = container.querySelector('[data-icon="edit"]')
    fireEvent.click(editVarFile!)

    const addButton = await getByText('plusAdd')
    fireEvent.click(addButton)

    expect(getByText('cd.addInline')).toBeTruthy()
    fireEvent.click(getByText('cd.addInline'))

    expect(getByText('cd.addRemote')).toBeTruthy()
    fireEvent.click(getByText('cd.addRemote'))

    const dailog = findDialogContainer()

    //close
    fireEvent.click(document.querySelector('[data-icon="cross"]') as HTMLElement)
    waitFor(() => expect(dailog).toBeFalsy())
  })

  test('remove terraform remote var file and add inline var file with same identifier', async () => {
    const { getByTestId, container } = renderComponent(defaultProps)
    const removeLabel = getByTestId('remove-varFile-0')

    act(() => {
      userEvent.click(removeLabel)
    })

    expect(container.querySelector('span[data-icon="Inline"]')).toBeInTheDocument()
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)
    const addInlineButton = await screen.findByText('cd.addInline')
    fireEvent.click(addInlineButton)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    const identifierInput = dialog.querySelector('input[name="varFile.identifier"]') as HTMLInputElement
    fireEvent.change(identifierInput, { target: { value: 'plan var id' } })
    expect(identifierInput).toBeDefined()
    const submitBtn = dialog.querySelector('button[data-testid="submit-inlinevar"]') as Element
    fireEvent.click(submitBtn)
  })
})
