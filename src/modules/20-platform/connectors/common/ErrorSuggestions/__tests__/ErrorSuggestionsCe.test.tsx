/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { IconName } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { ResponseMessage } from 'services/cd-ng'
import Suggestions from '../ErrorSuggestionsCe'

let props = {
  items: [
    {
      code: 'HINT',
      level: 'INFO',
      message: 'No connector found with identifier test35',
      exception: '',
      failureTypes: []
    }
  ] as ResponseMessage[],
  header: '',
  icon: '' as IconName,
  errorType: ''
}

describe('Error Suggestions CE tests', () => {
  test('should render suggestions component', async () => {
    const { container } = render(
      <TestWrapper>
        <Suggestions connectorType={''} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should return null in case of blank items', () => {
    props = {
      items: [] as ResponseMessage[],
      header: '',
      icon: '' as IconName,
      errorType: ''
    }
    const { container } = render(
      <TestWrapper>
        <Suggestions connectorType={''} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot('<div />')
  })
})
