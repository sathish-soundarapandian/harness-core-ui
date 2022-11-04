/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import { Icon, Layout, Heading, Text, Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps } from '@common/utils/routeUtils'

export default function NotFoundPage(): JSX.Element {
  const params = useRouteMatch({
    path: routes.toPublicExecutionPipelineView({ ...accountPathProps, ...executionPathProps })
  })

  return (
    <Container height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
        <Heading>404</Heading>
        <Text>Oops, we could not find this page.</Text>
        <Link to="/">Go to Home</Link>
        <pre>{JSON.stringify(params, null, 4)}</pre>
        <Icon name="harness-logo-black" size={200} />
      </Layout.Vertical>
    </Container>
  )
}
