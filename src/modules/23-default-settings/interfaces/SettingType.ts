import type { SettingDTO } from 'services/cd-ng'
export type SettingCategory = SettingDTO['category']
export enum SettingType {
  ACCOUNT = 'ACCOUNT',
  TEST_SETTING_ID = 'test_setting_id',
  TEST_SETTING_ID_2 = 'test_setting_id_2',
  TEST_SETTING_CI='test_setting_CI',
  test_setting_CORE_1='test_setting_CORE_1',
  test_setting_CORE_2='test_setting_CORE_2',
  test_setting_CD_1='test_setting_CD_1',
  test_setting_CD_2='test_setting_CD_2',
  test_setting_CD_3='test_setting_CD_3',
  test_setting_CI_1='test_setting_CI_1',
  test_setting_CI_2='test_setting_CI_2'

}
