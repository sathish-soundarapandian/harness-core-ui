/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { ArtifactSourceTemplate } from '../ArtifactSourceTemplate'

jest.mock('@templates-library/components/TemplateInputs/TemplateInputs', () => ({
  ...(jest.requireActual('@templates-library/components/TemplateInputs/TemplateInputs') as any),
  TemplateInputs: () => {
    return <div className="template-inputs--mock">Template inputs section</div>
  }
}))

jest.mock('@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceTemplateCanvas', () => ({
  ...(jest.requireActual(
    '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceTemplateCanvas'
  ) as any),
  ArtifactSourceTemplateCanvasWithRef: React.forwardRef((_ref: any) => {
    return (
      <div className="artifact-source-template-canvas-mock">
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

describe('Test ArtifactSourceTemplate', () => {
  const artifactSourceTemplate = new ArtifactSourceTemplate()
  const formik = {} as TemplateFormRef
  test('call ArtifactSourceTemplate.renderTemplateCanvas', async () => {
    const { getByText } = render(artifactSourceTemplate.renderTemplateCanvas(formik))
    expect(getByText('onChange Button')).toBeDefined()
  })

  test('call ArtifactSourceTemplate.renderTemplateInputsForm', async () => {
    const { getByText } = render(
      artifactSourceTemplate.renderTemplateInputsForm({ template: {}, accountId: 'accountId' })
    )
    expect(getByText('Template inputs section')).toBeDefined()
  })
})
