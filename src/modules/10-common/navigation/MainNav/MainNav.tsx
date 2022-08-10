/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useLayoutEffect } from 'react'
import cx from 'classnames'
import { NavLink as Link, useParams } from 'react-router-dom'
import type { NavLinkProps } from 'react-router-dom'
import { Text, Icon, Layout, Avatar, Button, Container, useToggleOpen } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import ModuleList from '@common/navigation/ModuleList/ModuleList'
import { String } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import paths from '@common/RouteDefinitions'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceCenter } from '@common/components/ResourceCenter/ResourceCenter'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'

import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { FeatureFlag } from '@common/featureFlags'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import {
  MODULES_CONFIG_PREFERENCE_STORE_KEY,
  ModulesPreferenceStoreData
} from '../ModuleConfigurationScreen/ModuleSortableList/ModuleSortableList'
import {
  BuildsNavItem,
  ChaosNavItem,
  CloudCostsNavItem,
  DeploymentsNavItem,
  FeatureFlagsNavItem,
  SRMNavItem,
  STONavItem
} from './ModuleLinks'
import css from './MainNav.module.scss'
import { DEFAULT_MODULES_ORDER } from '../ModuleConfigurationScreen/util'

const commonLinkProps: Partial<NavLinkProps> = {
  activeClassName: css.active,
  className: cx(css.navLink)
}

const maxNumOfModulesToShow = 3

export default function L1Nav(): React.ReactElement {
  const params = useParams<ProjectPathProps>()
  const { module } = useModuleInfo()
  const { RESOURCE_CENTER_ENABLED, NG_DASHBOARDS, NEW_LEFT_NAVBAR_SETTINGS } = useFeatureFlags()
  const { isOpen: isModuleListOpen, toggle: toggleModuleList, close: closeModuleList } = useToggleOpen(false)
  const { currentUserInfo: user } = useAppStore()

  const { preference: modulesPreferenceData } = usePreferenceStore<ModulesPreferenceStoreData>(
    PreferenceScope.USER,
    MODULES_CONFIG_PREFERENCE_STORE_KEY
  )
  const moduleToNavItemsMap = new Map<ModuleName, () => JSX.Element>()
  const CDNG_ENABLED = useFeatureFlag(FeatureFlag.CDNG_ENABLED)
  CDNG_ENABLED && moduleToNavItemsMap.set(ModuleName.CD, DeploymentsNavItem)
  const CING_ENABLED = useFeatureFlag(FeatureFlag.CING_ENABLED)
  CING_ENABLED && moduleToNavItemsMap.set(ModuleName.CI, BuildsNavItem)
  const CFNG_ENABLED = useFeatureFlag(FeatureFlag.CFNG_ENABLED)
  CFNG_ENABLED && moduleToNavItemsMap.set(ModuleName.CF, FeatureFlagsNavItem)
  const CENG_ENABLED = useFeatureFlag(FeatureFlag.CENG_ENABLED)
  CENG_ENABLED && moduleToNavItemsMap.set(ModuleName.CE, CloudCostsNavItem)
  const CVNG_ENABLED = useFeatureFlag(FeatureFlag.CVNG_ENABLED)
  CVNG_ENABLED && moduleToNavItemsMap.set(ModuleName.CV, SRMNavItem)
  const CHAOS_ENABLED = useFeatureFlag(FeatureFlag.CHAOS_ENABLED)
  CHAOS_ENABLED && moduleToNavItemsMap.set(ModuleName.CHAOS, ChaosNavItem)
  const SECURITY = useFeatureFlag(FeatureFlag.SECURITY)
  SECURITY && moduleToNavItemsMap.set(ModuleName.STO, STONavItem)

  const modulesToShow = [...(modulesPreferenceData?.selectedModules || DEFAULT_MODULES_ORDER)]
  // if current module is not selecting in the modules config, add it temporarily
  if (
    module &&
    !(modulesPreferenceData?.selectedModules || DEFAULT_MODULES_ORDER).includes(moduleToModuleNameMapping[module])
  ) {
    modulesToShow.push(moduleToModuleNameMapping[module])
  }
  const modulesListHeight = 92 * Math.min(maxNumOfModulesToShow, modulesToShow.length)

  useLayoutEffect(() => {
    // main nav consists of two UL sections with classname "css.navList"
    const items = Array.from(document.querySelectorAll(`.${css.navList}`))
    // add the real height of both sections
    // real height is needed because number of items can change based on feature flags, license etc
    const minNavHeight = items.reduce((previousValue, listitem) => {
      return previousValue + listitem.getBoundingClientRect().height
    }, 0)
    // set the CSS variable defined in src/modules/10-common/layouts/layouts.module.scss
    const root = document.querySelector(':root') as HTMLElement
    root.style.setProperty('--main-nav-height', `${minNavHeight}px`)

    document.getElementsByClassName(css.active)[0]?.scrollIntoView({ block: 'nearest' })
  })

  return (
    <>
      <nav className={css.main}>
        <ul className={css.navList}>
          <li className={css.navItem}>
            <Link {...commonLinkProps} to={paths.toHome(params)}>
              <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
                <Icon name="harness" size={30} />
                <Text
                  font={{ weight: 'semi-bold', align: 'center' }}
                  padding={{ bottom: 'xsmall' }}
                  color={Color.WHITE}
                  className={css.text}
                >
                  <String stringID="common.home" />
                </Text>
              </Layout.Vertical>
            </Link>
          </li>
          <div className={css.modulesContainer} style={{ height: modulesListHeight }}>
            {(modulesPreferenceData?.orderedModules || DEFAULT_MODULES_ORDER).map(moduleName => {
              const NavItem = moduleToNavItemsMap.get(moduleName)
              if (!NavItem || !modulesToShow.includes(moduleName)) return null
              return <NavItem key={moduleName} />
            })}
          </div>
          {NEW_LEFT_NAVBAR_SETTINGS && (
            <li>
              <Container flex={{ justifyContent: 'center' }}>
                <Button
                  minimal
                  icon={'layout-grid'}
                  iconProps={{ size: 12 }}
                  tooltip={'Select Modules'}
                  tooltipProps={{ isDark: true, position: 'right' }}
                  className={css.allModulesButton}
                  onClick={toggleModuleList}
                />
              </Container>
            </li>
          )}
        </ul>
        <ul className={css.navList}>
          {RESOURCE_CENTER_ENABLED && (
            <li className={css.navItem}>
              <ResourceCenter />
            </li>
          )}
          {NG_DASHBOARDS && (
            <li className={css.navItem}>
              <Link
                className={cx(css.navLink, css.settings, css.hoverNavLink)}
                activeClassName={css.active}
                to={paths.toCustomDashboard(params)}
              >
                <Layout.Vertical flex spacing="xsmall">
                  <Icon name="dashboard" size={20} />
                  <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
                    <String stringID="common.dashboards" />
                  </Text>
                </Layout.Vertical>
              </Link>
            </li>
          )}
          <li className={css.navItem}>
            <Link
              className={cx(css.navLink, css.settings, css.hoverNavLink)}
              activeClassName={css.active}
              to={paths.toAccountSettings(params)}
            >
              <Layout.Vertical flex spacing="xsmall">
                <Icon name="nav-settings" size={20} />
                <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
                  <String stringID="common.accountSettings" />
                </Text>
              </Layout.Vertical>
            </Link>
          </li>
          <li className={css.navItem}>
            <Link
              className={cx(css.navLink, css.userLink, css.hoverNavLink)}
              activeClassName={css.active}
              to={paths.toUser(params)}
            >
              <Layout.Vertical flex spacing="xsmall">
                <Avatar name={user.name || user.email} email={user.email} size="small" hoverCard={false} />
                <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hiddenText}>
                  <String stringID="common.myProfile" />
                </Text>
              </Layout.Vertical>
            </Link>
          </li>
        </ul>
      </nav>
      {NEW_LEFT_NAVBAR_SETTINGS ? <ModuleList isOpen={isModuleListOpen} close={closeModuleList} /> : null}
    </>
  )
}
