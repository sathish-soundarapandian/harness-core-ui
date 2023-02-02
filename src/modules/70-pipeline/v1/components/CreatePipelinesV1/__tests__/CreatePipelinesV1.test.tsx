/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import type { PipelineCreateProps } from '@pipeline/components/PipelineStudio/CreateModal/PipelineCreate'
import CreatePipelinesV1 from '../CreatePipelinesV1'

const afterSave = jest.fn()
const closeModal = jest.fn()

const getEditProps = (
  identifier = 'test',
  description = 'desc',
  name = 'pipeline',
  repo = '',
  branch = ''
): PipelineCreateProps => ({
  afterSave,
  initialValues: { identifier, description, name, repo, branch, stages: [] },
  closeModal,
  primaryButtonText: 'continue',
  isReadonly: false
})

describe('CreatePipelinesV1 test', () => {
  test('initializes ok new inline pipeline', async () => {
    closeModal.mockReset()
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/default/projects/test-project/pipelines/:pipelineIdentifier/pipeline-studio-v1/"
        pathParams={{
          accountId: 'account_id',
          pipelineIdentifier: -1
        }}
      >
        <CreatePipelinesV1 {...getEditProps()} primaryButtonText="start" />
      </TestWrapper>
    )
    expect(getByText('start')).toBeInTheDocument()
  })

  test('initializes ok new pipeline with Git Simplification enabled', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CI_YAML_VERSIONING: true })
    })
    closeModal.mockReset()
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/default/projects/test-project/pipelines/:pipelineIdentifier/pipeline-studio-v1/"
        pathParams={{
          accountId: 'account_id',
          pipelineIdentifier: -1
        }}
        defaultAppStoreValues={{
          isGitSimplificationEnabled: true,
          supportingGitSimplification: true
        }}
      >
        <CreatePipelinesV1 {...getEditProps()} primaryButtonText="start" />
      </TestWrapper>
    )
    expect(getByText('pipeline.createPipeline.choosePipelineSetupHeader')).toBeInTheDocument()
  })
})
