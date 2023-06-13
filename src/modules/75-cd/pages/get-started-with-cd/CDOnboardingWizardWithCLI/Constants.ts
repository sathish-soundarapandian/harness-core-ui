import BlueGreenVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Blue-Green-deployment.mp4'
import CanaryVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Canary-deployment.mp4'
import RollingUpdateVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Rolling-Update-deployment.mp4'
import type { EntityMap, DeploymentStrategyTypes, DeploymentFlowType } from './types'

export const SERVICE_TYPES: EntityMap = {
  KubernetesService: { id: 'KubernetesService', label: 'Kubernetes Service', icon: 'app-kubernetes' },
  ServerslessFunction: { id: 'ServerlessFunction', label: 'Serverless Function', icon: 'serverless-deploy-step' },
  TraditionalApp: { id: 'TraditionalApp', label: 'Traditional App', icon: 'square' }
}

export const INFRA_TYPES: { [key: string]: EntityMap } = {
  KubernetesService: {
    KubernetesManifest: { id: 'KubernetesManifest', label: 'Kubernetes Manifest', icon: 'app-kubernetes' },
    HelmChart: { id: 'HelmChart', label: 'Helm Chart', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize ', label: 'Kustomize', icon: 'kustamize' },
    OpenShiftTemplate: { id: 'OpenShiftTemplate ', label: 'OpenShift Template', icon: 'openshift' }
  }
}
export const DEPLOYMENT_STRATEGY_TYPES: {
  [key: string]: DeploymentStrategyTypes
} = {
  Canary: {
    id: 'Canary',
    label: 'Canary',
    icon: 'canary-icon',
    subtitle: 'Gradually release updates to minimize risks',
    steps: [
      { title: 'Canary deployment', description: 'Add canary pods until they guarantee you their safety' },
      { title: 'Canary delete', description: 'Update 50% new instances in phase 2 and verify it.' },
      { title: 'Rolling Update', description: 'Update all new instances in phase 3 and verify it.' }
    ]
  },
  BlueGreen: {
    id: 'BlueGreen',
    label: 'Blue Green',
    icon: 'blue-green',
    subtitle: 'Seamlessly switch between identical environments'
  },
  Rolling: {
    id: 'Rolling',
    label: 'Rolling Update',
    icon: 'rolling-update',
    subtitle: 'Continuously roll out updates without downtime'
  }
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

export const MAX_DELETAGE_POLL_COUNT = 10
export const DELETAGE_POLL_COUNT_INTERVAL_MS = 3000
