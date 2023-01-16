/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import * as hooks from '@common/hooks/useFeatureFlag'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import * as artifactSourceUtils from '../../artifactSourceUtils'
import { KubernetesPrimaryArtifacts } from '../../../KubernetesArtifacts/KubernetesPrimaryArtifacts/KubernetesPrimaryArtifacts'
import { KubernetesSidecarArtifacts } from '../../../KubernetesArtifacts/KubernetesSidecarArtifacts/KubernetesSidecarArtifacts'

import { template, artifacts } from './mocks'

jest.spyOn(artifactSourceUtils, 'fromPipelineInputTriggerTab')
describe('Docker Artifact Source tests', () => {
  test('snapshot test for Primary Docker artifact source', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesPrimaryArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('snapshot test for Sidecar Docker artifact source', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    //sdfhsdjkfhdks
    expect(container).toMatchSnapshot()
    expect(await waitFor(() => findByText('pipelineSteps.deploy.inputSet.artifactServer'))).toBeInTheDocument()
    expect(await waitFor(() => findByText('pipeline.imagePathLabel'))).toBeInTheDocument()
    expect(await waitFor(() => artifactSourceUtils.fromPipelineInputTriggerTab)).toBeCalled()
  })

  test('when featureflag is enabled - shows digest field', () => {
    const useFeatureFlags = jest.spyOn(hooks, 'useFeatureFlags')
    useFeatureFlags.mockReturnValue({ CD_NG_DOCKER_ARTIFACT_DIGEST: true })

    const { container } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
          fromTrigger={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
