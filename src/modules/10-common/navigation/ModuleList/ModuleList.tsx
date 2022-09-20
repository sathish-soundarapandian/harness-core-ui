/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { Classes, Drawer, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Color, Container, Icon, Layout, Text, Popover } from '@harness/uicore'
import { String } from 'framework/strings'
import { moduleToModuleNameMapping } from 'framework/types/ModuleName'
import useNavModuleInfo, {
  GroupConfig,
  moduleGroupConfig,
  NavModuleName,
  useNavModuleInfoMap
} from '@common/hooks/useNavModuleInfo'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import NavModule from './NavModule/NavModule'
import ModuleConfigurationScreen from '../ModuleConfigurationScreen/ModuleConfigurationScreen'
import {
  ModulesPreferenceStoreData,
  MODULES_CONFIG_PREFERENCE_STORE_KEY
} from '../ModuleConfigurationScreen/ModuleSortableList/ModuleSortableList'
import arrow from './arrow.svg'
import css from './ModuleList.module.scss'

interface ModuleListProps {
  isOpen: boolean
  close: () => void
  usePortal?: boolean
  onConfigIconClick?: () => void
}

interface ModuleTooltipProps {
  activeModule?: NavModuleName
  handleClick: (module: NavModuleName) => void
}

interface ItemProps {
  data: NavModuleName
  tooltipProps: ModuleTooltipProps
  onModuleClick: (module: NavModuleName) => void
}

interface GroupProps {
  data: GroupConfig
  tooltipProps: ModuleTooltipProps
  onModuleClick: (module: NavModuleName) => void
}

const Item: React.FC<ItemProps> = ({ data, tooltipProps, onModuleClick }) => {
  const { redirectionLink, shouldVisible } = useNavModuleInfo(data)
  const { module } = useModuleInfo()
  const currentModule = module ? moduleToModuleNameMapping[module] : undefined

  if (!shouldVisible) {
    return null
  }

  const navModuleToClassMap: Record<string, string> = {
    ['CD']: css.cd,
    ['CI']: css.ci,
    ['CV']: css.srm,
    ['CF']: css.ff,
    ['CE']: css.ccm,
    ['CHAOS']: css.chaos
  }

  const navModuleToStringMap: Record<string, string> = {
    ['CD']: 'Continuous Delivery',
    ['CI']: 'Continuous Integration',
    ['CV']: 'Service Reliability',
    ['CF']: 'Feature Flags',
    ['CE']: 'Cloud Cost Management',
    ['CHAOS']: 'Chaos Engineering'
  }
  return (
    <Link to={redirectionLink}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <NavModule module={data} active={currentModule === data} onClick={onModuleClick} />
        <Popover
          content={
            <Text color={Color.WHITE} padding="small">
              {navModuleToStringMap[data]}
            </Text>
          }
          popoverClassName={Classes.DARK}
          interactionKind={PopoverInteractionKind.HOVER}
          position={Position.RIGHT}
        >
          <Icon
            name="tooltip-icon"
            padding={'small'}
            margin={{ left: 'small' }}
            color={tooltipProps.activeModule === data ? Color.WHITE : undefined}
            size={17}
            className={navModuleToClassMap[data]}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              tooltipProps.handleClick(data)
            }}
          />
        </Popover>
      </Layout.Horizontal>
    </Link>
  )
}

const Group: React.FC<GroupProps> = ({ data, tooltipProps, onModuleClick }) => {
  const moduleMap = useNavModuleInfoMap()
  const visibleItems = data.items.filter(module => !!moduleMap[module].shouldVisible)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <Container>
      <Text color={Color.PRIMARY_2} margin={{ bottom: 'large' }} font={{ size: 'small', weight: 'semi-bold' }}>
        <String stringID={data.label} />
      </Text>
      <Layout.Vertical spacing="medium">
        {data.items.map(item => (
          <Item key={item} data={item} tooltipProps={tooltipProps} onModuleClick={onModuleClick} />
        ))}
      </Layout.Vertical>
    </Container>
  )
}

const ModuleList: React.FC<ModuleListProps> = ({ isOpen, close, usePortal = true, onConfigIconClick }) => {
  const [activeModuleCarousel, setActiveModuleCarousel] = useState<NavModuleName | undefined>(undefined)
  const { setPreference: setModuleConfigPreference, preference: { orderedModules = [], selectedModules = [] } = {} } =
    usePreferenceStore<ModulesPreferenceStoreData>(PreferenceScope.USER, MODULES_CONFIG_PREFERENCE_STORE_KEY)

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={close}
        position={Position.LEFT}
        size={Drawer.SIZE_SMALL}
        className={css.modulesList}
        backdropClassName={css.backdrop}
        usePortal={usePortal}
      >
        <div className={css.modulesListContainer}>
          <Layout.Vertical margin={{ bottom: 'huge' }}>
            <Container flex={{ alignItems: 'center' }} margin={{ bottom: 'none' }}>
              <Text font={{ size: 'large', weight: 'bold' }} color={Color.WHITE}>
                <String stringID="common.moduleList.title" />
              </Text>
              <Popover
                content={
                  <Text color={Color.WHITE} padding="small">
                    <String stringID="common.moduleConfig.customize" />
                  </Text>
                }
                popoverClassName={Classes.DARK}
                interactionKind={PopoverInteractionKind.HOVER}
                position={Position.RIGHT}
              >
                <Icon
                  name="customize"
                  size={24}
                  className={cx(css.blue, css.clickable)}
                  padding={'small'}
                  onClick={() => {
                    onConfigIconClick?.()
                    setActiveModuleCarousel(undefined)
                  }}
                />
              </Popover>
            </Container>
            <Layout.Horizontal>
              <Text inline color={Color.GREY_400} className={css.blueText} margin={{ left: 'huge', right: 'small' }}>
                or configure your own nav!
              </Text>
              <div style={{ backgroundImage: `url(${arrow})` }} className={css.configHelpText}></div>
            </Layout.Horizontal>
          </Layout.Vertical>

          <Layout.Vertical flex spacing="xxxlarge" data-testId="grouplistContainer">
            {moduleGroupConfig.map(item => (
              <Group
                data={item}
                key={item.label}
                tooltipProps={{
                  handleClick: (module: NavModuleName) => {
                    setActiveModuleCarousel(module)
                  },
                  activeModule: activeModuleCarousel
                }}
                onModuleClick={(module: NavModuleName) => {
                  setModuleConfigPreference({
                    selectedModules:
                      selectedModules.indexOf(module) > -1 ? selectedModules : [...selectedModules, module],
                    orderedModules
                  })
                  close()
                }}
              />
            ))}
          </Layout.Vertical>
        </div>
      </Drawer>
      {activeModuleCarousel ? (
        <ModuleConfigurationScreen
          onClose={() => {
            setActiveModuleCarousel(undefined)
            close()
          }}
          activeModule={activeModuleCarousel}
          className={css.configScreenWithoutReorder}
          hideReordering
          hideHeader
        />
      ) : null}
    </>
  )
}

export default ModuleList
