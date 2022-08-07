import type * as Yup from 'yup'
import type { SettingDTO } from 'services/cd-ng'
export type SettingCategory = SettingDTO['category']
export enum SettingType {
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
  test_setting_CORE_1 = 'test_setting_CORE_1',
  test_setting_CORE_2 = 'test_setting_CORE_2',
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
