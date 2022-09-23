/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  FontVariation,
  Layout,
  PageHeader,
  PageSpinner,
  Text
} from '@harness/uicore'
import { get } from 'lodash-es'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import CommitmentOrchestrationBody from '@ce/components/CommitmentOrchestratorBody/CommitmentOrchestratorBody'
import routes from '@common/RouteDefinitions'
import { useGetSetupCO } from 'services/lw-co'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './CommitmentOrchestration.module.scss'

const CommitmentOrchestration: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()

  const { data, loading } = useGetSetupCO({
    accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const activeMode = get(data, 'response.enabled', false)

  /* istanbul ignore next */
  if (loading) {
    return <PageSpinner />
  }

  return (
    <Container>
      <PageHeader
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Container className={css.titleContainer}>
            <Text font={{ variation: FontVariation.H4 }}>{getString('ce.commitmentOrchestration.sideNavLabel')}</Text>
            {activeMode && (
              /* istanbul ignore next */ <Text
                className={css.activeSetupTag}
                font={{ variation: FontVariation.UPPERCASED }}
              >
                {getString('active')}
              </Text>
            )}
          </Container>
        }
        toolbar={
          <Layout.Horizontal>
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
        }
      />
      <CommitmentOrchestrationBody isActive={activeMode} />
    </Container>
  )
}

export default CommitmentOrchestration
