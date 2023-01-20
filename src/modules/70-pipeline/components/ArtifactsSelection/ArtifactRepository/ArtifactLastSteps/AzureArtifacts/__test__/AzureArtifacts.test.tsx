/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import { Scope } from '@common/interfaces/SecretsInterface'
import { TestWrapper } from '@common/utils/testUtils'

import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import { AzureArtifacts } from '../AzureArtifacts'

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
  selectedArtifact: 'AzureArtifacts' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

describe('Azure Artifacts tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: 'test-azure-id',

      versionType: 'value',
      scope: Scope.ORG,

      feed: 'test',
      packageType: 'Maven',
      package: 'test',
      version: '<+input>'
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
