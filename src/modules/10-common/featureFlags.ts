/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum FeatureFlag {
  CDNG_ENABLED = 'CDNG_ENABLED',
  CVNG_ENABLED = 'CVNG_ENABLED',
  CING_ENABLED = 'CING_ENABLED',
  CENG_ENABLED = 'CENG_ENABLED',
  CFNG_ENABLED = 'CFNG_ENABLED',
  SECURITY = 'SECURITY',
  SECURITY_STAGE = 'SECURITY_STAGE',
  NG_DASHBOARDS = 'NG_DASHBOARDS',
  CUSTOM_DASHBOARD_V2 = 'CUSTOM_DASHBOARD_V2',
  CI_OVERVIEW_PAGE = 'CI_OVERVIEW_PAGE',
  TI_CALLGRAPH = 'TI_CALLGRAPH',
  NG_TEMPLATES = 'NG_TEMPLATES',
  NG_PIPELINE_TEMPLATE = 'NG_PIPELINE_TEMPLATE',
  CE_AS_KUBERNETES_ENABLED = 'CE_AS_KUBERNETES_ENABLED',
  CE_AS_GCP_VM_SUPPORT = 'CE_AS_GCP_VM_SUPPORT',
  NG_LICENSES_ENABLED = 'NG_LICENSES_ENABLED',
  PLANS_ENABLED = 'PLANS_ENABLED',
  ARGO_PHASE1 = 'ARGO_PHASE1',
  ARGO_PHASE2_MANAGED = 'ARGO_PHASE2_MANAGED',
  FF_GITSYNC = 'FF_GITSYNC',
  FF_PIPELINE = 'FF_PIPELINE',
  FFM_1512 = 'FFM_1512',
  FFM_1513 = 'FFM_1513', // development only flag for epic https://harness.atlassian.net/browse/FFM-1513,
  FFM_1827 = 'FFM_1827',
  FEATURE_ENFORCEMENT_ENABLED = 'FEATURE_ENFORCEMENT_ENABLED',
  FREE_PLAN_ENFORCEMENT_ENABLED = 'FREE_PLAN_ENFORCEMENT_ENABLED',
  OPA_PIPELINE_GOVERNANCE = 'OPA_PIPELINE_GOVERNANCE',
  OPA_FF_GOVERNANCE = 'OPA_FF_GOVERNANCE',
  STO_CD_PIPELINE_SECURITY = 'STO_CD_PIPELINE_SECURITY',
  STO_CI_PIPELINE_SECURITY = 'STO_CI_PIPELINE_SECURITY',
  SHOW_NG_REFINER_FEEDBACK = 'SHOW_NG_REFINER_FEEDBACK',
  FREE_PLAN_ENABLED = 'FREE_PLAN_ENABLED',
  VIEW_USAGE_ENABLED = 'VIEW_USAGE_ENABLED',
  RESOURCE_CENTER_ENABLED = 'RESOURCE_CENTER_ENABLED',
  CI_VM_INFRASTRUCTURE = 'CI_VM_INFRASTRUCTURE',
  FFM_1859 = 'FFM_1859', // development only flag for epic https://harness.atlassian.net/browse/FFM-1638,
  AUDIT_TRAIL_WEB_INTERFACE = 'AUDIT_TRAIL_WEB_INTERFACE',
  CHI_CUSTOM_HEALTH = 'CHI_CUSTOM_HEALTH',
  CHI_CUSTOM_HEALTH_LOGS = 'CHI_CUSTOM_HEALTH_LOGS',
  AZURE_SAML_150_GROUPS_SUPPORT = 'AZURE_SAML_150_GROUPS_SUPPORT',
  ERROR_TRACKING_ENABLED = 'ERROR_TRACKING_ENABLED',
  CCM_ANOMALY_DETECTION_NG = 'CCM_ANOMALY_DETECTION_NG',
  DISABLE_HARNESS_SM = 'DISABLE_HARNESS_SM',
  DYNATRACE_APM_ENABLED = 'DYNATRACE_APM_ENABLED',
  GIT_SYNC_WITH_BITBUCKET = 'GIT_SYNC_WITH_BITBUCKET',
  NG_NEXUS_ARTIFACTORY = 'NG_NEXUS_ARTIFACTORY',
  TEST_INTELLIGENCE = 'TEST_INTELLIGENCE',
  CCM_DEV_TEST = 'CCM_DEV_TEST',
  ENABLE_K8S_AUTH_IN_VAULT = 'ENABLE_K8S_AUTH_IN_VAULT',
  SERVERLESS_SUPPORT = 'SERVERLESS_SUPPORT',
  BUSINESS_MAPPING = 'BUSINESS_MAPPING',
  CUSTOM_ARTIFACT_NG = 'CUSTOM_ARTIFACT_NG',
  CIE_HOSTED_BUILDS = 'CIE_HOSTED_BUILDS',
  CCM_GCP_TLS_ENABLED = 'CCM_GCP_TLS_ENABLED',
  GIT_SIMPLIFICATION = 'GIT_SIMPLIFICATION',
  CCM_SUSTAINABILITY = 'CCM_SUSTAINABILITY',
  NG_AZURE = 'NG_AZURE',
  NG_VARIABLES = 'NG_VARIABLES',
  ENV_GROUP = 'ENV_GROUP',
  NEW_PIPELINE_STUDIO = 'NEW_PIPELINE_STUDIO',
  TF_MODULE_SOURCE_INHERIT_SSH = 'TF_MODULE_SOURCE_INHERIT_SSH'
}
