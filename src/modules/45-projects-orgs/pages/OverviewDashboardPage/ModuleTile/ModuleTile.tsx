import React, { useState } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import cx from 'classnames'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import { StringKeys, useStrings } from 'framework/strings'
import OverviewDashboardPageFactory from '@projects-orgs/factories/OverviewDashboardPageFactory'
import type { TimeRangeFilterType } from '@common/types'
import CDZeroState from './views/CDEmptyState'
import type { ModuleTileDetailsBaseProps } from './types'
import CIEmptyState from './views/CIEmptyState'
import FFEmptyState from './views/FFEmptyState'
import css from './ModuleTile.module.scss'

interface ModuleTileProps {
  module: NavModuleName
  selectedRange: TimeRangeFilterType
}
interface ModuleTileDetails {
  label: StringKeys
  ZeroState?: React.ComponentType<ModuleTileDetailsBaseProps> // should not be optional
}

const moduleTileMap: Record<NavModuleName, ModuleTileDetails> = {
  [ModuleName.CD]: {
    label: 'common.moduleTileLabel.cd',
    ZeroState: CDZeroState
  },
  [ModuleName.CI]: {
    label: 'buildsText',
    ZeroState: CIEmptyState
  },
  [ModuleName.CF]: {
    label: 'common.moduleTileLabel.ff',
    ZeroState: FFEmptyState
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
  [ModuleName.CODE]: {
    label: 'common.purpose.code.name'
  }
}

const ModuleTile: React.FC<ModuleTileProps> = ({ module, selectedRange }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const { getString } = useStrings()
  const { color, icon, backgroundColor, hasLicense, pipelineIcon } = useNavModuleInfo(module)
  const { label, ZeroState } = moduleTileMap[module]

  const ModuleTileOverview = OverviewDashboardPageFactory.getModuleTileOverview(module)

  const showEmptyState = !hasLicense || !ModuleTileOverview

  const renderEmptyState = () => {
    if (!ZeroState) {
      return null
    }
    return <ZeroState isExpanded={isExpanded} selectedRange={selectedRange} />
  }

  const renderOverview = () => {
    if (!ModuleTileOverview) {
      return renderEmptyState()
    }

    return <ModuleTileOverview isExpanded={isExpanded} selectedRange={selectedRange} />
  }

  return (
    <Container
      className={css.parentContainer}
      style={{ borderColor: `var(${color})`, backgroundColor: `var(${backgroundColor})` }}
    >
      <Layout.Vertical
        className={cx(
          css.container,
          { [css.hoverStyle]: !isExpanded },
          { [css.expanded]: isExpanded },
          { [css.emptyState]: showEmptyState }
        )}
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
      >
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text width="70%" color={Color.GREY_900} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString(label)}
          </Text>
          <Icon className={css.icon} name={icon} size={isExpanded ? 68 : 32} />
        </Layout.Horizontal>
        <Container className={css.tileBody}>{showEmptyState ? renderEmptyState() : renderOverview()}</Container>
        {!isExpanded && (
          <Text className={css.clickToExpandText} color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
            {getString('common.clickToExpand')}
          </Text>
        )}
        <Icon name={pipelineIcon} size={170} className={css.backgroundIcon} />
      </Layout.Vertical>
    </Container>
  )
}

export default ModuleTile
