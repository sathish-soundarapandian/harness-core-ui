/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { getInitialValues, getPropsForBambooArtifact } from './helper'
import { BambooArtifact } from '../BambooArtifact'

jest.mock('services/cd-ng', () => ({
  useGetPlansKey: () => {
    return {
      data: {
        planKeys: [
          {
            name: 'AW-AW',
            value: 'aws_lambda'
          },
          {
            name: 'PFP-PT',
            value: 'ppt test'
          },
          {
            name: 'TES-AK',
            value: 'akhilesh-cdp'
          },
          {
            name: 'TES-HIN',
            value: 'hinger-test'
          }
        ]
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  },
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => {
    return { data: ['helloworld.war'], refetch: jest.fn(), error: null, loading: false }
  }),
  useGetBuildsForBamboo: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          number: '14',
          revision: 'e34b7e455f97b24c325c93332786b298cf4ab949',
          description: null,
          artifactPath: null,
          buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-14',
          buildDisplayName: null,
          buildFullDisplayName: null,
          artifactFileSize: null,
          uiDisplayName: 'Build# 14',
          status: null,
          buildParameters: {},
          metadata: {},
          labels: {},
          artifactFileMetadataList: []
        },
        {
          number: '11',
          revision: 'e8ec0839f2323f4fdf9837817a83658a8aebc9a8',
          description: null,
          artifactPath: null,
          buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-11',
          buildDisplayName: null,
          buildFullDisplayName: null,
          artifactFileSize: null,
          uiDisplayName: 'Build# 11',
          status: null,
          buildParameters: {},
          metadata: {},
          labels: {},
          artifactFileMetadataList: []
        }
      ],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('Bamboo tests', () => {
  test('renders form without any issues', () => {
    const initialValues = getInitialValues()
    const bambooProps = getPropsForBambooArtifact()
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={initialValues} {...bambooProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render in edit mode without issues', () => {
    const editableValues = getInitialValues(true)
    const bambooProps = getPropsForBambooArtifact()
    const values = {
      ...editableValues,
      type: 'Bamboo'
    }
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={values} {...bambooProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
