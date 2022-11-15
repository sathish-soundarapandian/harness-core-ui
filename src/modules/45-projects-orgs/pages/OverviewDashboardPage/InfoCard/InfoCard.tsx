import { Container, Layout } from '@harness/uicore'
import React from 'react'
import css from './InfoCard.module.scss'

const InfoCard = () => {
  return (
    <Layout.Vertical margin={{ bottom: 'medium' }} className={css.container} background="white">
      <Container>Header</Container>
      <Container>Body</Container>
    </Layout.Vertical>
  )
}

export default InfoCard
