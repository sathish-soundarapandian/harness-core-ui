/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout } from '@harness/uicore'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { RiskData } from 'services/cv'
import css from './HealthScoreCard.module.scss'

interface HealthScoreCardProps {
  riskScore: number
  riskStatus: RiskData['riskStatus']
}

// Not used
export const HealthScoreCard = (props: HealthScoreCardProps): JSX.Element => {
  const { riskScore, riskStatus } = props
  if (riskScore || riskScore === 0) {
    const color = getRiskColorValue(riskStatus)
    return (
      <Layout.Horizontal
        style={{ flexDirection: 'column' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <div className={css.healthScoreCard} style={{ background: color }}>
          {riskScore}
        </div>
        <Text padding={{ right: 'small', top: 'small' }} font={'xsmall'}>
          {riskStatus}
        </Text>
      </Layout.Horizontal>
    )
  }
  return <></>
}
