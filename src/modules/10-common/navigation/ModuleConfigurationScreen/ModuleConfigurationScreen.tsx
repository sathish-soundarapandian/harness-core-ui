/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout, Container, Text } from '@harness/uicore'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Icon } from '@harness/icons'
import { ModuleName } from 'framework/types/ModuleName'
import { PageSpinner } from '@common/components'
import { DEFAULT_MODULES_ORDER, NavModuleName, useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { String } from 'framework/strings'
import ModuleSortableList from './ModuleSortableList/ModuleSortableList'
import ModuleCarousel from './ModuleDetailsSection/ModuleCarousel'
import useGetContentfulModules from './useGetContentfulModules'
import css from './ModuleConfigurationScreen.module.scss'

interface ModulesConfigurationScreenProps {
  onClose: () => void
  className?: string
  hideReordering?: boolean
  hideHeader?: boolean
  activeModule?: NavModuleName
}

interface ModuleConfigHeaderProps {
  onDefaultSettingsClick?: () => void
}

export interface ModulesPreferenceStoreData {
  orderedModules: NavModuleName[]
  selectedModules: NavModuleName[]
}

export const MODULES_CONFIG_PREFERENCE_STORE_KEY = 'modulesConfiguration'

const ModuleConfigHeader: React.FC<ModuleConfigHeaderProps> = ({ onDefaultSettingsClick }) => {
  return (
    <>
      <Text inline margin={{ bottom: 'xsmall' }} flex={{ justifyContent: 'flex-start' }}>
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
      <Text className={css.defaultSettingsTextContainer}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_200} inline>
          (<String stringID="common.moduleConfig.autoSaved" />)
        </Text>
      </Text>
    </>
  )
}

const ModulesConfigurationScreen: React.FC<ModulesConfigurationScreenProps> = ({
  onClose,
  className,
  hideReordering,
  activeModule: activeModuleFromProps,
  hideHeader
}) => {
  const [activeModule, setActiveModule] = useState<NavModuleName>(ModuleName.CD)
  const { setPreference: setModuleConfigPreference, preference: { orderedModules = [], selectedModules = [] } = {} } =
    usePreferenceStore<ModulesPreferenceStoreData>(PreferenceScope.USER, MODULES_CONFIG_PREFERENCE_STORE_KEY)
  const { contentfulModuleMap, loading } = useGetContentfulModules()
  const moduleMap = useNavModuleInfoMap()

  useEffect(() => {
    if (activeModuleFromProps) {
      setActiveModule(activeModuleFromProps)
    }
  }, [activeModuleFromProps])

  useEffect(() => {
    // Handle case when new module is added
    if (!orderedModules || orderedModules.length === 0) {
      setModuleConfigPreference({
        selectedModules,
        orderedModules: DEFAULT_MODULES_ORDER
      })
    }
  }, [orderedModules])

  return (
    <Layout.Vertical className={cx(css.container, className)} padding={{ left: 'xlarge' }}>
      <Container className={css.header}>
        {!hideHeader ? (
          <ModuleConfigHeader
            onDefaultSettingsClick={() => {
              const modulesWithLicense = DEFAULT_MODULES_ORDER.filter(m => !!moduleMap[m].licenseType)
              setModuleConfigPreference({
                selectedModules: modulesWithLicense,
                orderedModules: DEFAULT_MODULES_ORDER
              })
            }}
          />
        ) : null}
      </Container>
      <Layout.Horizontal
        padding={{ bottom: 'huge', right: 'huge' }}
        margin={{ bottom: 'xxxlarge' }}
        className={css.body}
      >
        {!hideReordering ? (
          <Container margin={{ right: 'xxlarge' }} className={css.sortableListContainer}>
            <ModuleSortableList
              activeModule={activeModule}
              onSelect={setActiveModule}
              orderedModules={orderedModules}
              selectedModules={selectedModules}
              handleUpdate={(updatedOrder, selected) => {
                setModuleConfigPreference({ orderedModules: updatedOrder, selectedModules: selected })
              }}
            />
          </Container>
        ) : null}

        <Container className={css.flex1}>
          {loading ? (
            <PageSpinner />
          ) : (
            contentfulModuleMap && (
              <ModuleCarousel key={activeModule} module={activeModule} data={contentfulModuleMap[activeModule]} />
            )
          )}
        </Container>
      </Layout.Horizontal>

      <Icon name="cross" color={Color.WHITE} size={18} className={css.crossIcon} onClick={onClose} />
    </Layout.Vertical>
  )
}

export default ModulesConfigurationScreen
