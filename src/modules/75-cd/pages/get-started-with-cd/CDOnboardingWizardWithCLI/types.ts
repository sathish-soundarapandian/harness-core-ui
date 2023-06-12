import type { IconName } from '@harness/icons'
export interface EntityType {
  id: string
  label: string
  icon?: IconName
}
export interface DeploymentStrategyTypes extends EntityType {
  subtitle?: string
  steps?: { title: string; description: string }[]
}
export interface EntityMap {
  [key: string]: EntityType
}
export interface DeploymentFlowType extends EntityType {
  subtitle: string
}

export enum CDOnboardingSteps {
  WHAT_TO_DEPLOY = 'whatToDeploy',
  HOW_N_WHERE_TO_DEPLOY = 'howNwhere',
  DEPLOYMENT_STEPS = 'deploymentSteps'
}
export interface WhatToDeployType {
  svcType?: EntityType
  artifactType?: EntityType
}

export interface WhereAndHowToDeployType {
  type?: DeploymentFlowType
  delegateName?: string
}
