/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateStudioHeader } from '@templates-library/components/TemplateStudio/TemplateStudioHeader/TemplateStudioHeader'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { StageTemplate } from '@templates-library/components/Templates/StageTemplate/StageTemplate'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import { ExecutionTemplate } from '@templates-library/components/Templates/ExecutionTemplate/ExecutionTemplate'
import { InfrastructureTemplate } from '@templates-library/components/Templates/InfrastructureTemplate/InfrastructureTemplate'
import { PipelineTemplate } from '@templates-library/components/Templates/PipelineTemplate/PipelineTemplate'
import { ServiceTemplate } from '@templates-library/components/Templates/ServiceTemplate/ServiceTemplate'
import { StepGroupTemplate } from '@templates-library/components/Templates/StepGroupTemplate/StepGroupTemplate'

describe('TemplateStudioHeader', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
    templateFactory.registerTemplate(new StageTemplate())
    templateFactory.registerTemplate(new PipelineTemplate())
    templateFactory.registerTemplate(new ServiceTemplate())
    templateFactory.registerTemplate(new InfrastructureTemplate())
    templateFactory.registerTemplate(new StepGroupTemplate())
    templateFactory.registerTemplate(new ExecutionTemplate())
  })
  test('renders Stage templateType correctly', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateStudioHeader templateType={'Stage' as TemplateType} />
      </TestWrapper>
    )
    expect(getByText('Stage Template')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders Step templateType correctly', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateStudioHeader templateType={'Step' as TemplateType} />
      </TestWrapper>
    )
    expect(getByText('Step Template')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders default title correctly', () => {
    const { container, getByText, debug } = render(
      <TestWrapper>
        <TemplateStudioHeader templateType={'unknown' as TemplateType} />
      </TestWrapper>
    )
    expect(getByText('Template')).toBeInTheDocument()
    debug()
    expect(container).toMatchSnapshot()
  })
})
