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
import CarouselImageAndDescription from '../CarousellmageAndDescription'

const image = {
  metadata: {
    tags: []
  },
  sys: {
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'dummy'
      }
    },
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'uu5c47kz2byk'
      }
    },
    id: '4ebrw6LbQrQl9HoRPot1kr',
    type: 'Asset',
    createdAt: '2022-08-16T13:33:50.582Z',
    updatedAt: '2022-08-16T13:33:50.582Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    revision: 1,
    locale: 'en-US'
  },
  fields: {
    title: 'CD Image',
    description: '',
    file: {
      url: '//images.ctfassets.net/uu5c47kz2byk/4ebrw6LbQrQl9HoRPot1kr/03d1be15bbfa81026882106b6eee0697/Allow_Save_Despite_form_issues_1.png',
      details: {
        size: 63941,
        image: {
          width: 654,
          height: 351
        }
      },
      fileName: 'Allow Save Despite form issues 1.png',
      contentType: 'image/png'
    }
  }
}

describe('Carousel Image and description', () => {
  test('render', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CarouselImageAndDescription
          activeModule={ModuleName.CD}
          primaryText="primary text"
          secondaryText="secondory text"
          // eslint-disable-next-line
          // @ts-ignore
          image={image}
        />
      </TestWrapper>
    )

    expect(getByText('primary text')).toBeDefined()
    expect(getByText('secondory text')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
