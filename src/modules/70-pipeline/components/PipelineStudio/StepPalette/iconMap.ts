/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'

type iconMapOptions = {
  [key: string]: {
    icon: IconName
    keepOriginal?: boolean
  }
}

type stepTileIconMap = {
  [key: string]: IconName
}

export const iconMap: stepTileIconMap = {
  Apply: 'main-code-yaml',
  Scale: 'swap-vertical',
  'Stage Deployment': 'pipeline-deploy',
  'K8s Rolling Rollback': 'rolling',
  'Swap Selectors': 'command-swap',
  Delete: 'main-trash',
  Deployment: 'main-canary',
  'Terraform Apply': 'service-terraform',
  'Terraform Provision': 'service-terraform',
  'Terraform Delete': 'service-terraform',
  'Create Stack': 'service-cloudformation',
  'Delete Stack': 'service-cloudformation',
  'Shell Script Provisioner': 'command-shell-script',
  Jira: 'service-jira',
  ServiceNow: 'service-servicenow',
  Email: 'command-email',
  Barriers: 'barrier-open',
  'New Relic Deployment Maker': 'service-newrelic',
  'Templatized Secret Manager': 'main-template-library',
  Run: 'run-step',
  'Restore Cache': 'restore-cache-step',
  'Save Cache': 'save-cache-step',
  'Git Clone': 'git-clone-step',
  // TODO: temp icons
  // >> start
  JIRA: 'service-jira',
  'Approval Step': 'command-approval',
  HTTP: 'command-http',
  Plugin: 'git-clone-step',
  ResourceConstraint: 'traffic-lights'
  // << end
}

// This is temporary, need to get types as above for icons
export const iconMapByName: iconMapOptions = {
  Kubernetes: {
    icon: 'step-kubernetes',
    keepOriginal: true
  },
  'Infrastructure Provisioners': { icon: 'yaml-builder-env' },
  'Issue Tracking': { icon: 'error' },
  Notification: { icon: 'notifications' },
  FlowControl: { icon: 'settings' },
  Utilities: { icon: 'utility' },
  'Continuous Integration': { icon: 'ci-solid-current-color' },
  'Continuous Verification': { icon: 'cv-solid-current-color' },
  Jira: { icon: 'step-jira', keepOriginal: true },
  Approval: { icon: 'approval-stage-icon' },
  Terraform: { icon: 'service-terraform' },
  'Serverless Lambda': {
    icon: 'service-serverless'
  }
}
