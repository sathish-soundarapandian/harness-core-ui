/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import teamSvg from './images/team.svg'
import jfrogSvg from './images/configure_jfrog.svg'
import css from './ResourcesCard.module.scss'

interface ResourcesCardProps {
  title: JSX.Element
  description?: string
  subTitle?: string
  backgroundImage?: IconName
  descriptionImage?: JSX.Element
  onClick?: () => void
  className?: string
}

const ResourcesCard: React.FC<ResourcesCardProps> = props => {
  const { onClick, className, title, description, backgroundImage, subTitle, descriptionImage } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={cx(css.card, className)} onClick={onClick}>
      {title}
      {description && (
        <Text padding={{ top: 'large' }} font={{ variation: FontVariation.H6 }}>
          {description}
        </Text>
      )}
      {subTitle && (
        <Text color={Color.GREY_500} padding={{ top: 'xsmall' }} font={{ variation: FontVariation.TINY }}>
          {subTitle}
        </Text>
      )}

      {descriptionImage}
      <Layout.Horizontal flex className={css.seeMoreContainer}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_300}>{`${getString('common.seeMore')}`}</Text>
        <Icon margin={{ left: 'medium' }} name="main-chevron-right" size={8} color={Color.GREY_300} />
      </Layout.Horizontal>
      {backgroundImage && <Icon className={css.backgroundImage} name={backgroundImage} size={120} />}
    </Layout.Vertical>
  )
}

const ResourcesCardContainer: React.FC = () => {
  const { getString } = useStrings()

  const getHarnessTitle = (text: string) => {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <Icon name="harness" size={18} />
        <Text font={{ variation: FontVariation.SMALL_BOLD }} padding={{ left: 'xsmall' }}>
          {getString('harness')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} padding={{ left: 'xsmall' }}>
          {text}
        </Text>
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={css.container}>
      <Container className={css.header}>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.CARD_TITLE }}>
          {getString('resources')}
        </Text>
      </Container>
      <Container className={css.body}>
        <ResourcesCard
          backgroundImage="service-slack"
          className={css.slack}
          title={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
              <Icon margin={{ right: 'xsmall' }} name="service-slack" size={18} />
              <Text font={{ variation: FontVariation.H5 }}>{getString('common.slack').toLowerCase()}</Text>
            </Layout.Horizontal>
          }
          description={getString('common.harnessCommunityTitle')}
        />

        <ResourcesCard
          className={css.harnessUniversity}
          title={getHarnessTitle(getString('common.resourceCenter.bottomlayout.university').toLowerCase())}
          description={getString('common.purpose.cd.introductionText')}
          subTitle={getString('common.purpose.cd.introductionConcepts')}
        />

        <ResourcesCard
          className={css.harnessSupport}
          title={getHarnessTitle(getString('common.supportText').toLowerCase())}
          descriptionImage={<img src={teamSvg} className={css.teamImage} />}
          description={getString('common.support.title')}
          subTitle={getString('common.support.subtitle')}
        />
        <ResourcesCard
          className={css.jfrog}
          descriptionImage={<img src={jfrogSvg} className={css.jfrogImage} />}
          title={<Text font={{ variation: FontVariation.H6 }}>{getString('common.configureJfrog')}</Text>}
        />
      </Container>
    </Container>
  )
}

export default ResourcesCardContainer
