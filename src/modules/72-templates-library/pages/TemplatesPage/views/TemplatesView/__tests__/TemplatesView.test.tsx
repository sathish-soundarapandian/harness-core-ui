/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Views } from '@wings-software/uicore'
import { defaultTo, set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import TemplatesView, { TemplatesViewProps } from '../TemplatesView'

jest.mock('@templates-library/pages/TemplatesPage/views/TemplatesGridView/TemplatesGridView', () => ({
  TemplatesGridView: () => {
    return <div className={'template-grid-view-mock'}></div>
  }
}))

jest.mock('@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplatesListView', () => ({
  TemplatesListView: () => {
    return <div className={'template-list-view-mock'}></div>
  }
}))

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const baseProps: TemplatesViewProps & { view: Views } = {
  data: defaultTo(mockTemplates.data, {}),
  gotoPage: jest.fn(),
  onSelect: jest.fn(),
  view: Views.GRID
}

describe('<TemplatesView /> tests', () => {
  test('should match snapshot in grid view', () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesView {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when git sync is enabled', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <TemplatesView {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot in list view', () => {
    const props = produce(baseProps, draft => {
      set(draft, 'view', Views.LIST)
    })
    const { container } = render(
      <TestWrapper>
        <TemplatesView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
