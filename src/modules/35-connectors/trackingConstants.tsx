/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const PREFIX_CCM_EVENTS = 'ccm_'

export const CE_AWS_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'aws_overview_step',
  LOAD_CUR_STEP: PREFIX_CCM_EVENTS + 'aws_cur_step',
  LOAD_CHOOSE_REQUIREMENTS: PREFIX_CCM_EVENTS + 'aws_choose_requirements_step',
  LOAD_CREATE_CROSS_ACCOUNT_ROLE: PREFIX_CCM_EVENTS + 'aws_create_cross_account_role',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'aws_connection_test'
}

export const CE_AZURE_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'azure_overview_step',
  LOAD_AZURE_BILLING_EXPORT: PREFIX_CCM_EVENTS + 'azure_billing_export_step',
  LOAD_CHOOSE_REQUIREMENT: PREFIX_CCM_EVENTS + 'azure_choose_requirement_step',
  LOAD_SERVICE_PRINCIPAL: PREFIX_CCM_EVENTS + 'azure_service_principal_step',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'azure_connection_test'
}

export const CE_GCP_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'gcp_overview_step',
  LOAD_BILLING_EXPORT_SETUP: PREFIX_CCM_EVENTS + 'gcp_setup_billing_export_step',
  LOAD_GRANT_PERMISSIONS: PREFIX_CCM_EVENTS + 'gcp_grant_permissions_step',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'gcp_connection_test'
}

export const CE_K8S_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'k8s_overview_step',
  LOAD_FEATURE_SELECTION: PREFIX_CCM_EVENTS + 'k8s_feature_selection_selection',
  LOAD_PROVIDE_PERMISSIONS: PREFIX_CCM_EVENTS + 'k8s_provide_permission_step',
  LOAD_SECRET_CREATION: PREFIX_CCM_EVENTS + 'k8s_secret_creation_step',
  DOWNLOAD_YAML: PREFIX_CCM_EVENTS + 'k8s_download_yaml_click',
  APPLY_COMMAND_DONE: PREFIX_CCM_EVENTS + 'k8s_apply_command_done_click',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'k8s_connection_test'
}

export const CCM_CONNECTOR_SAVE_EVENT = PREFIX_CCM_EVENTS + 'connector_save'
export const CCM_CONNECTOR_SAVE_SUCCESS = PREFIX_CCM_EVENTS + 'connector_save_success'
export const CE_CONNECTOR_CLICK = PREFIX_CCM_EVENTS + 'connector_click'
export const CONNECTORS_PAGE = 'connectors_page'
