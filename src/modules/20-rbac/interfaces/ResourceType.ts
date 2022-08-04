/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export type ResourceGroup = Record<string, string>
export type ResourceGroupSelection = Record<string, boolean>
export enum ResourceType {
  ACCOUNT = 'ACCOUNT',
  ORGANIZATION = 'ORGANIZATION',
  PROJECT = 'PROJECT',
  SECRET = 'SECRET',
  CONNECTOR = 'CONNECTOR',
  PIPELINE = 'PIPELINE',
  SERVICE = 'SERVICE',
  ENVIRONMENT = 'ENVIRONMENT',
  ENVIRONMENT_GROUP = 'ENVIRONMENT_GROUP',
  MONITORED_SERVICE = 'MONITORED_SERVICE',
  SERVICE_LEVEL_OBJECTIVE = 'SERVICE_LEVEL_OBJECTIVE',
  USER = 'USER',
  USERGROUP = 'USERGROUP',
  SERVICEACCOUNT = 'SERVICEACCOUNT',
  ROLE = 'ROLE',
  RESOURCEGROUP = 'RESOURCEGROUP',
  AUTHSETTING = 'AUTHSETTING',
  FILE = 'FILE',
  DELEGATE = 'DELEGATE',
  FEATUREFLAG = 'FEATUREFLAG',
  TARGETGROUP = 'TARGETGROUP',
  TARGET = 'TARGET',
  DELEGATECONFIGURATION = 'DELEGATECONFIGURATION',
  DASHBOARDS = 'DASHBOARDS',
  TEMPLATE = 'TEMPLATE',
  MONITOREDSERVICE = 'MONITOREDSERVICE',
  SLO = 'SLO',
  GOVERNANCE = 'GOVERNANCE',
  GITOPS_AGENT = 'GITOPS_AGENT',
  GITOPS_APP = 'GITOPS_APP',
  GITOPS_REPOSITORY = 'GITOPS_REPOSITORY',
  GITOPS_CLUSTER = 'GITOPS_CLUSTER',
  GITOPS_GPGKEY = 'GITOPS_GPGKEY',
  GITOPS_CERT = 'GITOPS_CERT',
  GOVERNANCE_POLICY = 'GOVERNANCEPOLICY',
  GOVERNANCE_POLICYSETS = 'GOVERNANCEPOLICYSETS',
  DELEGATE_TOKEN = 'DELEGATE_TOKEN',
  VARIABLE = 'VARIABLE',
  CHAOS_HUB = 'CHAOS_HUB',
  CHAOS_DELEGATE = 'CHAOS_DELEGATE',
  CHAOS_SCENARIO = 'CHAOS_SCENARIO',
  CHAOS_GITOPS = 'CHAOS_GITOPS',
  STO_TESTTARGET = 'STO_TESTTARGET',
  STO_EXEMPTION = 'STO_EXEMPTION',
  STO_ISSUE = 'STO_ISSUE',
  STO_SCAN = 'STO_SCAN',
  DEFAULT_SETTINGS = 'DEFAULT_SETTINGS'
}

export enum ResourceCategory {
  SHARED_RESOURCES = 'SHARED_RESOURCES',
  ADMINSTRATIVE_FUNCTIONS = 'ADMINSTRATIVE_FUNCTIONS',
  FEATUREFLAG_FUNCTIONS = 'FEATUREFLAG_FUNCTIONS',
  CHANGEINTELLIGENCE_FUNCTION = 'CHANGEINTELLIGENCE_FUNCTION',
  GITOPS = 'GITOPS',
  CHAOS = 'CHAOS',
  STO = 'STO'
}
