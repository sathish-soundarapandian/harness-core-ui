/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { DockerRegistryArtifact } from './DockerRegistryArtifact'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'DockerRegistry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForDocker: jest.fn().mockImplementation(() => {
    return { data: null, refetch: jest.fn(), error: 'cannot fetch tags', loading: false }
  }),
  useGetLastSuccessfulBuildForDocker: jest.fn().mockImplementation(() => {
    return {
      data: {
        metadata: {
          SHA: 'test',
          SHAV2: 'test2'
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('DockerRegistry Image Path Artifact tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <DockerRegistryArtifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
