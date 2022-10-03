import React, { useEffect, useRef, useState } from 'react'
import { Container, Icon, IconName } from '@harness/uicore'
import cx from 'classnames'
import {
  ModulesPreferenceStoreData,
  MODULES_CONFIG_PREFERENCE_STORE_KEY
} from '@common/navigation/ModuleConfigurationScreen/ModuleConfigurationScreen'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import { moduleToNavItemsMap } from '../MainNav'
import css from './ModulesContainer.module.scss'

const MAX_NUM_OF_MODULES_TO_SHOW = 3

enum Action {
  UP = 'UP',
  DOWN = 'DOWN'
}

interface ModulesVisiblityData {
  startIndex: number
  endIndex: number
  action?: Action
}

const ModulesContainer = (): React.ReactElement => {
  const [modulesVisibilityData, setModulesVisibilityData] = useState<ModulesVisiblityData>({
    startIndex: 0,
    endIndex: MAX_NUM_OF_MODULES_TO_SHOW - 1
  })

  const itemsRef = useRef([])
  const { preference: modulesPreferenceData } = usePreferenceStore<ModulesPreferenceStoreData>(
    PreferenceScope.USER,
    MODULES_CONFIG_PREFERENCE_STORE_KEY
  )
  const moduleMap = useNavModuleInfoMap()
  const { selectedModules = [], orderedModules = [] } = modulesPreferenceData || {}

  const modulesListHeight = 92 * Math.min(MAX_NUM_OF_MODULES_TO_SHOW, selectedModules.length)

  const scrollIntoView = (index: number) => {
    setTimeout(
      () => itemsRef.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }),
      0
    )
  }

  useEffect(() => {
    const { action, startIndex, endIndex } = modulesVisibilityData
    if (action === Action.UP) {
      scrollIntoView(startIndex)
    } else if (action === Action.DOWN) {
      scrollIntoView(endIndex)
    }
  }, [modulesVisibilityData])

  const handleUpClick = () => {
    setModulesVisibilityData({
      startIndex: modulesVisibilityData.startIndex - 1,
      endIndex: modulesVisibilityData.endIndex - 1,
      action: Action.UP
    })
  }

  const handleDownClick = () => {
    setModulesVisibilityData({
      startIndex: modulesVisibilityData.startIndex + 1,
      endIndex: modulesVisibilityData.endIndex + 1,
      action: Action.DOWN
    })
  }

  const renderChevronButton = (
    handleClick: () => void,
    iconName: IconName,
    disabled?: boolean,
    className?: string
  ): React.ReactElement => {
    return (
      <Container
        className={cx(css.chevron, className)}
        onClick={disabled ? undefined : handleClick}
        padding={{ top: 'small', bottom: 'small' }}
      >
        {disabled ? <div className={css.disabled} /> : <Icon name={iconName} size={15} />}
      </Container>
    )
  }

  return (
    <>
      {renderChevronButton(handleUpClick, 'main-caret-up', modulesVisibilityData.startIndex === 0, css.up)}
      <Container className={css.container} style={{ height: modulesListHeight }}>
        {orderedModules
          .filter(moduleName => moduleMap[moduleName].shouldVisible && selectedModules.indexOf(moduleName) > -1)
          .map((moduleName, i) => {
            const NavItem = moduleToNavItemsMap[moduleName]

            return (
              <div key={moduleName} ref={el => (itemsRef.current[i] = el)}>
                <NavItem key={moduleName} />
              </div>
            )
          })}
      </Container>
      {renderChevronButton(
        handleDownClick,
        'main-caret-down',
        modulesVisibilityData.endIndex === selectedModules.length - 1,
        css.down
      )}
    </>
  )
}

export default ModulesContainer
