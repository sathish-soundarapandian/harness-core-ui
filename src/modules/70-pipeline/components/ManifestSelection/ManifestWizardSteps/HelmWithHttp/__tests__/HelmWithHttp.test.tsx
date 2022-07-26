/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, queryByAttribute, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithHttp from '../HelmWithHttp'

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

jest.mock('services/cd-ng', () => ({
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Pull'] }, refetch: jest.fn() }))
}))

describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        helmVersion: 'test',
        chartName: 'test',
        chartVersion: 'v3'
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        helmVersion: 'test',
        chartName: 'test',
        chartVersion: 'v3'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithHttp {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit mode with connectorref`, () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'Http',
          spec: {
            connectorRef: 'test'
          }
        },
        helmVersion: 'test',
        chartName: 'test',
        chartVersion: 'v3',
        skipResourceVersioning: false
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload', async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'Http',
          spec: {
            connectorRef: 'test'
          }
        },
        helmVersion: 'V2',
        chartName: 'test',
        chartVersion: 'v3',
        skipResourceVersioning: false,
        commandFlags: [{ commandType: 'Template', flag: 'flag' }]
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'HelmChart',
          spec: {
            chartName: 'testchart',
            chartVersion: 'v1',
            store: {
              spec: {
                connectorRef: ''
              },
              type: undefined
            },
            helmVersion: 'V2',
            skipResourceVersioning: false,
            commandFlags: [{ commandType: 'Template', flag: 'flag' }]
          }
        }
      })
    })
  })
})
