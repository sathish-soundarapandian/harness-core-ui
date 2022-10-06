/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TemplateDetailsDrawer } from '../TemplateDetailDrawer'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/template-ng', () => ({
  ...jest.requireActual('services/template-ng'),
  useGetTemplate: jest.fn().mockImplementation(() => ({}))
}))

describe('<TemplateDetailDrawer /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetailsDrawer template={mockTemplates?.data?.content?.[0] || {}} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
