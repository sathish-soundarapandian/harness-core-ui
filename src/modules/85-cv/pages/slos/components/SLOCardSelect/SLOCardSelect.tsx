/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { RiskCount } from 'services/cv'
import { getRiskColorLogo, getRiskColorValue } from '@cv/utils/CommonUtils'
import type { RiskTypes } from '../../CVSLOsListingPage.types'
import css from './SLOCardSelect.module.scss'

interface SLOCardSelectProps extends RiskCount {
  displayColor: string
}

const SLOCardSelect: React.FC<SLOCardSelectProps> = ({ displayName, count }) => {
  const riskCategory = displayName?.toUpperCase()?.replace(/ /g, '_') as RiskTypes
  const dataTooltipId = useMemo(() => displayName?.replace(/ /g, '') + '_tooltip', [displayName])
  const iconCardBackgroundColor = getRiskColorValue(riskCategory)
  const riskCategoryLogo = getRiskColorLogo(riskCategory) as IconName

  return (
    <Layout.Horizontal height={76} className={css.sloCardSelectContainer} data-test-id={dataTooltipId}>
      <Container
        margin={{ right: 'medium' }}
        width={56}
        style={{ backgroundColor: `${iconCardBackgroundColor}` }}
        className={css.filterIcons}
      >
        <Icon name={riskCategoryLogo} size={30} color={Color.WHITE} />
      </Container>
      <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.FORM_HELP }} tooltipProps={{ dataTooltipId }}>
          {displayName}
        </Text>
        <Text font={{ variation: FontVariation.H2 }}>{count}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default SLOCardSelect
