import type { IconName } from '@harness/icons'

export interface EntityType {
  id: string
  label: string
  icon?: IconName
}
export interface DeploymentFlowType extends EntityType {
  subtitle: string
}
export const SERVICE_TYPES: { [key: string]: EntityType } = {
  KubernetesService: { id: 'KubernetesService', label: 'Kubernetes Service' },
  ServerslessFunction: { id: 'ServerslessFunction', label: 'Serversless Function' },
  TraditionalApp: { id: 'TraditionalApp', label: 'Traditional App' }
}

export const INFRA_TYPES: { [key: string]: { [key: string]: EntityType } } = {
  KubernetesService: {
    KubernetesManifest: { id: 'KubernetesManifest', label: 'Kubernetes Manifest', icon: 'app-kubernetes' },
    HelmChart: { id: 'HelmChart', label: 'Helm Chart', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize ', label: 'Kustomize', icon: 'kustamize' },
    OpenShiftTemplate: { id: 'OpenShiftTemplate ', label: 'OpenShift Template', icon: 'openshift' }
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
