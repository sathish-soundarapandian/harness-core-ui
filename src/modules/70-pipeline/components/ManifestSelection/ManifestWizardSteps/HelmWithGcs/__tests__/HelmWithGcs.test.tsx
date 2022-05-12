/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, fireEvent, act, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithGcs from '../HelmWithGcs'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  handleSubmit: jest.fn(),
  manifestIdsList: []
}

const mockBukcets = {
  resource: { bucket1: 'bucket1', testbucket: 'testbucket' }
}

jest.mock('services/cd-ng', () => ({
  useGetGCSBucketList: jest.fn().mockImplementation(() => {
    return { data: mockBukcets, refetch: jest.fn(), error: null, loading: false }
  }),
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Pull'] }, refetch: jest.fn() }))
}))

describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.HelmChart,
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      bucketName: '',
      folderPath: '',
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithGcs {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.HelmChart,
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      bucketName: '',
      folderPath: '',
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithGcs {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      helmVersion: 'V2',
      spec: {},
      type: ManifestDataType.HelmChart,
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      store: {
        type: 'Gcs',
        spec: {
          connectorRef: '',
          bucketName: '',
          folderPath: ''
        }
      },
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id2' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id3',
      helmVersion: 'V2',
      spec: {},
      type: ManifestDataType.HelmChart,
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      store: {
        type: 'Gcs',
        spec: {
          connectorRef: 'connectorref',
          bucketName: 'bucketName',
          folderPath: 'folderPath'
        }
      },
      commandFlags: [{ commandType: 'Template', flag: 'testflag', id: 'a1' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload', async () => {
    const initialValues = {
      identifier: '',

      type: ManifestDataType.HelmChart,
      chartName: '',
      chartVersion: '',

      spec: {
        helmVersion: 'V2',
        skipResourceVersioning: false,
        store: {
          type: 'Gcs',
          spec: {
            connectorRef: 'connectorref',
            bucketName: { label: 'testbucket', value: 'testbucket' },
            folderPath: 'folderPath'
          }
        }
      },
      commandFlags: [{ commandType: 'Fetch', flag: 'flag', id: 'a1' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      await fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      await fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'test-folder ' } })

      await fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      await fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'HelmChart',
          spec: {
            store: {
              spec: {
                bucketName: {
                  label: 'testbucket',
                  value: 'testbucket'
                },
                connectorRef: '',
                folderPath: 'test-folder '
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
})
