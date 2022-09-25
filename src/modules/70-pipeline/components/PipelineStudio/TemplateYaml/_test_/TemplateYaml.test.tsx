/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { stepTemplate } from '@pipeline/components/PipelineStudio/TemplateBar/__tests__/TemplateBar.test'
import { TemplateYaml } from '../TemplateYaml'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('<TemplateYaml /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateYaml templateYaml={defaultTo(stepTemplate.data?.yaml, '')} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
