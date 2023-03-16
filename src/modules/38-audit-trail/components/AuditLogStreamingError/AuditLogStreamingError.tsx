/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { Color } from '@harness/design-system'
import { Container, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './AuditLogStreamingError.module.scss'

interface AuditLogStreamingErrorProps {
  errorMessage: string
}

const AuditLogStreamingError: React.FC<AuditLogStreamingErrorProps> = ({ errorMessage }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      background={Color.RED_100}
      padding={{ top: 'medium', bottom: 'medium', left: 'medium', right: 'medium' }}
      className={cx(css.container, css.shrink)}
    >
      <Container className={css.scroll}>
        <Text font={{ weight: 'bold' }}>
          {getString('error')}: <span>{errorMessage}</span>
        </Text>
      </Container>
    </Layout.Vertical>
  )
}

export default AuditLogStreamingError
