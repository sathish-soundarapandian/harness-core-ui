/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestWrapper } from '@common/utils/testUtils'
import type { ManifestConfig, ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { KubernetesManifests } from '../../../KubernetesManifests/KubernetesManifests'
import { template, manifests, manifest, initialValues } from './mock'
import { ServerlessAwsLambdaManifestSource } from '../ServerlessAwsLambdaManifestSource'

const getProps = () => {
  return {
    stepViewType: StepViewType.InputSet,
    stageIdentifier: 'Stage_1',
    formik: {},
    path: 'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec',
    readonly: false,
    allowableTypes: ['FIXED', 'EXPRESSION'] as MultiTypeInputType[],
    manifestPath: 'manifests[0].manifest',
    projectIdentifier: 'Chetan_Non_Git_Sync',
    orgIdentifier: 'default',
    accountId: 'kmpySmUISimoRrJL6NL73w',
    pipelineIdentifier: 'Pipeline_1',
    pathFieldlabel: 'common.git.filePath'
  }
}

const manifestSourceBaseFactory = new ManifestSourceBaseFactory()
const serverlessAwsLambdaManifestSource = new ServerlessAwsLambdaManifestSource()

describe('ServerlessAwsLambdaManifestContent snapshot', () => {
  test('snapshot with manifest', () => {
    const { container } = render(
      <TestWrapper>
        {serverlessAwsLambdaManifestSource.renderContent({
          ...getProps(),
          manifest: manifest as ManifestConfig,
          initialValues: initialValues as K8SDirectServiceStep,
          template: template as ServiceSpec,
          manifests: manifests as ManifestConfigWrapper[],
          isManifestsRuntime: true,
          manifestSourceBaseFactory
        })}
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot without manifest', () => {
    const { container } = render(
      <TestWrapper>
        {serverlessAwsLambdaManifestSource.renderContent({
          ...getProps(),
          initialValues: initialValues as K8SDirectServiceStep,
          template: template as ServiceSpec,
          manifests: manifests as ManifestConfigWrapper[],
          isManifestsRuntime: true,
          manifestSourceBaseFactory
        })}
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test of kubernetesmanifest', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          initialValues={initialValues as K8SDirectServiceStep}
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          readonly
          stepViewType={StepViewType.InputSet}
          stageIdentifier="stage-0"
          manifestSourceBaseFactory={manifestSourceBaseFactory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test of kubernetesmanifest with manifest as not runtime', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesManifests
          initialValues={initialValues as K8SDirectServiceStep}
          template={template as ServiceSpec}
          manifests={manifests as ManifestConfigWrapper[]}
          readonly
          stageIdentifier="stage-0"
          manifestSourceBaseFactory={manifestSourceBaseFactory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
