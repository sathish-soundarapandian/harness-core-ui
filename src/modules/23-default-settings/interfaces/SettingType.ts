import type { SettingDTO } from 'services/cd-ng'
export type SettingCategory = SettingDTO['category']
export enum SettingType {
  ACCOUNT = 'ACCOUNT',
  TEST_SETTING_ID = 'test_setting_id',
  TEST_SETTING_ID_2 = 'test_setting_id_2'
}
