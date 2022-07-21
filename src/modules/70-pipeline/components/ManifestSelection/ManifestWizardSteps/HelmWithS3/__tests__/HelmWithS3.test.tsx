/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as ngServices from 'services/cd-ng'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithS3 from '../HelmWithS3'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  manifestIdsList: []
}

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

const mockBuckets = {
  resource: [{ name: 'test-bucket', value: 'test-bucket' }]
}

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetBucketListForS3: jest.fn(),
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Fetch'] }, refetch: jest.fn() }))
}))

describe('helm with S3 tests', () => {
  beforeAll(() => {
    jest.spyOn(ngServices, 'useGetBucketListForS3').mockImplementation((): any => {
      return { data: mockBuckets, refetch: jest.fn(), error: null, loading: false }
    })
  })
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: 'test',
      spec: {},
      type: ManifestDataType.HelmChart,
      bucketName: { label: 'test-bucket', value: 'test-bucket' },
      region: { name: '', value: '' },
      folderPath: 'testfolder',
      helmVersion: 'V2',
      chartName: 'testChart',
      chartVersion: 'v1',
      skipResourceVersioning: false
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: 'test',
      bucketName: { label: 'test-bucket', value: 'test-bucket' },
      spec: {},
      type: ManifestDataType.HelmChart,
      region: { name: '', value: '' },
      folderPath: 'testfolder',
      helmVersion: 'V2',
      chartName: 'testChart',
      chartVersion: 'v1',
      skipResourceVersioning: false
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test('load form correctly in edit mode and fill region', () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'test',
            bucketName: 'test-bucket',
            folderPath: 'testfolder',
            region: 'region1'
          }
        },
        chartName: 'testChart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`submits with the right payload`, async () => {
    const initialValues = {
      identifier: 'testidentifier',
      spec: {
        store: {
          spec: {
            bucketName: 'test-bucket',
            connectorRef: '',
            folderPath: 'testFolder',
            region: 'region1'
          }
        },
        chartName: 'testchart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      },
      type: ManifestDataType.HelmChart
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(container.querySelector('button[type="submit"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'HelmChart',
          spec: {
            store: {
              spec: {
                bucketName: 'test-bucket',
                connectorRef: '',
                folderPath: 'testFolder',
                region: 'region1'
              },
              type: undefined
            },
            chartName: 'testchart',
            chartVersion: 'v1',
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })

  test('bucketname is null', () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'test',
            bucketName: '',
            folderPath: 'testfolder',
            region: 'region1'
          }
        },
        chartName: 'testChart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      }
    }
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    const bucketField = getByPlaceholderText('pipeline.manifestType.bucketPlaceHolder')
    userEvent.click(bucketField)
    expect(container).toMatchSnapshot()
  })
})

describe('bucketFetch loading true', () => {
  beforeAll(() => {
    jest.spyOn(ngServices, 'useGetBucketListForS3').mockImplementation((): any => {
      return { data: null, refetch: jest.fn(), error: null, loading: true }
    })
  })
  test('bucketFetch loading true', () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'test',
            bucketName: RUNTIME_INPUT_VALUE,
            folderPath: 'testfolder',
            region: 'region1'
          }
        },
        chartName: 'testChart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
