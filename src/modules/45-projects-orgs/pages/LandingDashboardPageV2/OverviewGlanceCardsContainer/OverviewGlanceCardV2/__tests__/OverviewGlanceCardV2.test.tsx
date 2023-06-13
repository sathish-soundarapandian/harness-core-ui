/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { CurrentLocation, TestWrapper } from '@common/utils/testUtils'
import OverviewGlanceCardV2 from '../OverviewGlanceCardV2'

describe('overview glance card v2 tests', () => {
  test('render', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2 label="projectsText" loading={false} count={10} />
      </TestWrapper>
    )

    expect(queryByText('projectsText')).not.toBeNull()
    expect(queryByText('10')).not.toBeNull()
  })

  test('when loading', () => {
    const { container } = render(
      <TestWrapper>
        <OverviewGlanceCardV2 label="projectsText" loading={true} count={10} />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="spinner"]')).toBeDefined()
  })

  test('when count > 1000', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2 label="projectsText" loading={false} count={2000} />
      </TestWrapper>
    )

    expect(queryByText('projectsText')).not.toBeNull()
    expect(queryByText('2k')).not.toBeNull()
  })

  test('when count > 1000000', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2 label="projectsText" loading={false} count={2000000} />
      </TestWrapper>
    )
    expect(queryByText('projectsText')).not.toBeNull()
    expect(queryByText('2m')).not.toBeNull()
  })

  test('test with count change info', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2
          label="projectsText"
          loading={false}
          count={2000000}
          countChangeInfo={{ countChange: 10, countChangeRate: 2 }}
        />
      </TestWrapper>
    )

    expect(queryByText('projectsText')).not.toBeNull()
    expect(queryByText('2m')).not.toBeNull()
    expect(queryByText('10')).not.toBeNull()
  })

  test('test without count change', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2
          label="projectsText"
          loading={false}
          count={2000000}
          countChangeInfo={{ countChangeRate: 2 }}
        />
      </TestWrapper>
    )

    expect(queryByText('10')).toBeNull()
  })

  test('test when count change < 0', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardV2
          label="projectsText"
          loading={false}
          count={2000000}
          countChangeInfo={{ countChange: -2, countChangeRate: 2 }}
        />
      </TestWrapper>
    )
    expect(queryByText('-2')).not.toBeNull()
    expect(queryByText('-')).not.toBeNull()
  })

  test('test on click', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <OverviewGlanceCardV2
          label="projectsText"
          loading={false}
          count={2000000}
          redirectUrl="testurl"
          countChangeInfo={{ countChange: -2, countChangeRate: 2 }}
        />
        <CurrentLocation />
      </TestWrapper>
    )
    const containerElement = container.querySelector('[data-testid="overviewcard"]')
    fireEvent.click(containerElement!)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /testurl
      </div>
    `)
  })
})
