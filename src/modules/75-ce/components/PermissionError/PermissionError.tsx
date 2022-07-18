import React from 'react'
import { Color, Container, FontVariation, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './PermissionError.module.scss'

interface ErrorProps {
  imgSrc: string
  errorMsg: React.ReactElement | string
  errorDesc?: string
  wrapperClassname?: string
}

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

const HandleError: React.FC<ErrorProps> = ({
  imgSrc,
  errorMsg,
  errorDesc,
  wrapperClassname = css.noResultsContainer
}) => {
  const { getString } = useStrings()
  return (
    <Container className={wrapperClassname}>
      <img src={imgSrc} />
      {getErrorNode(errorMsg)}
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
        {errorDesc || getString('ce.permissionError')}
      </Text>
    </Container>
  )
}

export default HandleError
