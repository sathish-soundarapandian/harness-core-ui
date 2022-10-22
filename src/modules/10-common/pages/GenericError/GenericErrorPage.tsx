/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Icon, Layout } from '@harness/uicore'
import { useParams, Link } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

export enum GENERIC_ERROR_CODES {
  INVITE_EXPIRED = 'INVITE_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED'
}
interface GenericErrorPageQueryParams {
  code?: GENERIC_ERROR_CODES
  message?: string
}

interface GenericErrorPageProps {
  code?: GENERIC_ERROR_CODES
  message?: string
}

type ErrorProps = GenericErrorPageQueryParams

const Error: React.FC<ErrorProps> = ({ code, message }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  switch (code) {
    case GENERIC_ERROR_CODES.INVITE_EXPIRED:
      return (
        <>
          <Text>{getString('common.genericErrors.inviteExpired')}</Text>
          <Link to={routes.toMainDashboard({ accountId })}>{getString('goToHome')}</Link>
          <Icon name="harness-logo-black" size={200} />
        </>
      )
    case GENERIC_ERROR_CODES.UNAUTHORIZED:
      return (
        <>
          <Text>{getString('common.genericErrors.unauthorized')}</Text>
          <Icon name="harness-logo-black" size={200} />
        </>
      )
    default:
      return <Container>{message}</Container>
  }
}

const GenericErrorPage: React.FC<GenericErrorPageProps> = (props: GenericErrorPageProps) => {
  let { code, message } = useQueryParams<GenericErrorPageQueryParams>()

  if (!code && !message) {
    code = props.code
    message = props.message
  }

  return (
    <Container height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
        <Error code={code} message={message} />
      </Layout.Vertical>
    </Container>
  )
}

export default GenericErrorPage
