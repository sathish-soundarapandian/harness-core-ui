/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, FontVariation, Text } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './PermissionError.module.scss'

interface ErrorProps {
  imgSrc: string
  errorMsg: React.ReactElement | string | undefined
  errorDesc?: string
  wrapperClassname?: string
}

/* istanbul ignore next */
const getErrorNode = (message: React.ReactNode): React.ReactNode => {
  if (typeof message === 'string') {
    return (
      <Text
        font={{ variation: FontVariation.BODY2_SEMI }}
        color={Color.GREY_1000}
        style={{ marginTop: 'var(--spacing-xlarge)' }}
      >
        {message}
      </Text>
    )
  }
  return message
}

const HandleError: React.FC<ErrorProps> = ({ imgSrc, errorMsg, errorDesc, wrapperClassname }) => {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.noResultsContainer, wrapperClassname)}>
      <img src={imgSrc} />
      {getErrorNode(errorMsg)}
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
        {errorDesc || getString('ce.permissionError')}
      </Text>
    </Container>
  )
}

export default HandleError
