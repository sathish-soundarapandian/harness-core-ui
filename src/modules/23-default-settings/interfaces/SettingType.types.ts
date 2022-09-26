/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type * as Yup from 'yup'
import type { SettingDTO } from 'services/cd-ng'
export type SettingCategory = SettingDTO['category']
export enum SettingType {
  TEST_SETTING_ID = 'test_setting_id',
  test_setting_CI_1 = 'test_setting_CI_1',
  test_setting_CI_2 = 'test_setting_CI_2',
  test_setting_CI_3 = 'test_setting_CI_3',
  test_setting_CI_4 = 'test_setting_CI_4',
  test_setting_CI_5 = 'test_setting_CI_5',
  test_setting_CI_6 = 'test_setting_CI_6',
  test_setting_CI_7 = 'test_setting_CI_7',
  test_setting_CD_1 = 'test_setting_CD_1',
  test_setting_CD_2 = 'test_setting_CD_2',
  test_setting_CD_3 = 'test_setting_CD_3',
  test_setting_disable_built_in_sm='test_setting_disable_built_in_sm'
}
export enum SettingGroups {
  group_1 = 'group_1',
  group_2 = 'group_2'
}
export type YupValidation =
  | Yup.BooleanSchema
  | Yup.StringSchema
  | Yup.DateSchema
  | Yup.MixedSchema<any>
  | Yup.NumberSchema
export type SettingYupValidation = {
  [Key in SettingType]?: YupValidation
}
