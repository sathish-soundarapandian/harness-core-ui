/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { parse } from 'yaml'
import { TemplateInputs } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { mockTemplatesInputYaml } from '@pipeline/components/PipelineStudio/PipelineStudioTestHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'

const baseTemplate = mockTemplates?.data?.content?.[0] || {}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return {
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null as unknown as undefined,
        data: {
          mergedPipelineYaml: yamlStringify(parse(baseTemplate?.yaml || '').template)
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest
    .fn()
    .mockImplementation(() => ({ data: mockTemplatesInputYaml, refetch: jest.fn(), error: null, loading: false }))
}))

describe('<TemplateInputs /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateInputs template={baseTemplate} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
