/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './CommitmentOrchestrationBody.module.scss'

interface EnableBannerProps {
  summaryData?: any
}

const EnableBanner: React.FC<EnableBannerProps> = ({ summaryData }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()

  const potential = get(summaryData, 'ondemand_spend', 0)
  const total = get(summaryData, 'compute_spend', 0)
  const savingsPercentage = potential && total ? ((potential / total) * 100).toFixed(2) + '%' : ''
  return (
    <Container className={cx(css.bodyWidgetsContainer, css.enableBanner)}>
      <Layout.Horizontal flex>
        <Layout.Horizontal>
          <Container>
            <Text inline font={{ variation: FontVariation.H6 }}>
              {getString('ce.commitmentOrchestration.enableBanner.initialText') + ' '}
            </Text>
            <Text inline font={{ variation: FontVariation.H4 }} color={Color.PRIMARY_7}>
              {formatCost(potential, { decimalPoints: 2 })}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }}>
              {' ' + getString('ce.commitmentOrchestration.enableBanner.finalText', { savingsPercentage })}
            </Text>
          </Container>
        </Layout.Horizontal>
        <Button
          variation={ButtonVariation.PRIMARY}
          icon="nav-settings"
          onClick={() => {
            history.push(routes.toCommitmentOrchestrationSetup({ accountId }))
          }}
        >
          {getString('common.setup')}
        </Button>
      </Layout.Horizontal>
    </Container>
  )
}

export default EnableBanner
