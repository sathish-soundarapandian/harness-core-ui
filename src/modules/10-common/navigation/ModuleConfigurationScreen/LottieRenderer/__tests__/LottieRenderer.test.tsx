/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import LottieRenderer from '../LottieRenderer'

jest.mock('react-lottie-player', () => {
  return () => <div>lottie</div>
})

describe('lottie component test', () => {
  test('render', () => {
    global.fetch = jest.fn().mockImplementationOnce(() => {
      return new Promise(resolve => {
        resolve({
          ok: true,
          status,
          json: () => {
            return {}
          }
        })
      })
    })
    const { container } = render(
      <TestWrapper>
        <LottieRenderer
          activeModule={ModuleName.CD}
          json={{
            fields: {
              // eslint-disable-next-line
              // @ts-ignore
              file: {
                url: 'http://test.com'
              }
            }
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
