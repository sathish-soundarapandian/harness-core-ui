/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import type { ValidationError } from '../schemas/ValidationError'

export interface Failure {
  code?:
    | 'ABORT_ALL_ALREADY'
    | 'ACCESS_DENIED'
    | 'ACCOUNT_DISABLED'
    | 'ACCOUNT_DOES_NOT_EXIST'
    | 'ACCOUNT_MIGRATED'
    | 'APM_CONFIGURATION_ERROR'
    | 'APPDYNAMICS_CONFIGURATION_ERROR'
    | 'APPDYNAMICS_ERROR'
    | 'APPROVAL_STEP_NG_ERROR'
    | 'ARTIFACT_SERVER_ERROR'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'AWS_ACCESS_DENIED'
    | 'AWS_APPLICATION_AUTO_SCALING'
    | 'AWS_ASG_ERROR'
    | 'AWS_CF_ERROR'
    | 'AWS_CLUSTER_NOT_FOUND'
    | 'AWS_ECS_CLIENT_ERROR'
    | 'AWS_ECS_ERROR'
    | 'AWS_ECS_SERVICE_NOT_ACTIVE'
    | 'AWS_IAM_ERROR'
    | 'AWS_INSTANCE_ERROR'
    | 'AWS_LOAD_BALANCER_ERROR'
    | 'AWS_SECRETS_MANAGER_OPERATION_ERROR'
    | 'AWS_SERVICE_NOT_FOUND'
    | 'AWS_STS_ERROR'
    | 'AWS_TAG_ERROR'
    | 'AWS_VPC_ERROR'
    | 'AZURE_APP_SERVICES_TASK_EXCEPTION'
    | 'AZURE_ARM_TASK_EXCEPTION'
    | 'AZURE_AUTHENTICATION_ERROR'
    | 'AZURE_BP_TASK_EXCEPTION'
    | 'AZURE_CLIENT_EXCEPTION'
    | 'AZURE_CONFIG_ERROR'
    | 'AZURE_KEY_VAULT_OPERATION_ERROR'
    | 'AZURE_SERVICE_EXCEPTION'
    | 'BARRIERS_NOT_RUNNING_CONCURRENTLY'
    | 'BASELINE_CONFIGURATION_ERROR'
    | 'BATCH_PROCESSING_ERROR'
    | 'BUCKET_SERVER_ERROR'
    | 'CACHE_NOT_FOUND_EXCEPTION'
    | 'CG_LICENSE_USAGE_ERROR'
    | 'CLOUDWATCH_CONFIGURATION_ERROR'
    | 'CLOUDWATCH_ERROR'
    | 'CLUSTER_NOT_FOUND'
    | 'COMMAND_DOES_NOT_EXIST'
    | 'COMMAND_EXECUTION_ERROR'
    | 'COMMNITY_EDITION_NOT_FOUND'
    | 'CONNECTION_ERROR'
    | 'CONNECTION_TIMEOUT'
    | 'CONNECTOR_NOT_FOUND_EXCEPTION'
    | 'CONNECTOR_VALIDATION_EXCEPTION'
    | 'CONTEXT'
    | 'COULD_NOT_MAP_BEFORE_YAML'
    | 'CUSTOM_APPROVAL_ERROR'
    | 'DATA'
    | 'DATA_COLLECTION_ERROR'
    | 'DATA_DOG_CONFIGURATION_ERROR'
    | 'DATA_PROCESSING_ERROR'
    | 'DEFAULT_ERROR_CODE'
    | 'DELEGATE_ERROR_HANDLER_EXCEPTION'
    | 'DELEGATE_NOT_AVAILABLE'
    | 'DELEGATE_NOT_REGISTERED'
    | 'DELEGATE_TASK_EXPIRED'
    | 'DELEGATE_TASK_RETRY'
    | 'DELEGATE_TASK_VALIDATION_FAILED'
    | 'DELETE_NOT_ALLOWED'
    | 'DEPLOYMENT_GOVERNANCE_ERROR'
    | 'DEPLOYMENT_MIGRATION_ERROR'
    | 'DEPLOY_MODE_IS_NOT_ON_PREM'
    | 'DOMAIN_NOT_ALLOWED_TO_REGISTER'
    | 'DOMAIN_WHITELIST_FILTER_CHECK_FAILED'
    | 'DUPLICATE_ARTIFACTSTREAM_NAMES'
    | 'DUPLICATE_COMMAND_NAMES'
    | 'DUPLICATE_DELEGATE_EXCEPTION'
    | 'DUPLICATE_FIELD'
    | 'DUPLICATE_FILE_IMPORT'
    | 'DUPLICATE_HOST_NAMES'
    | 'DUPLICATE_STATE_NAMES'
    | 'DYNA_TRACE_CONFIGURATION_ERROR'
    | 'DYNA_TRACE_ERROR'
    | 'ELK_CONFIGURATION_ERROR'
    | 'EMAIL_ERROR'
    | 'EMAIL_FAILED'
    | 'EMAIL_NOT_VERIFIED'
    | 'EMAIL_VERIFICATION_TOKEN_NOT_FOUND'
    | 'ENCRYPTION_NOT_CONFIGURED'
    | 'ENCRYPT_DECRYPT_ERROR'
    | 'ENGINE_ENTITY_UPDATE_EXCEPTION'
    | 'ENGINE_EXPRESSION_EVALUATION_ERROR'
    | 'ENGINE_FUNCTOR_ERROR'
    | 'ENGINE_INTERRUPT_PROCESSING_EXCEPTION'
    | 'ENGINE_IO_EXCEPTION'
    | 'ENGINE_OUTCOME_EXCEPTION'
    | 'ENGINE_SWEEPING_OUTPUT_EXCEPTION'
    | 'ENTITY_NOT_FOUND'
    | 'ENTITY_REFERENCE_EXCEPTION'
    | 'ERROR_IN_GETTING_CHANNEL_STREAMS'
    | 'EVENT_PUBLISH_FAILED'
    | 'EXCEPTION_HANDLER_NOT_FOUND'
    | 'EXPIRED_TOKEN'
    | 'EXPIRE_ALL_ALREADY'
    | 'EXPLANATION'
    | 'EXPRESSION_EVALUATION_FAILED'
    | 'FAILED_TO_ACQUIRE_NON_PERSISTENT_LOCK'
    | 'FAILED_TO_ACQUIRE_PERSISTENT_LOCK'
    | 'FEATURE_UNAVAILABLE'
    | 'FILE_CREATE_ERROR'
    | 'FILE_DOWNLOAD_FAILED'
    | 'FILE_INTEGRITY_CHECK_FAILED'
    | 'FILE_NOT_FOUND_ERROR'
    | 'FILE_READ_FAILED'
    | 'FILE_SIZE_EXCEEDS_LIMIT'
    | 'FILTER_CREATION_ERROR'
    | 'FREEZE_EXCEPTION'
    | 'GCP_KMS_OPERATION_ERROR'
    | 'GCP_MARKETPLACE_EXCEPTION'
    | 'GCP_SECRET_MANAGER_OPERATION_ERROR'
    | 'GCP_SECRET_OPERATION_ERROR'
    | 'GCP_SERVER_ERROR'
    | 'GENERAL_ERROR'
    | 'GENERAL_YAML_ERROR'
    | 'GENERAL_YAML_INFO'
    | 'GIT_CONNECTION_ERROR'
    | 'GIT_DIFF_COMMIT_NOT_IN_ORDER'
    | 'GIT_ERROR'
    | 'GIT_OPERATION_ERROR'
    | 'GIT_SYNC_ERROR'
    | 'GIT_UNSEEN_REMOTE_HEAD_COMMIT'
    | 'GRAPHQL_ERROR'
    | 'HEALTH_ERROR'
    | 'HINT'
    | 'HTTP_RESPONSE_EXCEPTION'
    | 'ILLEGAL_ARGUMENT'
    | 'ILLEGAL_STATE'
    | 'IMAGE_NOT_FOUND'
    | 'IMAGE_TAG_NOT_FOUND'
    | 'INACTIVE_ACCOUNT'
    | 'INCORRECT_DEFAULT_GOOGLE_CREDENTIALS'
    | 'INCORRECT_SIGN_IN_MECHANISM'
    | 'INITIAL_STATE_NOT_DEFINED'
    | 'INIT_TIMEOUT'
    | 'INSTANA_CONFIGURATION_ERROR'
    | 'INSTANCE_STATS_AGGREGATION_ERROR'
    | 'INSTANCE_STATS_MIGRATION_ERROR'
    | 'INSTANCE_STATS_PROCESS_ERROR'
    | 'INVALID_ACCOUNT_PERMISSION'
    | 'INVALID_AGENT_MTLS_AUTHORITY'
    | 'INVALID_ARGUMENT'
    | 'INVALID_ARTIFACTORY_REGISTRY_REQUEST'
    | 'INVALID_ARTIFACT_SERVER'
    | 'INVALID_ARTIFACT_SOURCE'
    | 'INVALID_AUTHENTICATION_MECHANISM'
    | 'INVALID_AZURE_AKS_REQUEST'
    | 'INVALID_AZURE_CONTAINER_REGISTRY_REQUEST'
    | 'INVALID_AZURE_VAULT_CONFIGURATION'
    | 'INVALID_CAPTCHA_TOKEN'
    | 'INVALID_CLOUD_PROVIDER'
    | 'INVALID_CONNECTOR_TYPE'
    | 'INVALID_CREDENTIAL'
    | 'INVALID_CREDENTIALS_THIRD_PARTY'
    | 'INVALID_CSV_FILE'
    | 'INVALID_DASHBOARD_UPDATE_REQUEST'
    | 'INVALID_EMAIL'
    | 'INVALID_EXECUTION_ID'
    | 'INVALID_FORMAT'
    | 'INVALID_IDENTIFIER_REF'
    | 'INVALID_INFRA_CONFIGURATION'
    | 'INVALID_INFRA_STATE'
    | 'INVALID_INPUT_SET'
    | 'INVALID_JSON_PAYLOAD'
    | 'INVALID_KEY'
    | 'INVALID_KEYPATH'
    | 'INVALID_LDAP_CONFIGURATION'
    | 'INVALID_MARKETPLACE_TOKEN'
    | 'INVALID_NEXUS_REGISTRY_REQUEST'
    | 'INVALID_OAUTH_CONFIGURATION'
    | 'INVALID_OVERLAY_INPUT_SET'
    | 'INVALID_PIPELINE'
    | 'INVALID_PORT'
    | 'INVALID_REQUEST'
    | 'INVALID_ROLLBACK'
    | 'INVALID_SAML_CONFIGURATION'
    | 'INVALID_TERRAFORM_TARGETS_REQUEST'
    | 'INVALID_TICKETING_SERVER'
    | 'INVALID_TOKEN'
    | 'INVALID_TOTP_TOKEN'
    | 'INVALID_TWO_FACTOR_AUTHENTICATION_CONFIGURATION'
    | 'INVALID_URL'
    | 'INVALID_USAGE_RESTRICTION'
    | 'INVALID_VARIABLE'
    | 'INVALID_YAML_ERROR'
    | 'INVALID_YAML_PAYLOAD'
    | 'JENKINS_ERROR'
    | 'JIRA_CLIENT_ERROR'
    | 'JIRA_ERROR'
    | 'KMS_OPERATION_ERROR'
    | 'KRYO_HANDLER_NOT_FOUND_ERROR'
    | 'KUBERNETES_API_TASK_EXCEPTION'
    | 'KUBERNETES_CLUSTER_ERROR'
    | 'KUBERNETES_TASK_EXCEPTION'
    | 'KUBERNETES_VALUES_ERROR'
    | 'KUBERNETES_YAML_ERROR'
    | 'LICENSE_EXPIRED'
    | 'LOGZ_CONFIGURATION_ERROR'
    | 'MARKETPLACE_TOKEN_NOT_FOUND'
    | 'MAX_FAILED_ATTEMPT_COUNT_EXCEEDED'
    | 'MEDIA_NOT_SUPPORTED'
    | 'MIGRATION_EXCEPTION'
    | 'MISSING_BEFORE_YAML'
    | 'MISSING_DEFAULT_GOOGLE_CREDENTIALS'
    | 'MISSING_YAML'
    | 'MONGO_EXECUTION_TIMEOUT_EXCEPTION'
    | 'NEWRELIC_CONFIGURATION_ERROR'
    | 'NEWRELIC_ERROR'
    | 'NG_ACCESS_DENIED'
    | 'NG_PIPELINE_CREATE_EXCEPTION'
    | 'NG_PIPELINE_EXECUTION_EXCEPTION'
    | 'NON_EMPTY_DELETIONS'
    | 'NON_EXISTING_PIPELINE'
    | 'NON_FORK_STATES'
    | 'NON_REPEAT_STATES'
    | 'NOT_ACCOUNT_MGR_NOR_HAS_ALL_APP_ACCESS'
    | 'NOT_LICENSED'
    | 'NOT_WHITELISTED_IP'
    | 'NO_APPS_ASSIGNED'
    | 'NO_AVAILABLE_DELEGATES'
    | 'NO_GLOBAL_DELEGATE_ACCOUNT'
    | 'NO_INSTALLED_DELEGATES'
    | 'OAUTH_LOGIN_FAILED'
    | 'OPTIMISTIC_LOCKING_EXCEPTION'
    | 'PAGERDUTY_ERROR'
    | 'PASSWORD_EXPIRED'
    | 'PASSWORD_STRENGTH_CHECK_FAILED'
    | 'PAUSE_ALL_ALREADY'
    | 'PIPELINE_ALREADY_TRIGGERED'
    | 'PIPELINE_EXECUTION_IN_PROGRESS'
    | 'PLAN_CREATION_ERROR'
    | 'PLATFORM_SOFTWARE_DELETE_ERROR'
    | 'PMS_INITIALIZE_SDK_EXCEPTION'
    | 'POD_NOT_FOUND_ERROR'
    | 'POLICY_EVALUATION_FAILURE'
    | 'POLICY_SET_ERROR'
    | 'PROCESS_EXECUTION_EXCEPTION'
    | 'PROMETHEUS_CONFIGURATION_ERROR'
    | 'PR_CREATION_ERROR'
    | 'READ_FILE_FROM_GCP_STORAGE_FAILED'
    | 'REGISTRY_EXCEPTION'
    | 'REQUEST_PROCESSING_INTERRUPTED'
    | 'REQUEST_TIMEOUT'
    | 'RESOURCE_ALREADY_EXISTS'
    | 'RESOURCE_NOT_FOUND'
    | 'RESOURCE_NOT_FOUND_EXCEPTION'
    | 'RESUME_ALL_ALREADY'
    | 'RETRY_FAILED'
    | 'REVOKED_TOKEN'
    | 'ROLE_DOES_NOT_EXIST'
    | 'ROLLBACK_ALREADY'
    | 'SAML_IDP_CONFIGURATION_NOT_AVAILABLE'
    | 'SAML_TEST_SUCCESS_MECHANISM_NOT_ENABLED'
    | 'SAVE_FILE_INTO_GCP_STORAGE_FAILED'
    | 'SCHEMA_VALIDATION_FAILED'
    | 'SCM_BAD_REQUEST'
    | 'SCM_CONFLICT_ERROR'
    | 'SCM_CONFLICT_ERROR_V2'
    | 'SCM_INTERNAL_SERVER_ERROR'
    | 'SCM_INTERNAL_SERVER_ERROR_V2'
    | 'SCM_NOT_FOUND_ERROR'
    | 'SCM_NOT_MODIFIED'
    | 'SCM_UNAUTHORIZED'
    | 'SCM_UNAUTHORIZED_ERROR_V2'
    | 'SCM_UNEXPECTED_ERROR'
    | 'SCM_UNPROCESSABLE_ENTITY'
    | 'SECRET_MANAGEMENT_ERROR'
    | 'SECRET_MANAGER_ID_NOT_FOUND'
    | 'SECRET_NOT_FOUND'
    | 'SERVICENOW_ERROR'
    | 'SERVICE_GUARD_CONFIGURATION_ERROR'
    | 'SHELL_EXECUTION_EXCEPTION'
    | 'SOCKET_CONNECTION_ERROR'
    | 'SOCKET_CONNECTION_TIMEOUT'
    | 'SPLUNK_CONFIGURATION_ERROR'
    | 'SPOTINST_NULL_ERROR'
    | 'SSH_CONNECTION_ERROR'
    | 'SSH_SESSION_TIMEOUT'
    | 'SSL_HANDSHAKE_FAILED'
    | 'STACKDRIVER_CONFIGURATION_ERROR'
    | 'STACKDRIVER_ERROR'
    | 'STATES_WITH_DUP_TRANSITIONS'
    | 'STATE_DISCONTINUE_FAILED'
    | 'STATE_EXECUTION_INSTANCE_NOT_FOUND'
    | 'STATE_MACHINE_ISSUE'
    | 'STATE_NOT_FOR_TYPE'
    | 'STATE_PAUSE_FAILED'
    | 'SUMO_CONFIGURATION_ERROR'
    | 'SUMO_DATA_COLLECTION_ERROR'
    | 'TASK_FAILURE_ERROR'
    | 'TEMPLATES_LINKED'
    | 'TEMPLATE_EXCEPTION'
    | 'TEMPLATE_NOT_FOUND'
    | 'TERRAFORM_EXECUTION_ERROR'
    | 'TIMEOUT_ENGINE_EXCEPTION'
    | 'TIMESCALE_NOT_AVAILABLE'
    | 'TOKEN_ALREADY_REFRESHED_ONCE'
    | 'TOO_MANY_REQUESTS'
    | 'TRANSITION_NOT_LINKED'
    | 'TRANSITION_TO_INCORRECT_STATE'
    | 'TRANSITION_TYPE_NULL'
    | 'UNAVAILABLE_DELEGATES'
    | 'UNEXPECTED'
    | 'UNEXPECTED_SCHEMA_EXCEPTION'
    | 'UNEXPECTED_SNIPPET_EXCEPTION'
    | 'UNEXPECTED_TYPE_ERROR'
    | 'UNKNOWN_ARTIFACT_TYPE'
    | 'UNKNOWN_ERROR'
    | 'UNKNOWN_EXECUTOR_TYPE_ERROR'
    | 'UNKNOWN_HOST'
    | 'UNKNOWN_STAGE_ELEMENT_WRAPPER_TYPE'
    | 'UNREACHABLE_HOST'
    | 'UNRECOGNIZED_YAML_FIELDS'
    | 'UNRESOLVED_EXPRESSIONS_ERROR'
    | 'UNSUPPORTED_OPERATION_EXCEPTION'
    | 'UPDATE_NOT_ALLOWED'
    | 'URL_NOT_PROVIDED'
    | 'URL_NOT_REACHABLE'
    | 'USAGE_LIMITS_EXCEEDED'
    | 'USAGE_RESTRICTION_ERROR'
    | 'USER_ALREADY_PRESENT'
    | 'USER_ALREADY_REGISTERED'
    | 'USER_DISABLED'
    | 'USER_DOES_NOT_EXIST'
    | 'USER_DOMAIN_NOT_ALLOWED'
    | 'USER_GROUP_ALREADY_EXIST'
    | 'USER_GROUP_ERROR'
    | 'USER_GROUP_SYNC_FAILURE'
    | 'USER_HAS_NO_PERMISSIONS'
    | 'USER_INVITATION_DOES_NOT_EXIST'
    | 'USER_INVITE_OPERATION_FAILED'
    | 'USER_LOCKED'
    | 'USER_NOT_AUTHORIZED'
    | 'USER_NOT_AUTHORIZED_DUE_TO_USAGE_RESTRICTIONS'
    | 'VAULT_OPERATION_ERROR'
    | 'WINRM_COMMAND_EXECUTION_TIMEOUT'
    | 'WORKFLOW_ALREADY_TRIGGERED'
    | 'WORKFLOW_EXECUTION_IN_PROGRESS'
    | 'YAML_GIT_SYNC_ERROR'
  correlationId?: string
  errors?: ValidationError[]
  message?: string
  status?: 'ERROR' | 'FAILURE' | 'SUCCESS'
}
