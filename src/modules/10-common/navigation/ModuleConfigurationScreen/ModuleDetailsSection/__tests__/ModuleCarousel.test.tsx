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
import { ModuleContentType } from '../../useGetContentfulModules'
import ModuleCarousel from '../ModuleCarousel'

jest.mock('react-lottie-player', () => {
  return () => <div>Lottie</div>
})

jest.mock('../../CarousellmageAndDescription/CarousellmageAndDescription', () => {
  return () => <div>{ModuleContentType.CENTER_ALIGNED_IMAGE_DESC}</div>
})

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

describe('Module Carousel test', () => {
  test('render without data', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <ModuleCarousel module={ModuleName.CD} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('[data-icon="cd-main"]')).toBeDefined()
    expect(container.querySelectorAll('.Carousel--carouselItem').length).toBe(1)
    expect(queryByText('Lottie')).toBeDefined()
  })

  test('render with data', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <ModuleCarousel
          module={ModuleName.CD}
          data={{
            label: 'Contunuos Delivery',
            data: [
              {
                type: ModuleContentType.CENTER_ALIGNED_IMAGE_DESC,
                // eslint-disable-next-line
                // @ts-ignore
                data: {
                  primaryText: 'primaryTextDummy',
                  secondoryText: 'secondoryTextDummy'
                }
              },
              {
                type: ModuleContentType.LOTTIE,
                data: {
                  json: {
                    fields: {
                      // eslint-disable-next-line
                      // @ts-ignore
                      file: {
                        url: 'http://test.com'
                      }
                    }
                  }
                }
              }
            ]
          }}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.Carousel--carouselItem').length).toBe(2)
    expect(queryByText(ModuleContentType.CENTER_ALIGNED_IMAGE_DESC)).toBeDefined()
    expect(queryByText(ModuleContentType.LOTTIE)).toBeDefined()
  })
})
