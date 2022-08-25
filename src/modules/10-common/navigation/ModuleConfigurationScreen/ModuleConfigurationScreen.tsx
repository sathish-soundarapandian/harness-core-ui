/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout, Container } from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { Icon } from '@harness/icons'
import { ModuleName } from 'framework/types/ModuleName'
import { PageSpinner } from '@common/components'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import ModuleSortableList from './ModuleSortableList/ModuleSortableList'
import ModuleCarousel from './ModuleDetailsSection/ModuleCarousel'
import useGetContentfulModules from './useGetContentfulModules'
import css from './ModuleConfigurationScreen.module.scss'

interface ModulesConfigurationScreenProps {
  onClose: () => void
  className?: string
  hideReordering?: boolean
  headerText?: React.ReactElement
  activeModule?: NavModuleName
}

const ModulesConfigurationScreen: React.FC<ModulesConfigurationScreenProps> = ({
  onClose,
  className,
  hideReordering,
  headerText,
  activeModule: activeModuleFromProps
}) => {
  const [activeModule, setActiveModule] = useState<NavModuleName>(ModuleName.CD)
  const { contentfulModuleMap, loading } = useGetContentfulModules()

  useEffect(() => {
    if (activeModuleFromProps) {
      setActiveModule(activeModuleFromProps)
    }
  }, [activeModuleFromProps])

  const renderHeader = () => {
    return <Container className={css.header}>{headerText}</Container>
  }

  return (
    <Layout.Vertical className={cx(css.container, className)} padding={{ left: 'xlarge' }}>
      {renderHeader()}
      <Layout.Horizontal
        padding={{ bottom: 'huge', right: 'huge' }}
        margin={{ bottom: 'xxxlarge' }}
        className={css.body}
      >
        {!hideReordering ? (
          <Container margin={{ right: 'xxlarge' }} className={css.sortableListContainer}>
            <ModuleSortableList activeModule={activeModule} onSelect={setActiveModule} />
          </Container>
        ) : null}

        <Container className={css.flex1}>
          {/* Handle error condition */}
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
