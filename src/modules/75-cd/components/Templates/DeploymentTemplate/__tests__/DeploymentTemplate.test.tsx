/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { DeploymentTemplate } from '../DeploymentTemplate'

jest.mock('@templates-library/components/TemplateInputs/TemplateInputs', () => ({
  ...(jest.requireActual('@templates-library/components/TemplateInputs/TemplateInputs') as any),
  TemplateInputs: () => {
    return <div className="template-inputs--mock">Template inputs section</div>
  }
}))

jest.mock('@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateCanvasWrapper', () => ({
  ...(jest.requireActual(
    '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateCanvasWrapper'
  ) as any),
  DeploymentTemplateCanvasWrapperWithRef: React.forwardRef((_ref: any) => {
    return (
      <div className="deployment-template-canvas-mock">
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

describe('Test DeploymentTemplate', () => {
  const deploymentTemplate = new DeploymentTemplate()
  const formik = {} as TemplateFormRef
  test('call DeploymentTemplate.renderTemplateCanvas', async () => {
    const { getByText } = render(deploymentTemplate.renderTemplateCanvas(formik))
    expect(getByText('onChange Button')).toBeDefined()
  })

  test('call DeploymentTemplate.renderTemplateInputsForm', async () => {
    const { getByText } = render(deploymentTemplate.renderTemplateInputsForm({ template: {}, accountId: 'accountId' }))
    expect(getByText('Template inputs section')).toBeDefined()
  })
})
