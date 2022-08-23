/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Layout, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Icon } from '@harness/icons'
import { ModuleName } from 'framework/types/ModuleName'
import { String } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import ModuleSortableList from './ModuleSortableList/ModuleSortableList'
import ModuleDetailsSection from './ModuleDetailsSection/ModuleDetailsSection'
import useGetContentfulModules from './useGetContentfulModules'
import css from './ModuleConfigurationScreen.module.scss'

interface ModulesConfigurationScreenProps {
  onClose: () => void
}

const ModulesConfigurationScreen: React.FC<ModulesConfigurationScreenProps> = ({ onClose }) => {
  const [activeModule, setActiveModule] = useState<NavModuleName>(ModuleName.CD)
  const { contentfulModuleMap, loading } = useGetContentfulModules()

  const renderHeader = () => {
    return (
      <Container className={css.header}>
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
      </Container>
    )
  }

  return (
    <Layout.Vertical className={css.container} padding={{ left: 'xlarge' }}>
      {renderHeader()}
      <Layout.Horizontal
        padding={{ bottom: 'huge', right: 'huge' }}
        margin={{ bottom: 'xxxlarge' }}
        className={css.body}
      >
        <Container margin={{ right: 'xxlarge' }} className={css.sortableListContainer}>
          <ModuleSortableList activeModule={activeModule} onSelect={setActiveModule} />
        </Container>
        <Container className={css.flex1}>
          {/* Handle error condition */}
          {loading ? (
            <PageSpinner />
          ) : (
            contentfulModuleMap && (
              <ModuleDetailsSection key={activeModule} module={activeModule} data={contentfulModuleMap[activeModule]} />
            )
          )}
        </Container>
      </Layout.Horizontal>

      <Icon name="cross" color={Color.WHITE} size={18} className={css.crossIcon} onClick={onClose} />
    </Layout.Vertical>
  )
}

export default ModulesConfigurationScreen
