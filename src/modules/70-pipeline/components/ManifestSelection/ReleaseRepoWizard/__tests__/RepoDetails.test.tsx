/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import RepoDetails from '../RepoDetails'

const submitFn = jest.fn()

describe('Repo Details testing', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{}}
          manifest={null}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
