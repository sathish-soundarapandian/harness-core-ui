/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PasswordStrengthPolicy } from 'services/cd-ng'
import { YAML_FILE_EXTENSIONS } from '@common/utils/Constants'

export const DEFAULT_COLOR = '#0063f7'
export const MIN_NUMBER_OF_CHARACTERS = 8
export const MAX_NUMBER_OF_CHARACTERS = 64

const getUppercaseRgx = (n: number): string => `^(.*?[A-Z]){${n},}`
const getLowercaseRgx = (n: number): string => `^(.*?[a-z]){${n},}`
const getNumberRgx = (n: number): string => `^(.*?[0-9]){${n},}`
const getSpecialCharRgx = (n: number): string => `^(.*?[ !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]){${n},}`

export const UPPERCASE_RGX = (n: number): RegExp => new RegExp(getUppercaseRgx(n))
export const LOWERCASE_RGX = (n: number): RegExp => new RegExp(getLowercaseRgx(n))
export const DIGIT_RGX = (n: number): RegExp => new RegExp(getNumberRgx(n))
export const SPECIAL_CHAR_RGX = (n: number): RegExp => new RegExp(getSpecialCharRgx(n))

export const PASSWORD_CHECKS_RGX = ({
  enabled,
  minNumberOfCharacters,
  minNumberOfUppercaseCharacters,
  minNumberOfLowercaseCharacters,
  minNumberOfDigits,
  minNumberOfSpecialCharacters
}: PasswordStrengthPolicy): RegExp => {
  if (!enabled) {
    return new RegExp(`^.{${MIN_NUMBER_OF_CHARACTERS},${MAX_NUMBER_OF_CHARACTERS}}$`)
  }

  const getRegExp = (): string => {
    let regExp = ''

    if (minNumberOfUppercaseCharacters) {
      regExp += `(?=.*(${getUppercaseRgx(minNumberOfUppercaseCharacters)}))`
    }
    if (minNumberOfLowercaseCharacters) {
      regExp += `(?=.*(${getLowercaseRgx(minNumberOfLowercaseCharacters)}))`
    }
    if (minNumberOfDigits) {
      regExp += `(?=.*(${getNumberRgx(minNumberOfDigits)}))`
    }
    if (minNumberOfSpecialCharacters) {
      regExp += `(?=.*(${getSpecialCharRgx(minNumberOfSpecialCharacters)}))`
    }

    return regExp
  }

  return new RegExp(
    `^${getRegExp()}.{${minNumberOfCharacters || MIN_NUMBER_OF_CHARACTERS},${MAX_NUMBER_OF_CHARACTERS}}$`
  )
}

export enum Experiences {
  CG = 'CG',
  NG = 'NG'
}

export enum Width {
  SMALL = 120,
  MEDIUM = 160,
  LARGE = 200
}

export enum SettingType {
  TEST_SETTING_ID = 'test_setting_id',
  ENABLE_GIT_COMMANDS = 'enable_git_commands',
  ENFORCE_GIT_EXPERIENCE = 'enforce_git_experience',
  DEFAULT_CONNECTOR_FOR_GIT_EXPERIENCE = 'default_connector_for_git_experience',
  ALLOW_DIFFERENT_REPO_FOR_INPUT_SETS = 'allow_different_repo_for_pipeline_and_input_sets',
  DISABLE_HARNESS_BUILT_IN_SECRET_MANAGER = 'disable_harness_built_in_secret_manager',
  WEBHOOK_GITHUB_TRIGGERS_AUTHENTICATION = 'mandate_webhook_secrets_for_github_triggers',
  MANDATE_CUSTOM_WEBHOOK_AUTHORIZATION = 'mandate_custom_webhook_authorization',
  ENABLE_FORCE_DELETE = 'enable_force_delete',
  PIPELINE_TIMEOUT = 'pipeline_timeout',
  STAGE_TIMEOUT = 'stage_timeout',
  STEP_TIMEOUT = 'step_timeout',
  CONCURRENT_ACTIVE_PIPELINE_EXECUTIONS = 'concurrent_active_pipeline_executions',
  ALLOW_USER_TO_MARK_STEP_AS_FAILED_EXPLICITLY = 'allow_user_to_mark_step_as_failed_explicitly',
  ENABLE_NODE_EXECUTION_AUDIT_EVENTS = 'enable_node_execution_audit_events',
  ENABLE_MATRIX_FIELD_NAME_SETTING = 'enable_matrix_label_by_name',
  SHOW_ANOMALIES = 'show_anomalies',
  SHOW_OTHERS = 'show_others',
  SHOW_UNALLOCATED_CUSTER_COST = 'show_unallocated_cluster_cost',
  INCLUDE_AWS_DISCOUNTS = 'include_aws_discounts',
  INCLUDE_AWS_CREDIT = 'include_aws_credit',
  INCLUDE_AWS_REFUNDS = 'include_aws_refunds',
  INCLUDE_AWS_TAXES = 'include_aws_taxes',
  SHOW_AWS_COST_AS = 'show_aws_cost_as',
  INCLUDE_AZURE_REFUNDS = 'include_azure_refunds',
  SHOW_AZURE_COST_AS = 'show_azure_cost_as',
  INCLUDE_GCP_DISCOUNTS = 'include_gcp_discounts',
  INCLUDE_GCP_TAXES = 'include_gcp_taxes',
  SHOW_GCP_COST_AS = 'show_gcp_cost_as',
  EMAIL_TO_NON_HARNESS_USERS = 'email_to_non_harness_users'
}

export const isValidYAMLFilePath = (filePath: string): boolean => {
  return YAML_FILE_EXTENSIONS.findIndex((extension: string) => filePath.endsWith(extension)) !== -1
}
