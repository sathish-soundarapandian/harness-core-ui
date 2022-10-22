/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Layout, Heading, Text, Container } from '@wings-software/uicore'

interface ErrorType {
  errorMessage?: string
  errStatusCode?: number | string
}
export default function GenericErrorHandler({ errorMessage, errStatusCode }: ErrorType): JSX.Element {
  return (
    <Container height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
        <Heading>{errStatusCode || 404}</Heading>
        <Text>{errorMessage || 'Oops, we could not find this page.'}</Text>
        <Link to="/">Go to Home</Link>
        <Icon name="harness-logo-black" size={200} />
      </Layout.Vertical>
    </Container>
  )
}
