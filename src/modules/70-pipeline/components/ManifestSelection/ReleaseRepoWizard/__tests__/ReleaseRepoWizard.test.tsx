/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { ManifestDataType, manifestStoreTypes } from '../../Manifesthelper'
import ReleaseRepoWizard from '../ReleaseRepoWizard'

const props = {
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
  selectedManifest: null,
  newConnectorView: false,
  handleConnectorViewChange: jest.fn(),
  handleStoreChange: jest.fn(),
  manifest: null,
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

  test(`new connector view works correctly`, async () => {
    const { container } = render(
      <TestWrapper>
        <ReleaseRepoWizard {...props} />
      </TestWrapper>
    )

    const gitconnectorCard = container.getElementsByClassName('Thumbnail--squareCardContainer')[0]
    fireEvent.click(gitconnectorCard)
    const newConnectorLabel = await findByText(container, 'newLabel Git connector')
    expect(newConnectorLabel).toBeDefined()
    const newConnectorBtn = container.getElementsByClassName('addNewManifest')[0]
    expect(newConnectorBtn).toBeDefined()
    fireEvent.click(newConnectorLabel)

    expect(container).toMatchSnapshot()
  })
})
