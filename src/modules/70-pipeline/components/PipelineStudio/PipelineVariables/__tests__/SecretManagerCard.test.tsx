/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import SecretManagerCard from '../Cards/SecretManagerCard'
import { metaMap, originalSecretManager, secretManager } from './secretManagerMocks'

const PipelineMock = jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({}))

describe('SecretManagerCard tests', () => {
  test('renders init', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretManagerCard
          secretManager={secretManager}
          originalSecretManager={originalSecretManager}
          unresolvedSecretManager={{}}
          metadataMap={metaMap as any}
          allowableTypes={[]}
          stepsFactory={PipelineMock as any}
          updateSceretManager={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders when name is not set', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SecretManagerCard
          secretManager={secretManager}
          originalSecretManager={{ ...originalSecretManager, name: 'Secret Manager Name' }}
          unresolvedSecretManager={{}}
          metadataMap={metaMap as any}
          allowableTypes={[]}
          stepsFactory={PipelineMock as any}
          updateSceretManager={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText('Secret Manager: Secret Manager Name')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
