/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import ReconcileInfraDialogWrapper from '../ReconcileInfraDialogWrapper'
import { originalYaml, refreshedYaml } from './mock'
import { YamlDiffView } from '../YamlDiffView'

const showError = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showError
  })
}))
jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))
jest.mock('services/cd-ng', () => ({
  getUpdatedYamlForInfrastructurePromise: () => {
    return {
      status: 'SUCCESS',
      data: {
        refreshedYaml
      }
    }
  }
}))

describe('Infrastructure Reconcile', () => {
  test('render Reconcile Dialog and header', async () => {
    const { container } = render(
      <TestWrapper>
        <ReconcileInfraDialogWrapper
          entity={TemplateErrorEntity.INFRASTRUCTURE}
          isReadOnly={false}
          updateRootEntity={jest.fn()}
          originalYaml={originalYaml}
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'pipeline.outOfSyncErrorStrip.updatedTemplateInfo'))
    await waitFor(() => queryByText(container, 'pipeline.outOfSyncErrorStrip.reconcile'))
    const reconcileButton = document.body.querySelector('button.bp3-button[type=button]')
    expect(reconcileButton).toBeTruthy()

    act(() => {
      fireEvent.click(reconcileButton!)
    })

    await waitFor(() => expect(document.querySelector('.reconcileDialog')).toBeDefined())

    // close dialog
    const closeReconcile = document?.querySelector('[data-icon="Stroke"]')!
    expect(closeReconcile).toBeDefined()
    act(() => {
      fireEvent.click(closeReconcile!)
    })
    await waitFor(() => expect(document.querySelector('.reconcileDialog')).not.toBeInTheDocument())
    act(() => {
      fireEvent.click(reconcileButton!)
    })

    await waitFor(() => queryByText(container, 'pipeline.reconcileDialog.originalYamlLabel'))
    await waitFor(() => queryByText(container, 'pipeline.reconcileDialog.refreshedYamlLabel'))

    const yamlUpdateButton = document.body.querySelector('button.bp3-button[data-testid=yaml-update-button]')
    expect(yamlUpdateButton).toBeTruthy()

    act(() => {
      fireEvent.click(yamlUpdateButton!)
    })

    expect(container).toMatchSnapshot()
  })
})

describe('YamlDiffView render error on diffUpdate', () => {
  test('render YamlDiffView error message', async () => {
    const { getByText } = render(
      <TestWrapper>
        <YamlDiffView
          getUpdatedYaml={jest.fn(() =>
            Promise.resolve({
              status: 'ERROR',
              data: {
                refreshedYaml: '',
                message: 'Some error occured'
              }
            })
          )}
          onUpdate={jest.fn()}
          originalEntityYaml={originalYaml}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('Some error occured')).toBeInTheDocument()
    })
  })
})
