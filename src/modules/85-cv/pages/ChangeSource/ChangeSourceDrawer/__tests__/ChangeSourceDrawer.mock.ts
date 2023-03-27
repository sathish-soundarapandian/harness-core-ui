/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ChangeSourceCategoryName } from '../ChangeSourceDrawer.constants'

export const changeSourceDrawerData = {
  name: 'Harness CD Nextgen',
  identifier: 'harness_cd_next_gen',
  type: 'HarnessCDNextGen' as any,
  desc: 'Deployments from Harness CD Nextgen',
  enabled: true,
  category: 'Deployment' as any,
  spec: {}
}

export const pagerDutyChangeSourceDrawerDataWithoutService = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector'
  }
}

export const pagerDutyChangeSourceDrawerData = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector',
    pagerDutyServiceId: 'pagerDutyServiceId101'
  }
}

export const k8sChangeSourceDrawerData = {
  category: 'Infrastructure' as any,
  enabled: true,
  identifier: 'hjhjh',
  name: 'hjhjh',
  spec: {
    connectorRef: 'account.k8sqatargetng'
  },
  type: 'K8sCluster' as any
}

export const customDeployData = {
  name: 'Custom Deploy 101',
  identifier: 'Custom_Deploy_101',
  type: 'CustomDeploy' as any,
  enabled: true,
  spec: {
    name: 'Custom Deploy 101',
    webhookUrl: 'dummy url',
    webhookCurlCommand: 'dummy cURL',
    type: 'Deployment'
  },
  category: 'Deployment' as any
}

export const changeSourceTableData = [
  {
    name: 'Harness CD',
    identifier: 'harness_cd',
    type: 'HarnessCD' as any,
    desc: 'Deployments from Harness CD',
    enabled: true,
    category: 'Deployment' as any,
    spec: {}
  }
]

export const onSuccessHarnessCD = [
  {
    category: 'Deployment',
    desc: 'Deployments from Harness CD',
    enabled: true,
    identifier: 'harness_cd',
    name: 'Harness CD',
    spec: {},
    type: 'HarnessCD'
  },
  {
    category: 'Deployment',
    desc: 'Deployments from Harness CD Nextgen',
    enabled: true,
    identifier: 'harness_cd_next_gen',
    name: 'Updated Change Source',
    spec: {},
    type: 'HarnessCDNextGen'
  }
]

export const onSuccessPagerDuty = [
  {
    category: 'Alert',
    desc: 'Alert from PagerDuty',
    enabled: true,
    identifier: 'pagerduty',
    name: 'PagerDuty 101',
    spec: {
      connectorRef: 'PagerDutyConnector',
      pagerDutyServiceId: 'pagerDutyServiceId101'
    },
    type: 'PagerDuty'
  }
]

export const allFieldsEmpty = {
  category: 'Select change source provider',
  name: 'Select change source name',
  spec: {
    connectorRef: 'Connector Selection is required'
  },
  type: 'Select change source type'
}

export const emptyPagerDutyConnectorAndService = {
  spec: {
    connectorRef: 'Connector Selection is required',
    pagerDutyServiceId: ''
  }
}

export const changeSourceCategorySelectOptions = {
  Deployment: { label: 'deploymentsText', value: ChangeSourceCategoryName.DEPLOYMENT },
  Alert: { label: 'cv.changeSource.incident', value: ChangeSourceCategoryName.ALERT },
  FeatureFlag: { label: 'common.purpose.cf.continuous', value: ChangeSourceCategoryName.FEATURE_FLAG },
  ChaosExperiment: { label: 'chaos.chaosExperiment', value: ChangeSourceCategoryName.CHAOS_EXPERIMENT },
  Infrastructure: { label: 'infrastructureText', value: ChangeSourceCategoryName.INFRASTRUCTURE }
}
