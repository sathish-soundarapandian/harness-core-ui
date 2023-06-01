/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Heading, Layout, Popover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import pageCss from '../SubscriptionsPage.module.scss'

// eslint-disable-next-line import/no-unresolved
const ErrorTrackingApp = React.lazy(() => import('errortracking/App'))

const CETActiveAgentsCard: React.FC = () => {
  const { getString } = useStrings()

  const Header: React.FC = () => {
    return (
      <Layout.Vertical className={pageCss.headerMargin}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.usage.cetAgents')}
        </Heading>
        <div className={pageCss.tooltip}>
          <Popover
            popoverClassName={Classes.DARK}
            position={Position.BOTTOM}
            interactionKind={PopoverInteractionKind.HOVER}
            content={
              <Text width={200} padding="medium" color={Color.WHITE}>
                {getString('common.subscriptions.usage.cetAgentToolTip')}
              </Text>
            }
          >
            <Text color={Color.PRIMARY_7} font={{ size: 'xsmall' }}>
              {getString('common.subscriptions.cet.whatIsActiveAgent')}
            </Text>
          </Popover>
        </div>
      </Layout.Vertical>
    )
  }

  return (
    <Card>
      <Header />
      <ChildAppMounter ChildApp={ErrorTrackingApp} componentLocation={'active-agents'} />
    </Card>
  )
}

export default CETActiveAgentsCard
