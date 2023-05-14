/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import type { TimeRangeFilterType } from '@common/types'
import { ModuleName } from 'framework/types/ModuleName'
import { StringKeys, useStrings } from 'framework/strings'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import type { ModuleOverviewBaseProps } from './Grid/ModuleOverviewGrid'
import CDModuleOverview from './modules/CDModuleOverview'
import CIModuleOverview from './modules/CIModuleOverview'
import CFModuleOverview from './modules/CFModuleOverview'
import ChaosModuleOverview from './modules/ChaosModuleOverview'
import STOModuleOverview from './modules/STOModuleOverview'
import CEModuleOverview from './modules/CEModuleOverview'
import SLOModuleOverview from './modules/SLOModuleOverview'
import CdImage from './images/pipeline_cd.svg'
import CeImage from './images/pipeline_ce.svg'
import CiImage from './images/pipeline_ci.svg'
import FfImage from './images/pipeline_ff.svg'
import SloImage from './images/pipeline_slo.svg'
import StoImage from './images/pipeline_sto.svg'
import ChaosImage from './images/pipeline_chaos.svg'
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
  Component?: React.ComponentType<ModuleOverviewBaseProps>
  imageSrc?: string
}

const moduleLabelMap: Record<NavModuleName, IModuleOverviewMap> = {
  [ModuleName.CD]: {
    label: 'pipelineSteps.deploy.create.deployStageName',
    Component: CDModuleOverview,
    imageSrc: CdImage
  },
  [ModuleName.CI]: {
    label: 'buildsText',
    Component: CIModuleOverview,
    imageSrc: CiImage
  },
  [ModuleName.CF]: {
    label: 'common.moduleOverviewLabel.ff',
    Component: CFModuleOverview,
    imageSrc: FfImage
  },
  [ModuleName.CHAOS]: {
    label: 'common.moduleOverviewLabel.chaos',
    Component: ChaosModuleOverview,
    imageSrc: ChaosImage
  },
  [ModuleName.STO]: {
    label: 'common.moduleOverviewLabel.sto',
    Component: STOModuleOverview,
    imageSrc: StoImage
  },
  [ModuleName.CV]: {
    label: 'common.moduleOverviewLabel.cv',
    Component: SLOModuleOverview,
    imageSrc: SloImage
  },
  [ModuleName.CE]: {
    label: 'cloudCostsText',
    Component: CEModuleOverview,
    imageSrc: CeImage
  },
  [ModuleName.CODE]: {
    label: 'common.purpose.code.name',
    Component: () => null
  },
  [ModuleName.IACM]: {
    label: 'iacm.stageTitle',
    Component: () => null
  },
  [ModuleName.SSCA]: {
    label: 'common.ssca',
    Component: () => null
  },
  [ModuleName.IDP]: {
    label: 'common.purpose.idp.name',
    Component: () => null
  },
  [ModuleName.CET]: {
    label: 'common.purpose.errorTracking.title',
    Component: () => null
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
  const { label, Component, imageSrc } = moduleLabelMap[module]
  const { getString } = useStrings()
  const { color, icon, backgroundColor, hasLicense } = useNavModuleInfo(module)
  const showEmptyState = !hasLicense

  const containerStyle = cx(css.container, {
    [css.expanded]: isExpanded,
    [css.collapsed]: !isExpanded,
    [css.dataState]: !showEmptyState,
    [css.zeroState]: showEmptyState
  })

  return (
    <Container
      className={cx(css.parent, className)}
      style={{ borderColor: `var(${color})`, backgroundColor: `var(${backgroundColor})`, ...style }}
    >
      <Layout.Vertical className={containerStyle} onClick={onClick}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text width="70%" color={Color.GREY_900} font={{ variation: FontVariation.H6 }}>
            {getString(label)}
          </Text>
          <Icon className={css.icon} name={icon} size={isExpanded ? 68 : 32} />
        </Layout.Horizontal>
        <Container className={css.flex1} padding={{ right: 'medium' }}>
          {Component ? <Component isExpanded={isExpanded} timeRange={timeRange} isEmptyState={showEmptyState} /> : null}
        </Container>
        <Text className={css.clickToExpandText} color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
          {getString('common.clickToExpand')}
        </Text>
        {showEmptyState && (
          <img className={cx(css.backgroundImge, { [css.imageExpanded]: isExpanded })} src={imageSrc} />
        )}
      </Layout.Vertical>
    </Container>
  )
}

export default ModuleOverview
