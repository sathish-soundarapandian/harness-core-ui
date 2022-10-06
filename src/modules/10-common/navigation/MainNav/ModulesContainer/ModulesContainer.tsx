/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { Container, Icon } from '@harness/uicore'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import {
  ModulesPreferenceStoreData,
  MODULES_CONFIG_PREFERENCE_STORE_KEY
} from '@common/navigation/ModuleConfigurationScreen/ModuleConfigurationScreen'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import { moduleToNavItemsMap } from '../MainNav'
import css from './ModulesContainer.module.scss'

const MAX_NUM_OF_MODULES_TO_SHOW = 3

enum ChevronButtonType {
  UP = 'UP',
  DOWN = 'DOWN'
}
interface ChevronButtonProps {
  disabled?: boolean
  type?: ChevronButtonType
  handleClick: () => void
}

const ChevronButton: React.FC<ChevronButtonProps> = (props: ChevronButtonProps) => {
  const { disabled, type, handleClick } = props
  const style = type === ChevronButtonType.DOWN ? css.down : css.up

  return (
    <Container
      className={cx(css.chevron, style)}
      onClick={disabled ? undefined : handleClick}
      padding={{ top: 'small', bottom: 'small' }}
    >
      {disabled ? (
        <div className={css.disabled} />
      ) : (
        <Icon name={type === 'DOWN' ? 'main-caret-down' : 'main-caret-up'} size={15} />
      )}
    </Container>
  )
}

const MODULE_VISIBILITY_PERCENTAGE_ELIGIBILITY = 60
const isModuleHiddenOnTop = (container: HTMLDivElement, element: HTMLDivElement): boolean => {
  const { top: containerDistanceFromTop } = container.getBoundingClientRect()
  const { top: elementDistanceFromTop, height: elementHeight } = element.getBoundingClientRect()

  const differenceFromTop = elementDistanceFromTop + elementHeight - containerDistanceFromTop

  return differenceFromTop < elementHeight / (100 / MODULE_VISIBILITY_PERCENTAGE_ELIGIBILITY)
}

const ModulesContainer = (): React.ReactElement => {
  const [moduleStartIndex, setModuleStartIndex] = useState<number>(0)
  const itemsRef = useRef<HTMLDivElement[]>([])

  const { preference: modulesPreferenceData } = usePreferenceStore<ModulesPreferenceStoreData>(
    PreferenceScope.USER,
    MODULES_CONFIG_PREFERENCE_STORE_KEY
  )
  const moduleMap = useNavModuleInfoMap()
  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}

  const modulesListHeight = 92 * Math.min(MAX_NUM_OF_MODULES_TO_SHOW, selectedModules.length)

  const scrollModuleToView = (index: number) => {
    setTimeout(() => itemsRef.current[index].scrollIntoView(true), 0)
  }

  const handleUpClick = (): void => {
    const index = moduleStartIndex > 0 ? moduleStartIndex - 1 : moduleStartIndex
    setModuleStartIndex(index)
    scrollModuleToView(index)
  }

  const handleDownClick = (): void => {
    const index = moduleStartIndex < selectedModules.length - 1 ? moduleStartIndex + 1 : moduleStartIndex
    setModuleStartIndex(index)
    scrollModuleToView(index)
  }

  const handleOnScroll = debounce(e => {
    const firstVisibleModule = itemsRef.current.findIndex(item => !isModuleHiddenOnTop(e.target, item))
    setModuleStartIndex(firstVisibleModule === -1 ? 0 : firstVisibleModule)
  }, 100)

  return (
    <>
      <ChevronButton handleClick={handleUpClick} disabled={moduleStartIndex === 0} />
      <Container onScroll={handleOnScroll} className={css.container} style={{ height: modulesListHeight }}>
        {orderedModules
          .filter(moduleName => moduleMap[moduleName].shouldVisible && selectedModules.indexOf(moduleName) > -1)
          .map((moduleName, i) => {
            const NavItem = moduleToNavItemsMap[moduleName]

            return (
              <div key={moduleName} ref={el => (itemsRef.current[i] = el as HTMLDivElement)}>
                <NavItem key={moduleName} />
              </div>
            )
          })}
      </Container>
      <ChevronButton
        handleClick={handleDownClick}
        type={ChevronButtonType.DOWN}
        disabled={moduleStartIndex + 2 === selectedModules.length - 1}
      />
    </>
  )
}

export default ModulesContainer
