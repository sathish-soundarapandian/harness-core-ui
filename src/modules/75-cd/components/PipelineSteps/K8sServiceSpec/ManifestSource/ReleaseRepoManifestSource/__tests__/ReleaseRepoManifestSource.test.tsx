/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import type { ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { KubernetesManifests } from '../../../KubernetesManifests/KubernetesManifests'
import { manifests, template, path, stageIdentifier } from './mocks'

describe('ReleaseRepoManifestSource tests', () => {
  test('Should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          manifestSourceBaseFactory={new ManifestSourceBaseFactory()}
          stepViewType={StepViewType.DeploymentForm}
          stageIdentifier={stageIdentifier}
          path={path}
          initialValues={{ manifests: manifests as ManifestConfigWrapper[] }}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should match snapshot with fromTrigger', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          manifestSourceBaseFactory={new ManifestSourceBaseFactory()}
          stepViewType={StepViewType.DeploymentForm}
          stageIdentifier={stageIdentifier}
          path={path}
          initialValues={{ manifests: manifests as ManifestConfigWrapper[] }}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          fromTrigger={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should match snapshot with isManifestsRuntime as false', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          manifestSourceBaseFactory={new ManifestSourceBaseFactory()}
          stepViewType={StepViewType.TriggerForm}
          stageIdentifier={stageIdentifier}
          path={path}
          initialValues={{ manifests: manifests as ManifestConfigWrapper[] }}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          fromTrigger={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
