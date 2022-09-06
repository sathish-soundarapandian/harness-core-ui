/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { Drawer, Position } from '@blueprintjs/core'
import { Color, Container, Icon, Layout, Text } from '@harness/uicore'
import { String, StringKeys } from 'framework/strings'
import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import NavModule from './NavModule/NavModule'
import ModuleConfigurationScreen from '../ModuleConfigurationScreen/ModuleConfigurationScreen'
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

interface GroupConfig {
  label: StringKeys
  items: NavModuleName[]
}

interface ItemProps {
  data: NavModuleName
  tooltipProps?: ModuleTooltipProps
}

interface GroupProps {
  data: GroupConfig
  tooltipProps?: ModuleTooltipProps
}

const Item: React.FC<ItemProps> = ({ data, tooltipProps }) => {
  const { redirectionLink, shouldVisible } = useNavModuleInfo([data])[0]
  const { module } = useModuleInfo()
  const currentModule = module ? moduleToModuleNameMapping[module] : undefined

  if (!shouldVisible) {
    return null
  }

  return (
    <Link to={redirectionLink}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <NavModule module={data} active={currentModule === data} />
        <Icon
          name="tooltip-icon"
          padding={'small'}
          margin={{ left: 'small' }}
          color={tooltipProps?.activeModule === data ? Color.SUCCESS : undefined}
          size={12}
          className={css.clickable}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            tooltipProps?.handleClick(data)
          }}
        />
      </Layout.Horizontal>
    </Link>
  )
}

const Group: React.FC<GroupProps> = ({ data, tooltipProps }) => {
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
          <Item key={item} data={item} tooltipProps={tooltipProps} />
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

const ModuleList: React.FC<ModuleListProps> = ({ isOpen, close, usePortal = true, onConfigIconClick }) => {
  const [activeModuleCarousel, setActiveModuleCarousel] = useState<NavModuleName | undefined>(undefined)

  const onConfigScreenClose = () => {
    setActiveModuleCarousel(undefined)
    close()
  }

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
              onClick={onConfigIconClick}
            />
          </Container>
          <Layout.Vertical flex spacing="xxxlarge" data-testId="grouplistContainer">
            {listConfig.map(item => (
              <Group
                data={item}
                key={item.label}
                tooltipProps={{
                  handleClick: (module: NavModuleName) => {
                    setActiveModuleCarousel(module)
                  },
                  activeModule: activeModuleCarousel
                }}
              />
            ))}
          </Layout.Vertical>
        </div>
      </Drawer>
      {activeModuleCarousel ? (
        <ModuleConfigurationScreen
          onClose={() => {
            onConfigScreenClose()
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
