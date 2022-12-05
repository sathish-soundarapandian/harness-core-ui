/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { K8sManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/K8sManifestSource/K8sManifestSource'
import { ValuesYamlManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ValuesYamlManifestSource/ValuesYamlManifestSource'
import { OpenshiftTemplateManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/OpenshiftTemplateManifestSource/OpenshiftTemplateManifestSource'
import { OpenshiftParamManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/OpenshiftParamManifestSource/OpenshiftParamManifestSource'
import { KustomizeManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/KustomizeManifestSource/KustomizeManifestSource'
import { KustomizePatchesManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/KustomizePatchesManifestSource/KustomizePatchesManifestSource'
import { HelmChartManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/HelmChartManifestSource/HelmChartManifestSource'
import { ServerlessAwsLambdaManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ServerlessAwsLambdaManifestSource/ServerlessAwsLambdaManifestSource'
import { EcsTaskDefinitionManifestSource } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/EcsTaskDefinitionManifestSource/EcsTaskDefinitionManifestSource'
import { EcsServiceDefinitionManifestSource } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/EcsServiceDefinitionManifestSource/EcsServiceDefinitionManifestSource'
import { EcsScalableTargetDefinitionManifestSource } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/EcsScalableTargetDefinitionManifestSource/EcsScalableTargetDefinitionManifestSource'
import { EcsScalingPolicyDefinitionManifestSource } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/EcsScalingPolicyDefinitionManifestSource/EcsScalingPolicyDefinitionManifestSource'
import { ReleaseRepoManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ReleaseRepoManifestSource/ReleaseRepoManifestSource'
import { DeploymentRepoManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/DeploymentRepoManifestSource/DeploymentRepoManifestSource'

import type { ManifestSourceBase } from './ManifestSourceBase'

export class ManifestSourceBaseFactory {
  protected manifestSourceDict: Map<string, ManifestSourceBase<unknown>>

  constructor() {
    this.manifestSourceDict = new Map()
  }

  getManifestSource<T>(manifestSourceType: string): ManifestSourceBase<T> | undefined {
    if (manifestSourceType) {
      return this.manifestSourceDict.get(manifestSourceType) as ManifestSourceBase<T>
    }
  }

  registerManifestSource<T>(manifestSource: ManifestSourceBase<T>): void {
    this.manifestSourceDict.set(manifestSource.getManifestSourceType(), manifestSource)
  }

  deRegisterManifestSource(manifestSourceType: string): void {
    this.manifestSourceDict.delete(manifestSourceType)
  }
}

const manifestSourceBaseFactory = new ManifestSourceBaseFactory()
manifestSourceBaseFactory.registerManifestSource(new K8sManifestSource())
manifestSourceBaseFactory.registerManifestSource(new ValuesYamlManifestSource())
manifestSourceBaseFactory.registerManifestSource(new OpenshiftTemplateManifestSource())
manifestSourceBaseFactory.registerManifestSource(new OpenshiftParamManifestSource())
manifestSourceBaseFactory.registerManifestSource(new KustomizeManifestSource())
manifestSourceBaseFactory.registerManifestSource(new KustomizePatchesManifestSource())
manifestSourceBaseFactory.registerManifestSource(new HelmChartManifestSource())
manifestSourceBaseFactory.registerManifestSource(new ServerlessAwsLambdaManifestSource())
manifestSourceBaseFactory.registerManifestSource(new EcsTaskDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new EcsServiceDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new EcsScalableTargetDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new EcsScalingPolicyDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new ReleaseRepoManifestSource())
manifestSourceBaseFactory.registerManifestSource(new DeploymentRepoManifestSource())

export default manifestSourceBaseFactory
