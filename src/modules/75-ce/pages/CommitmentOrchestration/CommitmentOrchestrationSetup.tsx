/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, FontVariation, Layout, Page, PageHeader, Text } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SetupBody from '@ce/components/CommitmentOrchestratorBody/Setup/SetupBody'

const CommitmentOrchestrationSetup: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()

  const links = useMemo(
    () => [
      {
        url: routes.toCommitmentOrchestration({ accountId }),
        label: getString('ce.commitmentOrchestration.sideNavLabel')
      }
    ],
    []
  )

  return (
    <Container>
      <PageHeader
        size="large"
        breadcrumbs={<NGBreadcrumbs links={links} />}
        title={
          <Text
            font={{ variation: FontVariation.H4 }}
            icon="service-aws"
            iconProps={{ size: 32, margin: { right: 'small' } }}
            margin={{ top: 'medium' }}
          >
            {getString('common.setup') + ' ' + getString('ce.commitmentOrchestration.sideNavLabel')}
          </Text>
        }
        toolbar={
          <Layout.Horizontal>
            <Button
              variation={ButtonVariation.SECONDARY}
              icon="cross"
              onClick={() => {
                history.push(routes.toCommitmentOrchestration({ accountId }))
              }}
            >
              {getString('ce.commitmentOrchestration.exitSetupBtn')}
            </Button>
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <SetupBody />
      </Page.Body>
    </Container>
  )
}

export default CommitmentOrchestrationSetup
