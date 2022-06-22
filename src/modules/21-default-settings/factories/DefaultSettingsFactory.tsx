/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { IconName } from '@harness/uicore'
import type { SettingCategory, SettingType } from '@defaultSettings/interfaces/SettingType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { StringsMap } from 'framework/strings/StringsContext'

export interface RbacSettingModalProps {
  searchTerm: string
  selectedData: string[]
  onSelectChange: (items: string[]) => void
  // settingScope: SettingScope
}
export interface RbacSettingRendererProps {
  identifiers: string[]
  // settingScope: SettingScope
  onSettingSelectionChange: (settingType: SettingCategory, isAdd: boolean, identifiers?: string[] | undefined) => void
  settingType: SettingType
}
export interface SettingHandler {
  icon: IconName
  label: keyof StringsMap
  labelOverride?: keyof StringsMap | undefined
  permissionLabels?: {
    [key in PermissionIdentifier]?: string | React.ReactElement
  }
  addSettingModalBody?: (props: RbacSettingModalProps) => React.ReactElement
  staticSettingRenderer?: (props: RbacSettingRendererProps) => React.ReactElement
  category?: SettingCategory
}

export interface SettingCategoryHandler {
  icon: IconName
  label: keyof StringsMap
  settingTypes?: Set<SettingType>
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

  getSettingCategoryList(settings: SettingCategory[]): Map<SettingCategory | SettingType, SettingType[] | undefined> {
    const categoryMap: Map<SettingCategory | SettingType, SettingType[] | undefined> = new Map()

    settings.map(settingType => {
      const handler = this.map.get(settingType)
      if (handler) {
        if (handler.category) {
          const settingTypes = categoryMap.get(handler.category)
          if (settingTypes) {
            categoryMap.set(handler.category, [...settingTypes, settingType])
          } else categoryMap.set(handler.category, [settingType])
        } else {
          categoryMap.set(settingType, undefined)
        }
      }
    })

    return categoryMap
  }

  getSettingCategoryHandler(settingCategory: SettingCategory): SettingCategoryHandler | undefined {
    return this.settingCategoryMap.get(settingCategory)
  }

  getSettingTypeHandler(settingType: SettingType): SettingHandler | undefined {
    return this.map.get(settingType)
  }

  getSettingTypeLabelKey(settingType: SettingType): keyof StringsMap | undefined {
    return this.map.get(settingType)?.label
  }

  isRegisteredSettingType(settingType: SettingType): boolean {
    return this.map.has(settingType)
  }
}

export default new DefaultSettingsFactory()
