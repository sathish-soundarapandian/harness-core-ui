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
} from '@default-settings/interfaces/SettingType.types'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { SettingDTO } from 'services/cd-ng'
import type { Module } from 'framework/types/ModuleName'

export interface SettingRendererProps {
  identifier: string
  onSettingSelectionChange: (val: string) => void
  onRestore: () => void
  settingValue: SettingDTO | undefined
  categoryAllSettings: Map<SettingType, SettingDTO>
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}
export interface SettingHandler {
  label: keyof StringsMap
  settingRenderer: (props: SettingRendererProps) => React.ReactElement
  yupValidation?: YupValidation
  settingCategory: SettingCategory
  groupId?: SettingGroups
}
export interface GroupedSettingsHandler {
  groupName?: keyof StringsMap
  settingCategory: SettingCategory
  settingsDisplayOrder?: SettingType[]
}
type SettingsAndGroupDisplayOrderType = SettingGroups | SettingType
export interface SettingCategoryHandler {
  icon: IconName
  label: keyof StringsMap
  settingsAndGroupDisplayOrder?: SettingsAndGroupDisplayOrderType[]
  modulesWhereCategoryWillBeDisplayed?: Module[]
}

class DefaultSettingsFactory {
  private settingMap: Map<SettingType, SettingHandler>
  private categoryMap: Map<SettingCategory, SettingCategoryHandler>

  private categoryToSettingMap: Map<SettingCategory, Set<SettingType>>
  private groupToSettingMap: Map<SettingGroups, Set<SettingType>>
  private groupMap: Map<SettingGroups, GroupedSettingsHandler>
  private categoryToGroupMap: Map<SettingCategory, Set<SettingGroups>>
  private categoriesToBeDisplayedInAModuleMap: Map<Module, Set<SettingCategory>>
  constructor() {
    this.settingMap = new Map()
    this.categoryMap = new Map()
    this.groupMap = new Map()
    this.categoryToSettingMap = new Map()
    this.groupToSettingMap = new Map()
    this.categoryToGroupMap = new Map()
    this.categoriesToBeDisplayedInAModuleMap = new Map()
  }

  registerCategory(settingCategory: SettingCategory, handler: SettingCategoryHandler): void {
    this.categoryMap.set(settingCategory, handler)
    if (handler.modulesWhereCategoryWillBeDisplayed?.length) {
      handler.modulesWhereCategoryWillBeDisplayed.forEach(module => {
        if (this.categoriesToBeDisplayedInAModuleMap.get(module)) {
          this.categoriesToBeDisplayedInAModuleMap.get(module)?.add(settingCategory)
        } else {
          this.categoriesToBeDisplayedInAModuleMap.set(module, new Set([settingCategory]))
        }
      })
    }
  }
  registerGroupHandler(groupName: SettingGroups, handler: GroupedSettingsHandler): void {
    this.groupMap.set(groupName, handler)
    if (!this.categoryToGroupMap.get(handler.settingCategory)) {
      this.categoryToGroupMap.set(handler.settingCategory, new Set([groupName]))
    } else {
      this.categoryToGroupMap.get(handler.settingCategory)?.add(groupName)
    }
  }
  getGroupsOfACategory(settingCategory: SettingCategory): Set<SettingGroups> {
    return this.categoryToGroupMap.get(settingCategory) || new Set()
  }
  registerSettingHandler(settingType: SettingType, handler: SettingHandler): void {
    this.settingMap.set(settingType, handler)
    if (!this.categoryToSettingMap.get(handler.settingCategory)) {
      this.categoryToSettingMap.set(handler.settingCategory, new Set([settingType]))
    } else {
      this.categoryToSettingMap.get(handler.settingCategory)?.add(settingType)
    }
    if (handler.groupId) {
      if (!this.groupToSettingMap.get(handler.groupId)) {
        this.groupToSettingMap.set(handler.groupId, new Set([settingType]))
      } else {
        this.groupToSettingMap.get(handler.groupId)?.add(settingType)
      }
    }
  }
  getGroupHandler(groupName: SettingGroups): GroupedSettingsHandler | undefined {
    return this.groupMap.get(groupName)
  }
  getGroupSettingsDisplayOrderList(groupName: SettingGroups): SettingType[] {
    const displayOrderSettings = Array.from(this.groupMap.get(groupName)?.settingsDisplayOrder || [])
    const settingsInRegisteredOrder = this.groupToSettingMap.get(groupName) || new Set()
    const finalSettings = new Set([
      ...displayOrderSettings.filter(setting => settingsInRegisteredOrder.has(setting)),
      ...settingsInRegisteredOrder
    ])
    return Array.from(finalSettings)
  }
  getCategorySettingsList(cateogryName: SettingCategory): Set<SettingType> {
    return this.categoryToSettingMap.get(cateogryName) || new Set()
  }
  removeDuplicateSettingsWhichAreAlreadyPartOfGroupedSettings = (
    listOfSettingsAndGroup: Set<SettingsAndGroupDisplayOrderType>
  ): SettingsAndGroupDisplayOrderType[] => {
    let settingsInAllGroups = new Set()
    const listOfSettingsAndGroupFiltered: Set<SettingsAndGroupDisplayOrderType> = new Set()
    listOfSettingsAndGroup.forEach(settingOrGroup => {
      if (this.groupToSettingMap.has(settingOrGroup as SettingGroups)) {
        const groupSettings = this.groupToSettingMap.get(settingOrGroup as SettingGroups) || new Set()
        settingsInAllGroups = new Set([...settingsInAllGroups, ...groupSettings])
      }
    })
    listOfSettingsAndGroup.forEach(settingOrGroup => {
      if (!settingsInAllGroups.has(settingOrGroup as SettingType)) {
        listOfSettingsAndGroupFiltered.add(settingOrGroup)
      }
    })
    return Array.from(listOfSettingsAndGroupFiltered)
  }
  getCategorySettingsDisplayOrderList(cateogryName: SettingCategory): SettingsAndGroupDisplayOrderType[] {
    const displayOrderSettings = Array.from(this.categoryMap.get(cateogryName)?.settingsAndGroupDisplayOrder || [])
    const groupsInRegistredOrder = this.getGroupsOfACategory(cateogryName) || new Set()
    const settingsInRegisteredOrder = this.categoryToSettingMap.get(cateogryName) || new Set()
    const registeredSettingAndGroups = new Set([...groupsInRegistredOrder, ...settingsInRegisteredOrder])
    const finalSettings = new Set([
      ...displayOrderSettings.filter(settingOrGroup => registeredSettingAndGroups.has(settingOrGroup)),
      ...settingsInRegisteredOrder,
      ...groupsInRegistredOrder
    ])
    return this.removeDuplicateSettingsWhichAreAlreadyPartOfGroupedSettings(finalSettings)
  }
  getCategoryList(): Map<SettingCategory, SettingCategoryHandler> {
    return this.categoryMap
  }
  getCategoryNamesList(): SettingCategory[] {
    return Array.from(this.categoryMap.keys())
  }
  getSettingNames(): Set<SettingType> {
    return new Set([...this.settingMap.keys()])
  }
  getGroupNames(): Set<SettingGroups> {
    return new Set([...this.groupMap.keys()])
  }
  getCategoryHandler(settingCategory: SettingCategory): SettingCategoryHandler | undefined {
    return this.categoryMap.get(settingCategory)
  }

  getSettingHandler(settingType: SettingType): SettingHandler | undefined {
    return this.settingMap.get(settingType)
  }
  getYupValidationForSetting(settingType: SettingType): YupValidation | undefined {
    return this.settingMap.get(settingType)?.yupValidation
  }
  getCategoriesToBeDisplayedInAModule(module: Module) {
    return this.categoriesToBeDisplayedInAModuleMap.get(module)
  }
}

export default new DefaultSettingsFactory()
