/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, fireEvent, act, waitFor, findByText } from '@testing-library/react'
import type { AllowedTypesWithRunTime} from '@harness/uicore';
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithGcs from '../HelmWithGcs'
import * as useGetHelmChartVersionData from '../../CommonManifestDetails/useGetHelmChartVersionData'

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

const mockBukcets = {
  resource: { bucket1: 'bucket1', testbucket: 'testbucket' }
}

jest.mock('services/cd-ng', () => ({
  useGetGCSBucketList: jest.fn().mockImplementation(() => {
    return { data: mockBukcets, refetch: jest.fn(), error: null, loading: false }
  }),
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Pull'] }, refetch: jest.fn() }))
}))
const useGetHelmChartVersionDataMock = {
  chartVersions: [
    { label: 'v1', value: 'v1' },
    { label: 'v2', value: 'v2' }
  ],
  loadingChartVersions: false,
  chartVersionsError: null,
  fetchChartVersions: jest.fn(),
  setLastQueryData: jest.fn()
}
jest.spyOn(useGetHelmChartVersionData, 'useGetHelmChartVersionData').mockReturnValue(useGetHelmChartVersionDataMock)

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
      subChartPath: '',
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
      subChartPath: '',
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
      subChartPath: '',
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
    //  Manual chart version dropdown input assertion
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    fireEvent.click(dropdownIcons[1]!)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'test' } })
    expect(portalDivs.length).toBe(1)
    const chartVersionDropdownPortal = portalDivs[0]
    const chartVersionSelectList = chartVersionDropdownPortal.querySelector('.bp3-menu')
    const selectedChartVersion = await findByText(chartVersionSelectList as HTMLElement, 'test')
    fireEvent.click(selectedChartVersion)

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
            chartVersion: 'test',
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })

  test(`chartVersion field placeholder should be loading when chart versions are being fetched`, async () => {
    jest
      .spyOn(useGetHelmChartVersionData, 'useGetHelmChartVersionData')
      .mockReturnValue({ ...useGetHelmChartVersionDataMock, loadingChartVersions: true })

    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      chartName: 'name',
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
    const chartVersionSelect = queryByNameAttribute('chartVersion') as HTMLInputElement
    expect(chartVersionSelect.placeholder).toBe('loading')
  })
})
