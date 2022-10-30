/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render, fireEvent, getByText, waitFor, getAllByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'

import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import SavedFilterData from '@ce/pages/recommendationList/__test__/FiltersData.json'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import type { QLCEViewFilterWrapper } from 'services/ce'

import RecommendationFilters from '../RecommendationFilters'
import {
  getRecommendationFilterPropertiesFromForm,
  getRecommendationFormValuesFromFilterProperties
} from '../FilterDrawer/utils'
import FilterValues from './FilterValues.json'
import LabelFilterDropdown from '../FilterDrawer/LabelFilterDropdown'

jest.mock('services/ce', () => ({
  useRecommendationFilterValues: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: FilterValues.data
      }
    }
  })),
  useGetFilterList: jest
    .fn()
    .mockImplementationOnce(() => {
      return {
        data: FilterValues.data,
        refetch: jest.fn(),
        loading: false
      }
    })
    .mockImplementation(() => {
      return {
        data: SavedFilterData,
        refetch: jest.fn(),
        loading: false
      }
    }),
  usePostFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useUpdateFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useDeleteFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

const defaultProps = {
  applyFilters: jest.fn(),
  appliedFilter: {
    identifier: getIdentifierFromName(UNSAVED_FILTER),
    filterProperties: {}
  }
}

const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

describe('Test Cases for RecommendationFilters Component', () => {
  test('Should be able to render the RecommendationFilters Component / No saved filter', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...defaultProps} />
      </TestWrapper>
    )

    expect(queryByText(container, 'common.filters.noFilterSaved')).toBeDefined()
  })

  test('Should be able to select a saved filter', async () => {
    const applyFiltersMock = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...defaultProps} applyFilters={applyFiltersMock} />
      </TestWrapper>
    )

    const filterDropdown = container.querySelector('[data-testid="filter-select"]')
    fireEvent.click(filterDropdown!)
    const listItem = document.body.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(listItem)
    expect(applyFiltersMock).toBeCalledWith({
      identifier: SavedFilterData.data.content[0].identifier,
      filterProperties: SavedFilterData.data.content[0].filterProperties
    })
  })

  test('Should be able to select / create / update / delete filters', () => {
    const applyFiltersMock = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...defaultProps} applyFilters={applyFiltersMock} />
      </TestWrapper>
    )

    const filterBtn = container.getElementsByTagName('button')[0]
    fireEvent.click(filterBtn)
    const drawer = findDrawerContainer()
    expect(getByText(drawer!, 'Filter')).toBeDefined()

    fireEvent.click(getByText(drawer!, 'Test 2'))
    expect(getAllByText(drawer!, 'Test 2').length).toBe(2)

    fireEvent.click(getByText(drawer!, 'filters.newFilter'))

    fillAtForm([
      {
        container: drawer!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'TestFilter3'
      }
    ])
    fireEvent.click(getByText(drawer!, 'save'))
    expect(drawer?.querySelectorAll('.bp3-drawer')).toBeDefined()
  })

  test('Should be able to  open filter drawer / fill filter form / clear form / apply filters', () => {
    const applyFiltersMock = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <RecommendationFilters {...defaultProps} applyFilters={applyFiltersMock} />
      </TestWrapper>
    )

    const filterBtn = container.getElementsByTagName('button')[0]
    fireEvent.click(filterBtn)
    const drawer = findDrawerContainer()
    expect(getByText(drawer!, 'Filter')).toBeDefined()

    fillAtForm([
      {
        container: drawer!,
        fieldId: 'minCost',
        type: InputTypes.TEXTFIELD,
        value: '50'
      }
    ])

    fireEvent.click(getByText(drawer!, 'filters.clearAll'))
    expect(drawer?.querySelector('input[value="50"]')).toBeNull()

    fillAtForm([
      {
        container: drawer!,
        fieldId: 'minCost',
        type: InputTypes.TEXTFIELD,
        value: '100'
      },
      {
        container: drawer!,
        fieldId: 'minSaving',
        type: InputTypes.TEXTFIELD,
        value: '200'
      },
      {
        container: drawer!,
        fieldId: 'clusterNames',
        type: InputTypes.MULTISELECT,
        multiSelectValues: ['Cluster Name 1']
      },
      {
        container: drawer!,
        fieldId: 'namespaces',
        type: InputTypes.MULTISELECT,
        multiSelectValues: ['namespaces12']
      }
    ])

    fireEvent.click(getByText(drawer!, 'filters.apply'))

    waitFor(() => {
      expect(drawer).toBeNull()
    })
  })
})

const mockFilterProperties = {
  k8sRecommendationFilterPropertiesDTO: {
    clusterNames: ['mock1'],
    names: ['mock1'],
    namespaces: ['mock1'],
    resourceTypes: ['WORKLOAD'] as ('WORKLOAD' | 'NODE_POOL' | 'ECS_SERVICE')[]
  },
  minCost: 1000,
  minSaving: 300
}

const mockFormValues = {
  clusterNames: [{ label: 'mock1', value: 'mock1' }],
  names: [{ label: 'mock1', value: 'mock1' }],
  namespaces: [{ label: 'mock1', value: 'mock1' }],
  resourceTypes: [{ label: 'WORKLOAD', value: 'WORKLOAD' }],
  minCost: 1000,
  minSaving: 300
}

describe('Test Cases for Filter Drawer Utils', () => {
  test('Test Cases for Utils', () => {
    expect(getRecommendationFormValuesFromFilterProperties(mockFilterProperties)).toMatchObject(mockFormValues)
    expect(getRecommendationFilterPropertiesFromForm(mockFormValues)).toMatchObject({
      ...mockFilterProperties,
      filterType: 'CCMRecommendation'
    })
  })
})

const labelFilterDropdownProps = {
  labelFilters: [
    {
      idFilter: {
        field: {
          fieldId: 'labels.value',
          fieldName: 'Autostopped',
          identifier: 'LABEL'
        },
        operator: 'IN',
        values: ['True']
      }
    }
  ] as QLCEViewFilterWrapper[],
  setLabelFilters: jest.fn()
}

describe('Test Cases for LabelFilterDropdown Component', () => {
  test('Should be able to render the component', async () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({
          data: { perspectiveFilters: { values: ['BLUE', 'GREEN'] } }
        })
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <LabelFilterDropdown {...labelFilterDropdownProps} />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('div[class*="bp3-tag-input-values"]')!)

    const keyPopover = findPopoverContainer()
    await waitFor(() => {
      expect(keyPopover).toBeDefined()
    })

    fireEvent.click(getByText(keyPopover!, 'BLUE'))

    const valuesPopover = document.querySelectorAll('.bp3-popover-content')[1]
    await waitFor(() => {
      expect(valuesPopover).toBeDefined()
    })

    fireEvent.click(getByText(keyPopover!, 'GREEN'))
    expect(valuesPopover.querySelector('div[class*="valuesListCtn"')).toBeDefined()
  })

  test('Should be able to remove a tag', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <LabelFilterDropdown {...labelFilterDropdownProps} />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[class*="bp3-tag-remove"]')!)
    expect(labelFilterDropdownProps.setLabelFilters).toBeCalledWith([])
  })
})
