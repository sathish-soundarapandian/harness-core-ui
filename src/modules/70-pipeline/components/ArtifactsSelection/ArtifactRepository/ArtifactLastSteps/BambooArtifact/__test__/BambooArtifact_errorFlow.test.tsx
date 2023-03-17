/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render } from '@testing-library/react'
import * as cdng from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'

import { BambooArtifact } from '../BambooArtifact'
import { bambooProps, getInitialValues } from './helper'

jest.mock('services/cd-ng', () => ({
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: () =>
      Promise.reject({
        status: 'FAILURE',
        data: {
          message: 'Could not fetch plans'
        }
      }),
    refetch: jest.fn(),
    error: {
      message: 'Could not fetch plans'
    }
  })),
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: () =>
      Promise.resolve({
        status: 'FAILURE',
        data: {
          message: 'Could not fetch artifactPathss'
        }
      }),
    refetch: jest.fn(),
    error: {
      data: {
        message: 'Could not fetch artifact paths'
      }
    }
  })),

  useGetBuildsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.reject({})
    }),
    refetch: jest.fn(),
    error: {
      data: {
        message: 'Could not fetch artifact buildss'
      }
    }
  }))
}))

describe('bamboo error flow', () => {
  test('should render error component', async () => {
    jest.spyOn(cdng, 'useGetPlansKey').mockImplementation((): any => {
      return {
        loading: false,
        data: null,
        refetch: jest.fn(),
        mutate: () =>
          Promise.reject({
            status: 'FAILURE',
            data: {
              message: 'Could not fetch plans'
            }
          }),
        error: {
          data: {
            message: 'Could not fetch plans'
          }
        }
      }
    })
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getInitialValues()} {...bambooProps} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const planDropdwnBn = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    fireEvent.click(planDropdwnBn!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'common.filters.noResultsFound')
    expect(selectItem).toBeInTheDocument()
  })
})
