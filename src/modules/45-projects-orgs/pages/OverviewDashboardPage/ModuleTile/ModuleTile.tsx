import React, { useState } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import cx from 'classnames'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import { StringKeys, useStrings } from 'framework/strings'
import OverviewDashboardPageFactory from '@projects-orgs/factories/OverviewDashboardPageFactory'
import CDZeroState from './views/CDZeroState/CDZeroState'
import type { ModuleTileDetailsBaseProps } from './types'
import css from './ModuleTile.module.scss'

interface ModuleTileProps {
  module: NavModuleName
}
interface ModuleTileDetails {
  label: StringKeys
  EmptyState?: React.ComponentType<ModuleTileDetailsBaseProps> // should not be optional
}

const moduleTileMap: Record<NavModuleName, ModuleTileDetails> = {
  [ModuleName.CD]: {
    label: 'common.moduleTileLabel.cd',
    EmptyState: CDZeroState
  },
  [ModuleName.CI]: {
    label: 'buildsText'
  },
  [ModuleName.CF]: {
    label: 'common.moduleTileLabel.ff'
  },
  [ModuleName.CHAOS]: {
    label: 'common.moduleTileLabel.chaos'
  },
  [ModuleName.STO]: {
    label: 'common.moduleTileLabel.sto'
  },
  [ModuleName.CV]: {
    label: 'common.moduleTileLabel.cv'
  },
  [ModuleName.CE]: {
    label: 'common.moduleTileLabel.ce'
  },
  [ModuleName.SCM]: {
    label: 'common.purpose.scm.name'
  }
}

const ModuleTile: React.FC<ModuleTileProps> = ({ module }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const { getString } = useStrings()
  const { color, icon, backgroundColor, hasLicense } = useNavModuleInfo(module)
  const { label, EmptyState } = moduleTileMap[module]
  const showEmptyState = !hasLicense

  const ModuleTileOverview = OverviewDashboardPageFactory.getModuleTileOverview(module)

  const renderEmptyState = () => {
    if (!EmptyState) {
      return null
    }
    return <EmptyState isExpanded={isExpanded} />
  }

  const renderOverview = () => {
    if (!ModuleTileOverview) {
      return renderEmptyState()
    }

    return <ModuleTileOverview isExpanded={isExpanded} />
  }

  return (
    <Container style={{ borderColor: `var(${color})` }}>
      <Layout.Vertical
        style={{ backgroundColor: isExpanded ? `var(${backgroundColor})` : 'var(--white)' }}
        className={cx(css.container, css.hoverStyle, { [css.expanded]: isExpanded })}
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
      >
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString(label)}
          </Text>
          <Icon className={css.icon} name={icon} size={32} />
        </Layout.Horizontal>
        <Container className={css.tileBody}>{showEmptyState ? renderEmptyState() : renderOverview()}</Container>
        {!isExpanded && (
          <Text className={css.clickToExpandText} color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
            {getString('common.clickToExpand')}
          </Text>
        )}
      </Layout.Vertical>
    </Container>
  )
}

export default ModuleTile
