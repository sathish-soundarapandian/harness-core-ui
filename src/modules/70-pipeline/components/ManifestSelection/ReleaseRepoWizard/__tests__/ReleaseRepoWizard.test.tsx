/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-test-renderer'

import { TestWrapper } from '@common/utils/testUtils'

import { ManifestDataType, manifestStoreTypes } from '../../Manifesthelper'
import ReleaseRepoWizard from '../ReleaseRepoWizard'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: { content: [{}] } }, refetch: jest.fn() }
  })
}))

const submitFn = jest.fn()

const props = {
  expressions: [],
  allowableTypes: [],
  lastSteps: [],
  nextStep: submitFn,
  types: [
    ManifestDataType.K8sManifest,
    ManifestDataType.Values,
    ManifestDataType.HelmChart,
    ManifestDataType.OpenshiftTemplate,
    ManifestDataType.OpenshiftParam,
    ManifestDataType.Kustomize,
    ManifestDataType.KustomizePatches
  ],
  manifestStoreTypes: manifestStoreTypes,
  labels: {
    firstStepName: 'test1',
    secondStepName: 'test2'
  },
  newConnectorView: false,
  handleConnectorViewChange: jest.fn(),
  handleStoreChange: jest.fn(),
  manifest: null,
  changeManifestType: jest.fn(),
  handleSubmit: jest.fn(),
  isReadonly: false,
  stage: {
    stage: {
      name: 'Stage Name',
      identifier: 'stage_id',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            spec: {},
            type: 'Kubernetes'
          },
          serviceRef: 'knkjm'
        }
      }
    }
  },
  updateStage: jest.fn(),
  onClose: jest.fn(),
  newConnectorSteps: [],
  initialValues: { connectorRef: undefined, selectedManifest: null, store: 'Git' }
}
describe('Release Repo wizard tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <ReleaseRepoWizard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('on edit', () => {
    const editProps = {
      ...props,
      initialValues: {
        connectorRef: 'testgotconnectora',
        gitFetchType: 'Branch',
        paths: ['sdfds'],
        branch: 'sdfds',
        store: 'Git',
        selectedManifest: 'ReleaseRepo'
      },
      manifest: {
        identifier: 'sdfdsfdfd',
        type: 'ReleaseRepo',
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: 'testgotconnectora',
              gitFetchType: 'Branch',
              paths: ['sdfds'],
              branch: 'sdfds'
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ReleaseRepoWizard {...editProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('on click of continue', async () => {
    const editProps = {
      ...props,
      initialValues: {
        connectorRef: 'testgotconnectora',
        gitFetchType: 'Branch',
        paths: ['sdfds'],
        branch: 'sdfds',
        store: 'Git',
        selectedManifest: 'ReleaseRepo'
      },
      manifest: {
        identifier: 'sdfdsfdfd',
        type: 'ReleaseRepo',
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: 'testgotconnectora',
              gitFetchType: 'Branch',
              paths: ['sdfds'],
              branch: 'sdfds'
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ReleaseRepoWizard {...editProps} />
      </TestWrapper>
    )

    await act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(container).toMatchSnapshot()
  })

  test('initial render when connectorview is true', () => {
    const { container } = render(
      <TestWrapper>
        <ReleaseRepoWizard {...props} newConnectorView={true} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
