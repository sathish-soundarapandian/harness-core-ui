/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { mockTemplates, mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'
import { useMutateAsGet } from '@common/hooks'
import type { TemplateDetailsDrawerProps } from '@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'
import type { GitFiltersProps } from '@common/components/GitFilters/GitFilters'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import * as hooks from '@common/hooks/useMutateAsGet'
import routes from '@common/RouteDefinitions'
import { pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import {
  mockApiErrorResponse,
  mockApiFetchingResponse
} from '@templates-library/components/TemplateActivityLog/__tests__/TemplateActivityLogTestHelper'
import { StageTemplate } from '@templates-library/components/Templates/StageTemplate/StageTemplate'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { ExecutionTemplate } from '@templates-library/components/Templates/ExecutionTemplate/ExecutionTemplate'
import { InfrastructureTemplate } from '@templates-library/components/Templates/InfrastructureTemplate/InfrastructureTemplate'
import { PipelineTemplate } from '@templates-library/components/Templates/PipelineTemplate/PipelineTemplate'
import { ServiceTemplate } from '@templates-library/components/Templates/ServiceTemplate/ServiceTemplate'
import { StepGroupTemplate } from '@templates-library/components/Templates/StepGroupTemplate/StepGroupTemplate'

const templateListCallMock = jest
  .spyOn(hooks, 'useMutateAsGet')
  .mockImplementation(() => mockTemplatesSuccessResponse as any)

jest.mock('@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView', () => ({
  ...jest.requireActual('@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'),
  __esModule: true,
  default: (props: TemplatesViewProps) => {
    return (
      <div className={'templates-view-mock'}>
        <button onClick={() => props.onSelect(mockTemplates.data?.content?.[0] || {})}>Select Template</button>
      </div>
    )
  }
}))

jest.mock('@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer', () => ({
  ...jest.requireActual('@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer'),
  TemplateDetailsDrawer: (props: TemplateDetailsDrawerProps) => {
    return (
      <div className={'template-detail-drawer-mock'}>
        <button onClick={props.onClose}>Close</button>
      </div>
    )
  }
}))

jest.mock('@common/components/GitFilters/GitFilters', () => ({
  ...jest.requireActual('@common/components/GitFilters/GitFilters'),
  __esModule: true,
  default: (props: GitFiltersProps) => {
    return (
      <div className={'git-filters-mock'}>
        <button onClick={() => props.onChange({ repo: 'repo', branch: 'branch' })}>Change Git Filter</button>
      </div>
    )
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

const PATH = routes.toTemplates({ ...projectPathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  module: 'cd'
}

const defaultQueryParams = {
  accountIdentifier: 'accountId',
  orgIdentifier: 'default',
  page: 0,
  projectIdentifier: 'Yogesh_Test',
  searchTerm: '',
  size: 20,
  sort: ['lastUpdatedAt', 'DESC'],
  templateListType: 'LastUpdated'
}

const mockEmptySuccessResponse = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  cancel: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      content: []
    }
  }
}

describe('<TemplatesPage /> tests', () => {
  beforeEach(() => jest.clearAllMocks())
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
    templateFactory.registerTemplate(new StageTemplate())
    templateFactory.registerTemplate(new PipelineTemplate())
    templateFactory.registerTemplate(new ServiceTemplate())
    templateFactory.registerTemplate(new InfrastructureTemplate())
    templateFactory.registerTemplate(new StepGroupTemplate())
    templateFactory.registerTemplate(new ExecutionTemplate())
  })

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(templateListCallMock).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryParams: defaultQueryParams
      })
    )
  })

  test('should call get template api with correct params when type filter is changed', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    const typeFilterButton = getByText('all')
    act(() => {
      fireEvent.click(typeFilterButton)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const menuItems = popover.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBeGreaterThan(2)

    act(() => {
      fireEvent.click(menuItems[1])
    })

    expect(useMutateAsGet).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({ body: { filterType: 'Template', templateEntityTypes: ['Stage'] } })
    )
  })

  test('should open template drawer when template is selected', () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    const selectTemplateButton = getByText('Select Template')
    act(() => {
      fireEvent.click(selectTemplateButton)
    })

    let drawerContainer = container.querySelector('[class*="template-detail-drawer-mock"]')
    expect(drawerContainer).not.toBeNull()

    const closeButton = getByText('Close')
    act(() => {
      fireEvent.click(closeButton)
    })
    drawerContainer = container.querySelector('[class*="template-detail-drawer-mock"]')
    expect(drawerContainer).toBeNull()
  })

  test('should change git filters correctly', () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS} defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <TemplatesPage />
      </TestWrapper>
    )

    const changeGitFilterButton = getByText('Change Git Filter')
    act(() => {
      fireEvent.click(changeGitFilterButton)
    })
    expect(useMutateAsGet).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryParams: {
          ...defaultQueryParams,
          repoIdentifier: 'repo',
          branch: 'branch'
        }
      })
    )
  })

  test('should render no results view correctly', async () => {
    templateListCallMock.mockReturnValue(mockEmptySuccessResponse as any)

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render loading view correctly', async () => {
    templateListCallMock.mockImplementation(() => mockApiFetchingResponse as any)

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    const refetch = jest.fn()
    templateListCallMock.mockImplementation(() => ({ ...mockApiErrorResponse, refetch } as any))

    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    waitFor(() => getByText('Retry'))

    act(() => {
      fireEvent.click(getByText('Retry'))
    })

    expect(refetch).toBeCalledTimes(1)
  })

  test('should render no results view correctly with search params', async () => {
    templateListCallMock.mockReturnValue(mockEmptySuccessResponse as any)

    const { container, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplatesPage />
      </TestWrapper>
    )

    await waitFor(() => getByTestId('dropdown-button'))
    const typeButton = getByTestId('dropdown-button')
    act(() => {
      fireEvent.click(typeButton)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const menuItems = popover.querySelectorAll('[class*="menuItem"]')
    act(() => {
      fireEvent.click(menuItems[1])
    })

    act(() => {
      fireEvent.click(getByRole(container, 'button', { name: /common.filters.clearFilters/ }))
    })

    expect(templateListCallMock).toHaveBeenNthCalledWith(
      4,
      expect.anything(),
      expect.objectContaining({
        body: {
          filterType: 'Template'
        },
        queryParams: defaultQueryParams
      })
    )
  })
})
