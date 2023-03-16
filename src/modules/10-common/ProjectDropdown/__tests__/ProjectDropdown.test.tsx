/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { render } from '@testing-library/react'
import type { SelectOption } from '@harness/uicore'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import ProjectDropdown from '../ProjectDropdown'

jest.mock('@harness/uicore', () => {
  return {
    ...jest.requireActual('@harness/uicore'),
    DropDown: (props: any) => {
      const [items, setItems] = useState<SelectOption[]>([])

      useEffect(() => {
        props.items().then((itemsResponse: SelectOption[]) => {
          setItems(itemsResponse)
        })
      }, [])

      return (
        <div>
          projectDropdown
          <button data-testid="onChangeBtn" />
          <div data-testid="dropdownItems">
            {items.map((item: SelectOption) => (
              <div key={item.value as string}>{item.value}</div>
            ))}
          </div>
        </div>
      )
    }
  }
})

let projectListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      pageCount: 1,
      itemCount: 6,
      pageSize: 50,
      content: [
        {
          project: {
            orgIdentifier: 'testOrg',
            identifier: 'test',
            name: 'test',
            color: '#e6b800',
            modules: ['CD'],
            description: 'test',
            tags: { tag1: '', tag2: 'tag3' }
          },
          createdAt: null,
          lastModifiedAt: 1606799067248
        }
      ],
      pageIndex: 0,
      empty: false,
      totalItems: 6
    }
  })
})

jest.mock('services/cd-ng', () => ({
  getProjectListPromise: jest.fn().mockImplementation(() => {
    return projectListPromiseMock()
  })
}))

describe('project dropdown test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <ProjectDropdown onChange={noop} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('test when data is not defined', () => {
    projectListPromiseMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(undefined)
    })
    const { queryByText } = render(
      <TestWrapper>
        <ProjectDropdown onChange={noop} />
      </TestWrapper>
    )
    expect(queryByText('projectDropdown')).not.toBeNull()
  })
})
