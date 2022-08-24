/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { FontVariation } from '@harness/design-system'
import { Drawer, Position } from '@blueprintjs/core'
import { Color, Container, Icon, Layout, Text } from '@harness/uicore'
import { String, StringKeys } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import NavModule from './NavModule/NavModule'
import ModuleConfigurationScreen from '../ModuleConfigurationScreen/ModuleConfigurationScreen'
import css from './ModuleList.module.scss'

interface ModuleListProps {
  isOpen: boolean
  close: () => void
  usePortal?: boolean
}

interface GroupConfig {
  label: StringKeys
  items: NavModuleName[]
}

interface ItemProps {
  data: NavModuleName
  activeModule: NavModuleName
  onTooltipClick?: (module: NavModuleName) => void
}

interface GroupProps {
  data: GroupConfig
  activeModule: NavModuleName
  onTooltipClick?: (module: NavModuleName) => void
}

const Item: React.FC<ItemProps> = ({ data, onTooltipClick, activeModule }) => {
  const { redirectionLink, shouldVisible } = useNavModuleInfo([data])[0]

  if (!shouldVisible) {
    return null
  }

  return (
    <Link to={redirectionLink}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <NavModule module={data} active={activeModule === data} />
        <Icon
          name="tooltip-icon"
          padding={'small'}
          margin={{ left: 'small' }}
          size={12}
          className={css.clickable}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            onTooltipClick?.(data)
          }}
        />
      </Layout.Horizontal>
    </Link>
  )
}

const Group: React.FC<GroupProps> = ({ data, onTooltipClick, activeModule }) => {
  const modules = useNavModuleInfo(data.items)

  if (modules.filter(module => module.shouldVisible).length === 0) {
    return null
  }

  return (
    <Container>
      <Text color={Color.PRIMARY_2} margin={{ bottom: 'large' }} font={{ size: 'small', weight: 'semi-bold' }}>
        <String stringID={data.label} />
      </Text>
      <Layout.Vertical spacing="medium">
        {data.items.map(item => (
          <Item key={item} data={item} onTooltipClick={onTooltipClick} activeModule={activeModule} />
        ))}
      </Layout.Vertical>
    </Container>
  )
}

const listConfig: GroupConfig[] = [
  {
    label: 'common.moduleList.buildAndTest',
    items: [ModuleName.CI]
  },
  {
    label: 'common.moduleList.deployChanges',
    items: [ModuleName.CD]
  },
  {
    label: 'common.moduleList.manageImpact',
    items: [ModuleName.STO, ModuleName.CF]
  },
  {
    label: 'common.moduleList.optimize',
    items: [ModuleName.CE, ModuleName.CV]
  }
]

const ModuleConfigHeader: React.FC = () => {
  return (
    <>
      <Text inline margin={{ bottom: 'xsmall' }}>
        <Text inline color={Color.WHITE} font={{ variation: FontVariation.H2 }}>
          <String stringID="common.moduleConfig.selectModules" />
        </Text>
        <Text inline color={Color.PRIMARY_5} className={css.blueText} margin={{ left: 'small', right: 'small' }}>
          <String stringID="common.moduleConfig.your" />
        </Text>
        <Text inline color={Color.WHITE} font={{ variation: FontVariation.H2 }}>
          <String stringID="common.moduleConfig.navigation" />
        </Text>
      </Text>
    </>
  )
}

const ModuleList: React.FC<ModuleListProps> = ({ isOpen, close, usePortal = true }) => {
  const [showModuleSettings, setShowModuleSettings] = useState(false)
  const [activeModule, setActiveModule] = useState<NavModuleName | undefined>(undefined)

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
          <Container flex={{ alignItems: 'center' }} margin={{ bottom: 'huge' }}>
            <Text font={{ size: 'large', weight: 'bold' }} color={Color.WHITE}>
              <String stringID="common.moduleList.title" />
            </Text>
            <Icon
              name="customize"
              size={20}
              className={cx(css.blue, css.clickable)}
              padding={'small'}
              onClick={() => setShowModuleSettings(true)}
            />
          </Container>
          <Layout.Vertical flex spacing="xxxlarge">
            {listConfig.map(item => (
              <Group
                data={item}
                key={item.label}
                activeModule={activeModule}
                onTooltipClick={module => {
                  setActiveModule(module)
                }}
              />
            ))}
          </Layout.Vertical>
        </div>
      </Drawer>
      {activeModule || showModuleSettings ? (
        <ModuleConfigurationScreen
          onClose={() => {
            setShowModuleSettings(false)
            close()
            setActiveModule(undefined)
          }}
          activeModule={activeModule}
          headerText={showModuleSettings ? <ModuleConfigHeader /> : undefined}
          className={!showModuleSettings ? css.configScreenWithoutReorder : undefined}
          hideReordering={!showModuleSettings}
        />
      ) : undefined}
    </>
  )
}

export default ModuleList
