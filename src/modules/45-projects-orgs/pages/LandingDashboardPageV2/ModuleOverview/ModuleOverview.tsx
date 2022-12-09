import React, { CSSProperties } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import type { TimeRangeFilterType } from '@common/types'
import { ModuleName } from 'framework/types/ModuleName'
import { StringKeys, useStrings } from 'framework/strings'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import ModuleOverviewFactory from '@projects-orgs/factories/ModuleOverviewFactory'
import CDEmptyState from './EmptyState/CDEmptyState'
import type { ModuleOverviewBaseProps } from './Grid/ModuleOverviewGrid'
import CIEmptyState from './EmptyState/CIEmptyState'
import ChaosEmptyState from './EmptyState/ChaosEmptyState'
import CEEmptyState from './EmptyState/CEEmptyState'
import CFEmptyState from './EmptyState/CFEmptyState'
import SLOEmptyState from './EmptyState/SLOEmptyState'
import STOEmptyState from './EmptyState/STOEmptyState'
import css from './ModuleOverview.module.scss'

interface ModuleOverviewProps {
  module: NavModuleName
  timeRange: TimeRangeFilterType
  isExpanded: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

interface IModuleOverviewMap {
  label: StringKeys
  EmptyState: React.ComponentType<ModuleOverviewBaseProps>
}

const moduleLabelMap: Record<NavModuleName, IModuleOverviewMap> = {
  [ModuleName.CD]: {
    label: 'common.moduleOverviewLabel.cd',
    EmptyState: CDEmptyState
  },
  [ModuleName.CI]: {
    label: 'buildsText',
    EmptyState: CIEmptyState
  },
  [ModuleName.CF]: {
    label: 'common.moduleOverviewLabel.ff',
    EmptyState: CFEmptyState
  },
  [ModuleName.CHAOS]: {
    label: 'common.moduleOverviewLabel.chaos',
    EmptyState: ChaosEmptyState
  },
  [ModuleName.STO]: {
    label: 'common.moduleOverviewLabel.sto',
    EmptyState: STOEmptyState
  },
  [ModuleName.CV]: {
    label: 'common.moduleOverviewLabel.cv',
    EmptyState: SLOEmptyState
  },
  [ModuleName.CE]: {
    label: 'common.moduleOverviewLabel.ce',
    EmptyState: CEEmptyState
  },
  [ModuleName.CODE]: {
    label: 'common.purpose.code.name',
    EmptyState: () => null
  }
}

const ModuleOverview: React.FC<ModuleOverviewProps> = ({
  module,
  isExpanded,
  timeRange,
  className,
  style,
  onClick
}) => {
  const { label, EmptyState } = moduleLabelMap[module]
  const { getString } = useStrings()
  const { color, icon, backgroundColor, hasLicense } = useNavModuleInfo(module)
  const ModuleOverviewDetails = ModuleOverviewFactory.getModuleOverview(module)
  const showZeroState = !ModuleOverviewDetails

  const containerStyle = cx(css.container, {
    [css.expanded]: isExpanded,
    [css.collapsed]: !isExpanded,
    [css.dataState]: !showZeroState,
    [css.zeroState]: showZeroState
  })

  const renderOverviewDetails = () => {
    if (!ModuleOverviewDetails) {
      return null
    }

    return <ModuleOverviewDetails isExpanded={isExpanded} timeRange={timeRange} />
  }

  return (
    <Container
      className={cx(css.parent, className)}
      style={{ borderColor: `var(${color})`, backgroundColor: `var(${backgroundColor})`, ...style }}
    >
      <Layout.Vertical className={containerStyle} onClick={onClick}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text width="70%" color={Color.GREY_900} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString(label)}
          </Text>
          <Icon className={css.icon} name={icon} size={isExpanded ? 68 : 32} />
        </Layout.Horizontal>
        <Container className={css.flex1}>
          {showZeroState ? <EmptyState isExpanded={isExpanded} timeRange={timeRange} /> : renderOverviewDetails()}
        </Container>
        <Text className={css.clickToExpandText} color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
          {getString('common.clickToExpand')}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

export default ModuleOverview
