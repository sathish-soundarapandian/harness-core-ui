/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import HelmRepoOverrideManifest from '../HelmRepoOverrideManifest'

jest.mock('uuid')

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  selectedManifest: 'HelmRepoOverride' as ManifestTypes,
  manifestIdsList: []
}

const initialValues = {
  identifier: '',
  type: ManifestDataType.HelmRepoOverride,
  spec: {}
}
export const prevStepData = {
  connectorRef: '<+input>',
  store: 'Http'
}

export const prevStepDataForFixedConnector = {
  connectorRef: {
    value: 'bitnami'
  },
  store: 'Http'
}
describe('Manifest Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <HelmRepoOverrideManifest {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('submits with right payload for runtime input http connector', async () => {
    const helmRepoOverrideManifestProps = {
      ...props,
      prevStepData,
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.HelmRepoOverride,
        spec: initialValues
      }
    }

    const { container } = render(
      <TestWrapper>
        <HelmRepoOverrideManifest {...helmRepoOverrideManifestProps} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.HelmRepoOverride,
          spec: {
            connectorRef: '<+input>',
            type: 'Http'
          }
        }
      })
    })
  })

  test('submits with right payload for fixed value http connector', async () => {
    const helmRepoOverrideManifestProps = {
      ...props,
      prevStepData: prevStepDataForFixedConnector,
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.HelmRepoOverride,
        spec: initialValues
      }
    }

    const { container } = render(
      <TestWrapper>
        <HelmRepoOverrideManifest {...helmRepoOverrideManifestProps} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenLastCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.HelmRepoOverride,
          spec: {
            type: 'Http',
            connectorRef: 'bitnami'
          }
        }
      })
    })
  })
})
