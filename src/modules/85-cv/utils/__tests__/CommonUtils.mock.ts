/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const monitoredServiceDetails = [
  {
    monitoredServiceIdentifier: 'SRM_prod',
    monitoredServiceName: 'SRM_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'SRM',
    serviceName: 'SRM',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRESRM'
    },
    projectName: 'SRE-SRM',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'C1_prod',
    monitoredServiceName: 'C1_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'C1',
    serviceName: 'C1',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'CD_prod',
    monitoredServiceName: 'CD_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'CD',
    serviceName: 'CD',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  },
  {
    monitoredServiceIdentifier: 'FF_prod',
    monitoredServiceName: 'FF_prod',
    healthSourceIdentifier: 'ART',
    healthSourceName: 'ART',
    serviceIdentifier: 'FF',
    serviceName: 'FF',
    environmentIdentifier: 'prod',
    environmentName: 'prod',
    projectParams: {
      accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
      orgIdentifier: 'default',
      projectIdentifier: 'SRE'
    },
    projectName: 'SRE',
    orgName: 'default'
  }
]

export const projectLevelMonitoredServiceIdentifier = ['SRM_prod', 'C1_prod', 'CD_prod', 'FF_prod']
export const accountLevelMonitoredServiceIdentifier = [
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRESRM.SRM_prod',
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.C1_prod',

  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.CD_prod',
  'PROJECT.-k53qRQAQ1O7DBLb9ACnjQ.default.SRE.FF_prod'
]
