/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { SecretManagerTemplate } from '../SecretManagerTemplate'

jest.mock('@cd/components/ScriptTemplateCanvas/ScriptTemplateCanvas', () => ({
  ...(jest.requireActual('@cd/components/ScriptTemplateCanvas/ScriptTemplateCanvas') as any),
  ScriptTemplateCanvasWithRef: React.forwardRef((_ref: any) => {
    return (
      <div className="script-canvas-mock">
        <button
          onClick={() => {
            return true
          }}
        >
          onChange Button
        </button>
      </div>
    )
  })
}))

describe('Test SecretManagerTemplate', () => {
  test('call SecretManagerTemplate.renderTemplateCanvas', async () => {
    const smTemplate = new SecretManagerTemplate()
    const formik = {}

    const { getByText } = render(smTemplate.renderTemplateCanvas(formik))
    expect(getByText('onChange Button')).toBeDefined()
  })
})
