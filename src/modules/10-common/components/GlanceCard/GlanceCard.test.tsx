/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FontVariation, Icon, Layout, Text } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import GlanceCard from './GlanceCard'

const deltaElement = (
  <Layout.Horizontal>
    <Icon
      size={14}
      name={'caret-up'}
      style={{
        color: 'var(--green-800)'
      }}
    />
    <Text font={{ variation: FontVariation.TINY_SEMI }} style={{ color: 'var(--green-800)' }}>
      {new Intl.NumberFormat('default', {
        notation: 'compact',
        compactDisplay: 'short',
        unitDisplay: 'long',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(200)}
    </Text>
  </Layout.Horizontal>
)

describe('GlanceCard', () => {
  test('Projects', () => {
    const { container } = render(
      <GlanceCard
        title="Projects"
        iconName="nav-project"
        iconSize={16}
        number={48}
        delta="+1"
        href={routes.toProjects({ accountId: '123' })}
        styling
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Services', () => {
    const { container } = render(<GlanceCard title="Services" iconName="services" number={48} delta="+6" />)
    expect(container).toMatchSnapshot()
  })
  test('trend icon tests', () => {
    const { container } = render(<GlanceCard title="Services" iconName="services" number={48} delta={deltaElement} />)

    expect(container.querySelector('[data-icon="caret-up"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
