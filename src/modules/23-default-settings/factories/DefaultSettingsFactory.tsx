/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { IconName } from '@harness/uicore'
import type {
  SettingCategory,
  SettingGroups,
  SettingType,
  YupValidation
} from '@default-settings/interfaces/SettingType'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { FeatureFlag } from '@common/featureFlags'
import type { SettingDTO, SettingRequestDTO } from 'services/cd-ng'

export interface SettingRendererProps {
  identifier: any
  onSettingSelectionChange: (val: string) => void
  onRestore: () => void
  settingValue: any
  allowedValues?: SettingDTO['allowedValues'] | undefined

  allSettings: Map<SettingType, SettingDTO>
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}
export interface SettingHandler {
  label: keyof StringsMap
  settingRenderer?: (props: SettingRendererProps) => React.ReactElement
  yupValidation: YupValidation
  featureFlag?: FeatureFlag
}
export interface GroupedSettings {
  groupName?: keyof StringsMap
  groupId?: SettingGroups
  settingTypes: Set<SettingType>
}
export interface SettingCategoryHandler {
  icon: IconName
  label: keyof StringsMap
  featureFlag?: FeatureFlag
  settings: GroupedSettings[]
}

class DefaultSettingsFactory {
  private map: Map<SettingType, SettingHandler>
  private settingCategoryMap: Map<SettingCategory, SettingCategoryHandler>

  constructor() {
    this.map = new Map()
    this.settingCategoryMap = new Map()
  }

  registerSettingCategory(settingCategory: SettingCategory, handler: SettingCategoryHandler): void {
    this.settingCategoryMap.set(settingCategory, handler)
  }

  registerSettingTypeHandler(settingType: SettingType, handler: SettingHandler): void {
    this.map.set(settingType, handler)
  }
  getSettingCategoryList(): Map<SettingCategory, SettingCategoryHandler> {
    return this.settingCategoryMap
  }
  getSettingCategoryNamesList(): SettingCategory[] {
    return Array.from(this.settingCategoryMap.keys())
  }

  getSettingCategoryHandler(settingCategory: SettingCategory): SettingCategoryHandler | undefined {
    return this.settingCategoryMap.get(settingCategory)
  }

  getSettingTypeHandler(settingType: SettingType): SettingHandler | undefined {
    return this.map.get(settingType)
  }
  getYupValidationForSetting(settingType: SettingType): YupValidation | undefined {
    return this.map.get(settingType)?.yupValidation
  }
}

export default new DefaultSettingsFactory()
