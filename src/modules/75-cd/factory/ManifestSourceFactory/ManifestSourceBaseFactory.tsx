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
import { AsgLaunchTemplateManifestSource } from '@cd/components/PipelineSteps/ASGServiceSpec/ManifestSource/AsgLaunchTemplateManifestSource/AsgLaunchTemplateManifestSource'
import { AsgConfigurationManifestSource } from '@cd/components/PipelineSteps/ASGServiceSpec/ManifestSource/AsgConfigurationManifestSource/AsgConfigurationManifestSource'
import { AsgScalingPolicyManifestSource } from '@cd/components/PipelineSteps/ASGServiceSpec/ManifestSource/AsgScalingPolicyManifestSource/AsgScalingPolicyManifestSource'
import { AsgScheduledGroupUpdateActionManifestSource } from '@cd/components/PipelineSteps/ASGServiceSpec/ManifestSource/AsgScheduledUpdateGroupActionManifestSource/AsgScheduledUpdateGroupActionManifestSource'
import { ReleaseRepoManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ReleaseRepoManifestSource/ReleaseRepoManifestSource'
import { DeploymentRepoManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/DeploymentRepoManifestSource/DeploymentRepoManifestSource'
import { TASManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/TASManifestSource/TASManifestSource'
import { TASAutoScalerSource } from '@cd/components/PipelineSteps/TasServiceSpec/ManifestSource/TASAutoScalerSource/TASAutoScalerSource'
import { HelmRepoOverrideManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/HelmRepoOverrideManifestSource/HelmRepoOverrideManifestSource'
import { TASVarsSource } from '@cd/components/PipelineSteps/TasServiceSpec/ManifestSource/TASVarsSource/TASVarsSource'
import { GoogleCloudFunctionDefinitionManifestSource } from '@cd/components/PipelineSteps/GoogleCloudFunction/ManifestSource/GoogleCloudFunctionDefinitionManifestSource/GoogleCloudFunctionDefinitionManifestSource'
import { AwsLambdaFunctionDefinitionManifestSource } from '@cd/components/PipelineSteps/AwsLambda/AwsLambdaServiceSpec/ManifestSource/AwsLambdaFunctionDefinitionManifestSource/AwsLambdaFunctionDefinitionManifestSource'
import { AwsLambdaFunctionAliasDefinitionManifestSource } from '@cd/components/PipelineSteps/AwsLambda/AwsLambdaServiceSpec/ManifestSource/AwsLambdaFunctionAliasDefinitionManifestSource/AwsLambdaFunctionAliasDefinitionManifestSource'
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
manifestSourceBaseFactory.registerManifestSource(new AsgLaunchTemplateManifestSource())
manifestSourceBaseFactory.registerManifestSource(new AsgConfigurationManifestSource())
manifestSourceBaseFactory.registerManifestSource(new AsgScalingPolicyManifestSource())
manifestSourceBaseFactory.registerManifestSource(new AsgScheduledGroupUpdateActionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new ReleaseRepoManifestSource())
manifestSourceBaseFactory.registerManifestSource(new DeploymentRepoManifestSource())
manifestSourceBaseFactory.registerManifestSource(new TASManifestSource())
manifestSourceBaseFactory.registerManifestSource(new TASAutoScalerSource())
manifestSourceBaseFactory.registerManifestSource(new TASVarsSource())
manifestSourceBaseFactory.registerManifestSource(new GoogleCloudFunctionDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new HelmRepoOverrideManifestSource())
manifestSourceBaseFactory.registerManifestSource(new AwsLambdaFunctionDefinitionManifestSource())
manifestSourceBaseFactory.registerManifestSource(new AwsLambdaFunctionAliasDefinitionManifestSource())

export default manifestSourceBaseFactory
