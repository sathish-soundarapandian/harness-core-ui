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
import { String, useStrings } from 'framework/strings'
import ModuleSortableList from './ModuleSortableList/ModuleSortableList'
import ModuleDetailsSection from './ModuleDetailsSection/ModuleDetailsSection'
import css from './ModuleConfigurationScreen.module.scss'

interface ModulesConfigurationScreenProps {
  onClose: () => void
}

const ModulesConfigurationScreen: React.FC<ModulesConfigurationScreenProps> = ({ onClose }) => {
  const [activeModule, setActiveModule] = useState<ModuleName>(ModuleName.CD)
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.container} padding={{ top: 'huge', bottom: 'huge', right: 'huge' }}>
      <Layout.Horizontal
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        padding={{ left: 'xxxlarge', bottom: 'large' }}
      >
        <Icon name="customize" size={20} margin={{ right: 'small' }} />
        <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL_BOLD }}>
          <String stringID="common.moduleConfig.customize" />
        </Text>
      </Layout.Horizontal>
      <Layout.Vertical padding={{ left: 'huge' }} margin={{ left: 'medium' }}>
        <Text color={Color.WHITE} font={{ variation: FontVariation.H4 }} margin={{ bottom: 'xsmall' }}>
          <String stringID="common.moduleConfig.title" />
        </Text>
        <Text color={Color.GREY_200} font={{ variation: FontVariation.SMALL }}>
          ({getString('common.moduleConfig.autoSaved')})
        </Text>
        <Layout.Horizontal padding={{ top: 'huge', bottom: 'huge' }} height="100%">
          <Container className={css.listContainer} margin={{ right: 'xxlarge' }}>
            <ModuleSortableList activeModule={activeModule} onSelect={setActiveModule} />
          </Container>
          <Container className={css.detailsContainer}>
            <ModuleDetailsSection module={activeModule} />
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>

      <Icon name="cross" color={Color.WHITE} size={18} className={css.crossIcon} onClick={onClose} />
    </Layout.Vertical>
  )
}

export default ModulesConfigurationScreen
