/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HarnessDocTooltip, Icon, Layout, Text } from '@harness/uicore'
import css from './COGatewayConfig.module.scss'

interface DataTooltip {
  titleId?: string
  subTitleId?: string
}

interface COGatewayConfigStepProps {
  count: number
  title: string
  subTitle?: string
  totalStepsCount?: number
  id?: string
  onInfoIconClick?: () => void
  dataTooltip?: DataTooltip
}

const stepInfoColorMap: { [key: string]: { main: string; secondary: string } } = {
  0: { main: '#FCB519', secondary: '#FFFBEE' },
  1: { main: '#1e5c1f', secondary: '#e4f7e1' },
  2: { main: '#0278D5', secondary: '#EFF8FE' },
  3: { main: '#592BAA', secondary: '#E1D0FF' }
}

const COGatewayConfigStep: React.FC<COGatewayConfigStepProps> = props => {
  const colorPallete = stepInfoColorMap[props.count % 4]
  return (
    <Layout.Vertical id={props.id} className={css.configStepContainer} spacing={'small'}>
      <Layout.Horizontal className={css.stepInfo}>
        <span style={{ color: colorPallete.main, backgroundColor: colorPallete.secondary }}>{`Step ${props.count} of ${
          props.totalStepsCount || props.count
        }`}</span>
      </Layout.Horizontal>
      <Text className={css.title} data-tooltip-id={props.dataTooltip?.titleId}>
        {props.title}
        {props.dataTooltip?.titleId && (
          <HarnessDocTooltip tooltipId={props.dataTooltip.titleId} useStandAlone={true}></HarnessDocTooltip>
        )}
        {props.onInfoIconClick && <Icon name="info" onClick={props.onInfoIconClick}></Icon>}
      </Text>
      {props.subTitle && (
        <Text className={css.subTitle} data-tooltip-id={props.dataTooltip?.subTitleId}>
          {props.subTitle}
          {props.dataTooltip?.subTitleId && (
            <HarnessDocTooltip tooltipId={props.dataTooltip.subTitleId} useStandAlone={true} />
          )}
        </Text>
      )}
      {props.children && <div className={css.childrenContainer}>{props.children}</div>}
    </Layout.Vertical>
  )
}

export default COGatewayConfigStep
