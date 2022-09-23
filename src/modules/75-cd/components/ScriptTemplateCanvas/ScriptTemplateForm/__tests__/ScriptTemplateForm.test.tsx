/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, act, fireEvent, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { ScriptTemplateFormWithRef } from '../ScriptTemplateForm'

const template = {
  identifier: 'id',
  name: 'name',
  type: 'SecretManager',
  versionLabel: 'v1',
  spec: {
    environmentVariables: [{ name: 'var1', type: 'String', value: 'hello' }],
    onDelegate: 'delegate',
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: 'echo test'
      }
    }
  }
}

describe('Test OptionalConfigurations', () => {
  test('initial render', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <ScriptTemplateFormWithRef template={template as any} updateTemplate={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => getAllByText('common.script'))
    expect(container).toMatchSnapshot()
  })

  test('Switch the tabs with data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ScriptTemplateFormWithRef template={template as any} updateTemplate={jest.fn()} />
      </TestWrapper>
    )
    const configTab = getByText('Configuration')
    act(() => {
      fireEvent.click(configTab)
    })
    const envVarValue = container.querySelector('input[value="hello"]')
    await waitFor(() => expect(envVarValue).toBeDefined())

    expect(container).toMatchSnapshot()
  })
})
