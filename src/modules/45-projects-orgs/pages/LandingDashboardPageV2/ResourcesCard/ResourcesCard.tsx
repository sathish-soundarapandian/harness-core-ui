import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import React from 'react'
import slackImage from './images/slack_resource_card.png'
import harness_university from './images/harness_university.png'
import harness_support from './images/harness_support.png'
import artifactory_resource from './images/artifactory_resource.png'
import css from './ResourcesCard.module.scss'

const ResourcesCard = () => {
  return (
    <Layout.Vertical className={css.container}>
      <Container className={css.header}>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.CARD_TITLE }}>
          Resources
        </Text>
      </Container>
      <Container className={css.body}>
        <img src={slackImage} />
        <img src={harness_university} />
        <img src={harness_support} />
        <img src={artifactory_resource} />
      </Container>
    </Layout.Vertical>
  )
}

export default ResourcesCard
