/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType, AllowedTypesWithRunTime } from '@harness/uicore'

import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { TestWrapper } from '@common/utils/testUtils'
import { AmazonMachineImage } from '../AmazonMachineImage'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: ModalViewFor.SIDECAR,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'AmazonMachineImage' as ArtifactType,
  selectedDeploymentType: 'Kubernetes'
}
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: [
          {
            name: 'US East (N. Virginia)',
            value: 'us-east-1',
            valueType: null
          }
        ]
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useListVersionsForAMIArtifact: jest.fn().mockImplementation(() => {
    return {
      data: [],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  ...jest.requireActual('services/cd-ng-rq'),
  useListTagsForAmiArtifactMutation: jest.fn().mockImplementation(() => {
    return { data: [], mutate: jest.fn(), error: null, isLoading: false }
  })
}))

describe('AMI Artifact tests', () => {
  test('should render form without any issues', () => {
    const initialValues = {
      identifier: 'test',
      versionType: '',
      type: 'AmazonMachineImage',
      spec: {
        connectorRef: 'test-conector',
        region: 'us-east-1',
        filters: [{ name: 'filter1', value: 'filter1-value' }],
        tags: [{ name: 'tag1', value: 'value1' }],
        version: 'test',
        versionType: 'value'
      }
    }

    const { container } = render(
      <TestWrapper>
        <AmazonMachineImage
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
          context={ModalViewFor.PRIMARY}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render the runtime fields correctly', () => {
    const initialValues = {
      identifier: 'test',
      versionType: '',
      type: 'AmazonMachineImage',
      spec: {
        connectorRef: 'test-conector',
        region: '<+input>',
        filters: [{ name: 'filter1', value: 'filter1-value' }],
        tags: '<+input>',
        version: '<+input>',
        versionType: 'value'
      }
    }
    const { container } = render(
      <TestWrapper>
        <AmazonMachineImage
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
          context={ModalViewFor.PRIMARY}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render when versiontype is regex', () => {
    const initialValues = {
      identifier: 'test',
      type: 'AmazonMachineImage',
      spec: {
        connectorRef: 'test-conector',
        region: '<+input>',
        filters: '<+input>',
        tags: '<+input>',
        versionRegex: '<+input>',
        versionType: 'regex'
      }
    }
    const { container } = render(
      <TestWrapper>
        <AmazonMachineImage
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
          context={ModalViewFor.PRIMARY}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
