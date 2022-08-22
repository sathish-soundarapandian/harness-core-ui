/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { TemplatesGridView } from '@templates-library/pages/TemplatesPage/views/TemplatesGridView/TemplatesGridView'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TestWrapper } from '@common/utils/testUtils'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'

const baseProps: TemplatesViewProps = {
  data: defaultTo(mockTemplates.data, {}),
  gotoPage: jest.fn(),
  onSelect: jest.fn()
}

describe('<TemplatesGridView /> tests', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesGridView {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
