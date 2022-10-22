/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { useSaveAsTemplate } from '@pipeline/components/PipelineStudio/SaveTemplateButton/useSaveAsTemplate'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConfigModalProps } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'

const mockFunction = jest.fn()

jest.mock('framework/Templates/TemplateConfigModal/TemplateConfigModal', () => ({
  ...jest.requireActual('framework/Templates/TemplateConfigModal/TemplateConfigModal'),
  TemplateConfigModalWithRef: React.forwardRef((props: ConfigModalProps, _ref) => {
    mockFunction(props)
    return <div className={'template-config-modal-mock'} />
  })
}))

function Wrapped(): React.ReactElement {
  const { save } = useSaveAsTemplate({
    data: {
      type: 'Run',
      name: 'step1',
      identifier: 'step1',
      spec: {
        connectorRef: 'harnessImage',
        image: 'alpine',
        command: "echo 'run'",
        privileged: false
      }
    },
    type: 'Step'
  })
  return (
    <>
      <button onClick={save}>Save As Template</button>
    </>
  )
}

describe('useSaveAsTemplate tests', () => {
  test('should work as expected', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )
    const saveAsTemplateBtn = getByText('Save As Template')
    await act(async () => {
      fireEvent.click(saveAsTemplateBtn)
    })
    expect(mockFunction).toBeCalledWith({
      allowScopeChange: true,
      disableCreatingNewBranch: false,
      disabledFields: [],
      initialValues: {
        identifier: '-1',
        name: '',
        spec: {
          type: 'Run',
          spec: {
            connectorRef: 'harnessImage',
            image: 'alpine',
            command: "echo 'run'",
            privileged: false
          }
        },
        type: 'Step',
        versionLabel: '-1'
      },
      intent: 'SAVE',
      onClose: expect.any(Function),
      onFailure: expect.any(Function),
      promise: expect.any(Function),
      title: 'common.template.saveAsNewTemplateHeading'
    })
  })
})
