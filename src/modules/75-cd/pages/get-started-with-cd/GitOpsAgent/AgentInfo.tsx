/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { V1Agent } from 'services/gitops'

import css from './GitOpsAgentCard.module.scss'

export interface AgentInfoProps {
  agent: V1Agent
}

export const AgentInfo = (props: AgentInfoProps): React.ReactElement => {
  const { getString } = useStrings()
  const { agent } = props

  return (
    <div className={css.applications}>
      <Layout.Vertical>
        <Text font="xsmall" color={Color.GREY_500} style={{ display: 'flex' }}>
          {getString('version')}
          <Text font="xsmall" className={css.paddingLeft}>
            {!agent.version
              ? ' '
              : `V${agent.version?.major ?? 0}.${agent.version?.minor ?? 0}.${agent.version?.patch ?? 0}`}
          </Text>
        </Text>

        <Text font="xsmall" color={Color.GREY_500} style={{ display: 'flex' }}>
          {getString('delegate.LastHeartBeat')}
          <Text font="xsmall" padding={{ left: 'xlarge' }}>
            {agent?.health?.lastHeartbeat ? moment.utc(agent?.health?.lastHeartbeat).fromNow() : '-'}
          </Text>
        </Text>
      </Layout.Vertical>
    </div>
  )
}
