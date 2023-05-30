import type { IconName } from '@harness/icons'
import BlueGreenVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Blue-Green-deployment.mp4'
import CanaryVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Canary-deployment.mp4'
import RollingUpdateVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Rolling-Update-deployment.mp4'

export interface EntityType {
  id: string
  label: string
  icon?: IconName
  subtitle?: string
}
export interface EntityMap {
  [key: string]: EntityType
}
export interface DeploymentFlowType extends EntityType {
  subtitle: string
}
export const SERVICE_TYPES: EntityMap = {
  KubernetesService: { id: 'KubernetesService', label: 'Kubernetes Service' },
  ServerslessFunction: { id: 'ServerlessFunction', label: 'Serverless Function' },
  TraditionalApp: { id: 'TraditionalApp', label: 'Traditional App' }
}

export const INFRA_TYPES: { [key: string]: EntityMap } = {
  KubernetesService: {
    KubernetesManifest: { id: 'KubernetesManifest', label: 'Kubernetes Manifest', icon: 'app-kubernetes' },
    HelmChart: { id: 'HelmChart', label: 'Helm Chart', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize ', label: 'Kustomize', icon: 'kustamize' },
    OpenShiftTemplate: { id: 'OpenShiftTemplate ', label: 'OpenShift Template', icon: 'openshift' }
  }
}
export const DEPLOYMENT_STRATEGY_TYPES: EntityMap = {
  Canary: { id: 'Canary', label: 'Canary', icon: 'canary-icon' },
  BlueGreen: { id: 'BlueGreen', label: 'Blue Green', icon: 'blue-green' },
  Rolling: { id: 'Rolling', label: 'Rolling Update', icon: 'rolling-update' }
}
export const DEPLOYMENT_FLOW_TYPES: { [key: string]: DeploymentFlowType } = {
  CDPipeline: {
    id: 'CDPipeline',
    label: 'CD Pipeline',
    icon: 'ci-build-pipeline',
    subtitle: 'Connect with a Kubernetes Delegate '
  },
  CDGitops: { id: 'CDGitops', label: 'CD Gitops', icon: 'slot-deployment', subtitle: 'Connect with a GitOps agent' }
}

export const StrategyVideoByType: { [key: string]: string } = {
  BlueGreen: BlueGreenVideo,
  Rolling: RollingUpdateVideo,
  Canary: CanaryVideo
}
