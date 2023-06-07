import { Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import css from './ResultTag.module.scss'

interface ResultTagProps {
  content: string | JSX.Element
}

const Tag = ({ content }: ResultTagProps): JSX.Element => (
  <Container
    flex={{ justifyContent: 'left', alignItems: 'center' }}
    background={Color.PRIMARY_1}
    className={css.resultTag}
    margin={{ left: 'small' }}
    padding="small"
  >
    {content}
  </Container>
)

export default Tag
