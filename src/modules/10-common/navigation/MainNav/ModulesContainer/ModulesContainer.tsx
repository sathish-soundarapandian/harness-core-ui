/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Container } from '@harness/uicore'
import cx from 'classnames'
import {
  ModulesPreferenceStoreData,
  MODULES_CONFIG_PREFERENCE_STORE_KEY
} from '@common/navigation/ModuleConfigurationScreen/ModuleConfigurationScreen'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import { filterNavModules, moduleToNavItemsMap } from '../util'
import css from '../MainNav.module.scss'

export const MODULES_WINDOW_SIZE = 3

const ModulesContainer = (): React.ReactElement => {
  const itemsRef = useRef<HTMLDivElement[]>([])

  const { preference: modulesPreferenceData, setPreference: setModuleConfigPreference } =
    usePreferenceStore<ModulesPreferenceStoreData>(PreferenceScope.USER, MODULES_CONFIG_PREFERENCE_STORE_KEY)
  const moduleMap = useNavModuleInfoMap()
  const [filterModulesExecuted, setFilterModulesExecuted] = useState<boolean>(false)

  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}

  useEffect(() => {
    const { orderedModules: filteredOrderedModules, selectedModules: filteredSelectedModules } = filterNavModules(
      orderedModules,
      selectedModules,
      moduleMap
    )
    setModuleConfigPreference({
      orderedModules: filteredOrderedModules,
      selectedModules: filteredSelectedModules
    })
    setFilterModulesExecuted(true)
  }, [])

  if (!filterModulesExecuted) {
    return <></>
  }

  return (
    <>
      <div className={cx(css.border, css.navBtn)} />
      <Container className={css.modules}>
        {orderedModules
          .filter(moduleName => moduleMap[moduleName]?.shouldVisible && selectedModules.indexOf(moduleName) > -1)
          .map((moduleName, i) => {
            const NavItem = moduleToNavItemsMap[moduleName]

            return (
              <div key={moduleName} ref={el => (itemsRef.current[i] = el as HTMLDivElement)}>
                <NavItem key={moduleName} />
              </div>
            )
          })}
      </Container>
      <div className={cx(css.border, css.navBtn)} />
    </>
  )
}

export default ModulesContainer
