/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum PermissionIdentifier {
  CREATE_PROJECT = 'core_project_create',
  UPDATE_PROJECT = 'core_project_edit',
  DELETE_PROJECT = 'core_project_delete',
  VIEW_PROJECT = 'core_project_view',
  UPDATE_SECRET = 'core_secret_edit',
  DELETE_SECRET = 'core_secret_delete',
  VIEW_SECRET = 'core_secret_view',
  ACCESS_SECRET = 'core_secret_access',
  CREATE_ORG = 'core_organization_create',
  UPDATE_ORG = 'core_organization_edit',
  DELETE_ORG = 'core_organization_delete',
  VIEW_ORG = 'core_organization_view',
  UPDATE_CONNECTOR = 'core_connector_edit',
  DELETE_CONNECTOR = 'core_connector_delete',
  VIEW_CONNECTOR = 'core_connector_view',
  ACCESS_CONNECTOR = 'core_connector_access',
  VIEW_PIPELINE = 'core_pipeline_view',
  EDIT_PIPELINE = 'core_pipeline_edit',
  DELETE_PIPELINE = 'core_pipeline_delete',
  EXECUTE_PIPELINE = 'core_pipeline_execute',

  // service permissions
  VIEW_SERVICE = 'core_service_view',
  EDIT_SERVICE = 'core_service_edit',
  DELETE_SERVICE = 'core_service_delete',
  RUNTIMEACCESS_SERVICE = 'core_service_access',

  // environment permissions
  VIEW_ENVIRONMENT = 'core_environment_view',
  EDIT_ENVIRONMENT = 'core_environment_edit',
  DELETE_ENVIRONMENT = 'core_environment_delete',
  RUNTIMEACCESS_ENVIRONMENT = 'core_environment_access',

  // environment group permissions
  VIEW_ENVIRONMENT_GROUP = 'core_environmentgroup_view',
  EDIT_ENVIRONMENT_GROUP = 'core_environmentgroup_edit',
  DELETE_ENVIRONMENT_GROUP = 'core_environmentgroup_delete',
  RUNTIMEACCESS_ENVIRONMENT_GROUP = 'core_environmentgroup_access',

  VIEW_USERGROUP = 'core_usergroup_view',
  MANAGE_USERGROUP = 'core_usergroup_manage',
  VIEW_USER = 'core_user_view',
  MANAGE_USER = 'core_user_manage',
  INVITE_USER = 'core_user_invite',
  VIEW_SERVICEACCOUNT = 'core_serviceaccount_view',
  EDIT_SERVICEACCOUNT = 'core_serviceaccount_edit',
  DELETE_SERVICEACCOUNT = 'core_serviceaccount_delete',
  MANAGE_SERVICEACCOUNT = 'core_serviceaccount_manageapikey',
  EDIT_ACCOUNT = 'core_account_edit',
  VIEW_ACCOUNT = 'core_account_view',
  VIEW_ROLE = 'core_role_view',
  UPDATE_ROLE = 'core_role_edit',
  DELETE_ROLE = 'core_role_delete',
  VIEW_RESOURCEGROUP = 'core_resourcegroup_view',
  UPDATE_RESOURCEGROUP = 'core_resourcegroup_edit',
  DELETE_RESOURCEGROUP = 'core_resourcegroup_delete',
  VIEW_AUTHSETTING = 'core_authsetting_view',
  EDIT_AUTHSETTING = 'core_authsetting_edit',
  DELETE_AUTHSETTING = 'core_authsetting_delete',
  UPDATE_DELEGATE = 'core_delegate_edit',
  DELETE_DELEGATE = 'core_delegate_delete',
  VIEW_DELEGATE = 'core_delegate_view',
  UPDATE_DELEGATE_CONFIGURATION = 'core_delegateconfiguration_edit',
  DELETE_DELEGATE_CONFIGURATION = 'core_delegateconfiguration_delete',
  VIEW_DELEGATE_CONFIGURATION = 'core_delegateconfiguration_view',
  EDIT_VARIABLE = 'core_variable_edit',
  DELETE_VARIABLE = 'core_variable_delete',
  VIEW_VARIABLE = 'core_variable_view',
  ACCESS_VARIABLE = 'core_variable_access',
  EDIT_FILE = 'core_file_edit',
  DELETE_FILE = 'core_file_delete',
  VIEW_FILE = 'core_file_view',
  ACCESS_FILE = 'core_file_access',

  // FEATURE FLAG PERMISSIONS
  DELETE_FF_FEATUREFLAG = 'ff_featureflag_delete',
  EDIT_FF_FEATUREFLAG = 'ff_featureflag_edit',
  TOGGLE_FF_FEATUREFLAG = 'ff_featureflag_toggle',
  DELETE_FF_TARGETGROUP = 'ff_targetgroup_delete',
  EDIT_FF_TARGETGROUP = 'ff_targetgroup_edit',
  CREATE_FF_SDK_KEY = 'ff_environment_apiKeyCreate',
  DELETE_FF_SDK_KEY = 'ff_environment_apiKeyDelete',

  // Dashboard Permissions
  VIEW_DASHBOARD = 'core_dashboards_view',
  EDIT_DASHBOARD = 'core_dashboards_edit',

  // GITOPS
  ADD_NEW_PROVIDER = 'ff_add_new_provider',

  // Template Permissions
  VIEW_TEMPLATE = 'core_template_view',
  EDIT_TEMPLATE = 'core_template_edit',
  DELETE_TEMPLATE = 'core_template_delete',
  ACCESS_TEMPLATE = 'core_template_access',
  COPY_TEMPLATE = 'core_template_copy',

  // This is edit, delete, access permission
  // There is no view permission for deployment freeze
  MANAGE_DEPLOYMENT_FREEZE = 'core_deploymentfreeze_manage',
  GLOBAL_DEPLOYMENT_FREEZE = 'core_deploymentfreeze_global',
  OVERRIDE_DEPLOYMENT_FREEZE = 'core_deploymentfreeze_override',

  // CHANGE INTELLIGENCE Permissions
  EDIT_MONITORED_SERVICE = 'chi_monitoredservice_edit',
  VIEW_MONITORED_SERVICE = 'chi_monitoredservice_view',
  DELETE_MONITORED_SERVICE = 'chi_monitoredservice_delete',
  TOGGLE_MONITORED_SERVICE = 'chi_monitoredservice_toggle',
  VIEW_SLO_SERVICE = 'chi_slo_view',
  EDIT_SLO_SERVICE = 'chi_slo_edit',
  DELETE_SLO_SERVICE = 'chi_slo_delete',
  VIEW_DOWNTIME = 'chi_downtime_view',
  EDIT_DOWNTIME = 'chi_downtime_edit',
  DELETE_DOWNTIME = 'chi_downtime_delete',

  // Governance Permissions
  GOV_VIEW_POLICY = 'core_governancePolicy_view',
  GOV_EDIT_POLICY = 'core_governancePolicy_edit',
  GOV_DELETE_POLICY = 'core_governancePolicy_delete',
  GOV_VIEW_POLICYSET = 'core_governancePolicySets_view',
  GOV_EDIT_POLICYSET = 'core_governancePolicySets_edit',
  GOV_DELETE_POLICYSET = 'core_governancePolicySets_delete',
  GOV_EVALUATE_POLICYSET = 'core_governancePolicySets_evaluate',

  // GitOps Permissions
  VIEW_GITOPS_AGENT = 'gitops_agent_view',
  EDIT_GITOPS_AGENT = 'gitops_agent_edit',
  DELETE_GITOPS_AGENT = 'gitops_agent_delete',
  VIEW_GITOPS_APPLICATION = 'gitops_application_view',
  EDIT_GITOPS_APPLICATION = 'gitops_application_edit',
  DELETE_GITOPS_APPLICATION = 'gitops_application_delete',
  SYNC_GITOPS_APPLICATION = 'gitops_application_sync',
  OVERRIDE_GITOPS_APPLICATION = 'gitops_application_override',
  VIEW_GITOPS_REPOSITORY = 'gitops_repository_view',
  EDIT_GITOPS_REPOSITORY = 'gitops_repository_edit',
  DELETE_GITOPS_REPOSITORY = 'gitops_repository_delete',
  VIEW_GITOPS_CLUSTER = 'gitops_cluster_view',
  EDIT_GITOPS_CLUSTER = 'gitops_cluster_edit',
  DELETE_GITOPS_CLUSTER = 'gitops_cluster_delete',
  VIEW_GITOPS_GPGKEY = 'gitops_gpgkey_view',
  EDIT_GITOPS_GPGKEY = 'gitops_gpgkey_edit',
  DELETE_GITOPS_GPGKEY = 'gitops_gpgkey_delete',
  VIEW_GITOPS_CERT = 'gitops_cert_view',
  EDIT_GITOPS_CERT = 'gitops_cert_edit',
  DELETE_GITOPS_CERT = 'gitops_cert_delete',

  // Chaos Permissions
  VIEW_CHAOS_HUB = 'chaos_chaoshub_view',
  EDIT_CHAOS_HUB = 'chaos_chaoshub_edit',
  DELETE_CHAOS_HUB = 'chaos_chaoshub_delete',
  VIEW_CHAOS_EXPERIMENT = 'chaos_chaosexperiment_view',
  EDIT_CHAOS_EXPERIMENT = 'chaos_chaosexperiment_edit',
  DELETE_CHAOS_EXPERIMENT = 'chaos_chaosexperiment_delete',
  EXECUTE_CHAOS_EXPERIMENT = 'chaos_chaosexperiment_execute',
  VIEW_CHAOS_INFRASTRUCTURE = 'chaos_chaosinfrastructure_view',
  EDIT_CHAOS_INFRASTRUCTURE = 'chaos_chaosinfrastructure_edit',
  DELETE_CHAOS_INFRASTRUCTURE = 'chaos_chaosinfrastructure_delete',
  VIEW_CHAOS_GAMEDAY = 'chaos_chaosgameday_view',
  EDIT_CHAOS_GAMEDAY = 'chaos_chaosgameday_edit',
  DELETE_CHAOS_GAMEDAY = 'chaos_chaosgameday_delete',

  // STO Permissions
  VIEW_STO_ISSUE = 'sto_issue_view',
  VIEW_STO_SCAN = 'sto_scan_view',
  VIEW_STO_TESTTARGET = 'sto_testtarget_view',
  EDIT_STO_TESTTARGET = 'sto_testtarget_edit',
  VIEW_STO_EXEMPTION = 'sto_exemption_view',
  CREATE_STO_EXEMPTION = 'sto_exemption_create',
  APPROVE_STO_EXEMPTION = 'sto_exemption_approve',
  VIEW_STO_TICKET = 'sto_ticket_view',
  EDIT_STO_TICKET = 'sto_ticket_edit',
  DELETE_STO_TICKET = 'sto_ticket_delete',

  // Default Settings
  EDIT_CORE_SETTING = 'core_setting_edit',

  // CCM Permissions
  VIEW_CCM_OVERVIEW = 'ccm_overview_view',
  VIEW_CCM_PERSPECTIVE_FOLDERS = 'ccm_folder_view',
  EDIT_CCM_PERSPECTIVE_FOLDERS = 'ccm_folder_edit',
  DELETE_CCM_PERSPECTIVE_FOLDERS = 'ccm_folder_delete',
  VIEW_CCM_PERSPECTIVE = 'ccm_perspective_view',
  EDIT_CCM_PERSPECTIVE = 'ccm_perspective_edit',
  DELETE_CCM_PERSPECTIVE = 'ccm_perspective_delete',
  VIEW_CCM_BUDGET = 'ccm_budget_view',
  EDIT_CCM_BUDGET = 'ccm_budget_edit',
  DELETE_CCM_BUDGET = 'ccm_budget_delete',
  VIEW_CCM_COST_CATEGORY = 'ccm_costCategory_view',
  EDIT_CCM_COST_CATEGORY = 'ccm_costCategory_edit',
  DELETE_CCM_COST_CATEGORY = 'ccm_costCategory_delete',
  VIEW_CCM_AUTOSTOPPING_RULE = 'ccm_autoStoppingRule_view',
  EDIT_CCM_AUTOSTOPPING_RULE = 'ccm_autoStoppingRule_edit',
  DELETE_CCM_AUTOSTOPPING_RULE = 'ccm_autoStoppingRule_delete',
  VIEW_CCM_LOADBALANCER = 'ccm_loadBalancer_view',
  EDIT_CCM_LOADBALANCER = 'ccm_loadBalancer_edit',
  DELETE_CCM_LOADBALANCER = 'ccm_loadBalancer_delete',
  VIEW_CCM_CURRENCYPREFERENCE = 'ccm_currencyPreference_view',
  EDIT_CCM_CURRENCYPREFERENCE = 'ccm_currencyPreference_edit',
  VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE = 'ccm_cloudAssetGovernanceRule_view',
  EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE = 'ccm_cloudAssetGovernanceRule_edit',
  DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE = 'ccm_cloudAssetGovernanceRule_delete',
  EXECUTE_CCM_CLOUD_ASSET_GOVERNANCE_RULE = 'ccm_cloudAssetGovernanceRule_execute',
  VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET = 'ccm_cloudAssetGovernanceRuleSet_view',
  EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET = 'ccm_cloudAssetGovernanceRuleSet_edit',
  DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_SET = 'ccm_cloudAssetGovernanceRuleSet_delete',
  VIEW_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT = 'ccm_cloudAssetGovernanceEnforcement_view',
  EDIT_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT = 'ccm_cloudAssetGovernanceEnforcement_edit',
  DELETE_CCM_CLOUD_ASSET_GOVERNANCE_RULE_ENFORCEMENT = 'ccm_cloudAssetGovernanceEnforcement_delete',
  // Billing Permissions
  EDIT_LICENSE = 'core_license_edit',
  DELETE_LICENSE = 'core_license_delete',
  VIEW_LICENSE = 'core_license_view',

  // IACM Permissions
  IAC_VIEW_STACK = 'iac_stack_view',
  IAC_EDIT_STACK = 'iac_stack_edit',
  IAC_DELETE_STACK = 'iac_stack_delete',

  // Log Streaming Permissions
  VIEW_STREAMING_DESTINATION = 'core_streamingDestination_view',
  CREATE_OR_EDIT_STREAMING_DESTINATION = 'core_streamingDestination_edit',
  DELETE_STREAMING_DESTINATION = 'core_streamingDestination_delete',

  //IDP Permisssions
  IDP_SETTINGS_MANAGE = 'idp_idpsettings_manage',

  //Harness Code permissions
  CODE_REPO_EDIT = 'code_repo_edit',
  CODE_REPO_CREATE = 'code_repo_create',
  CODE_REPO_DELETE = 'code_repo_delete',
  CODE_REPO_VIEW = 'code_repo_view',
  CODE_REPO_PUSH = 'code_repo_push'
}
