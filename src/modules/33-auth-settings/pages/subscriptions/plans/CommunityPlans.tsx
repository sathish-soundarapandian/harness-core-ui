/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Card, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { StringKeys, useStrings } from 'framework/strings'
import communityImage from './images/community.svg'
import enterpriseImage from './images/enterprise.svg'
import saasImage from './images/SaaS.svg'
import css from './CommunityPlan.module.scss'
import PlansCss from './Plans.module.scss'
import PlanCss from './Plan.module.scss'

const centerCenter = 'center-center'
const getBulletList = (stringList: string[]): React.ReactElement[] => {
  return stringList.map(item => (
    <li key={item} className={css.li}>
      <Text>{item}</Text>
    </li>
  ))
}

const linkStringKey: StringKeys = 'authSettings.cdCommunityPlan.planLink'

const getVerticalPart = (
  getString: (key: StringKeys, vars?: Record<string, any>) => string,
  title2key: StringKeys,
  linkKey: StringKeys,
  linkText: StringKeys,
  image?: string
): React.ReactElement => (
  <Layout.Vertical flex={{ align: centerCenter }} spacing="large" padding={{ bottom: 'xsmall' }}>
    {image && <img src={image} />}
    <Layout.Vertical padding={{ top: 'large' }} flex={{ align: centerCenter }} spacing="medium">
      <Layout.Horizontal spacing="small">
        <Text color={Color.BLACK} font={{ size: 'medium' }} className={PlanCss.desc}>
          {getString(title2key)}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
    <div className={PlanCss.btnHeight}>
      <Button
        intent="primary"
        onClick={() => {
          window.open(getString(linkKey), '_blank')
        }}
      >
        {getString(linkText)}
      </Button>
    </div>
  </Layout.Vertical>
)

const CommunityPlansCard = (): React.ReactElement => {
  const { getString } = useStrings()

  const communityPlanStrings = [
    getString('authSettings.cdCommunityPlan.communityPlanStrings.item1'),
    getString('authSettings.cdCommunityPlan.communityPlanStrings.item2'),
    getString('authSettings.cdCommunityPlan.communityPlanStrings.item3'),
    getString('authSettings.cdCommunityPlan.communityPlanStrings.item4'),
    getString('authSettings.cdCommunityPlan.communityPlanStrings.item5')
  ]

  return (
    <Card className={cx(css.plan, PlanCss.currentPlan, PlanCss.cdBorder)}>
      <Layout.Vertical flex={{ align: centerCenter }}>
        <span className={cx(PlanCss.currentPlanHeader, PlanCss.cdBgColor)}>
          <Text
            icon="deployment-success-legacy"
            iconProps={{ className: PlanCss.cdFill }}
            color={Color.WHITE}
            flex={{ justifyContent: 'center' }}
          >
            {getString('common.plans.currentPlan')}
          </Text>
        </span>
        <Layout.Vertical
          flex={{ align: centerCenter }}
          spacing="large"
          padding={{ top: 'xxlarge' }}
          className={PlanCss.currentPlanBody}
        >
          <img src={communityImage} />
          <Text font={{ weight: 'semi-bold', size: 'large' }} className={css.titleFont}>
            {getString('authSettings.cdCommunityPlan.communityTitle')}
          </Text>
          <Layout.Vertical padding={{ top: 'large', bottom: 'xxxlarge' }} flex={{ align: centerCenter }}>
            <Text font={{ weight: 'semi-bold', size: 'medium' }} color={Color.BLACK}>
              {getString('authSettings.cdCommunityPlan.communityPrice')}
            </Text>
          </Layout.Vertical>
          <Text
            color={Color.BLACK}
            font={{ size: 'medium' }}
            padding={{ top: 'xxxlarge', bottom: 'small', left: '20px', right: '20px' }}
            className={PlanCss.desc}
          >
            {getString('authSettings.cdCommunityPlan.communityTitle2')}
          </Text>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing="large" padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'medium' }}>
        <ul className={css.ulmargin}>{getBulletList(communityPlanStrings)}</ul>
      </Layout.Vertical>
      <Layout.Vertical
        flex={{ align: centerCenter, justifyContent: 'flex-end' }}
        spacing="large"
        padding={{ top: 'xxlarge' }}
      >
        <Text className={css.communityplanSupport}>
          <a href={getString(linkStringKey)}>{getString('authSettings.cdCommunityPlan.communityLinkText')}</a>
        </Text>
      </Layout.Vertical>
    </Card>
  )
}

const EnterprisePlansCard = (): React.ReactElement => {
  const { getString } = useStrings()

  const enterpriseListStrings = [
    getString('authSettings.cdCommunityPlan.enterprisePlanStrings.item1'),
    getString('authSettings.cdCommunityPlan.enterprisePlanStrings.item2'),
    getString('authSettings.cdCommunityPlan.enterprisePlanStrings.item3'),
    getString('authSettings.cdCommunityPlan.enterprisePlanStrings.item4'),
    getString('authSettings.cdCommunityPlan.enterprisePlanStrings.item5')
  ]
  return (
    <Card className={cx(css.plan, css.normalPlanBorder)}>
      <Layout.Vertical flex={{ align: centerCenter }} padding={{ bottom: 'large' }}>
        <Layout.Vertical
          flex={{ align: centerCenter }}
          spacing="large"
          padding={{ top: 'xxlarge', bottom: 'large' }}
          className={PlanCss.currentPlanBody}
        >
          <img src={enterpriseImage} />
          <Text font={{ weight: 'semi-bold', size: 'large' }} className={css.titleFont}>
            {getString('authSettings.cdCommunityPlan.enterpriseTitle')}
          </Text>
          {getVerticalPart(
            getString,
            'authSettings.cdCommunityPlan.enterpriseTitle2',
            linkStringKey,
            'authSettings.cdCommunityPlan.enterpriseLinkText'
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <div>
        <Text color={Color.BLACK} padding={{ left: 'large' }}>
          {`${getString('authSettings.cdCommunityPlan.enterpriseTitle')}:`}
        </Text>
        <ul className={css.ulmargin}>{getBulletList(enterpriseListStrings)}</ul>
      </div>
    </Card>
  )
}

const SaasPlansCard = (): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Card className={cx(css.plan, css.normalPlanBorder)}>
      <Layout.Vertical flex={{ align: centerCenter }}>
        {getVerticalPart(
          getString,
          'authSettings.cdCommunityPlan.saasTitle2',
          linkStringKey,
          'authSettings.cdCommunityPlan.saasLinkText',
          saasImage
        )}
      </Layout.Vertical>
    </Card>
  )
}

const CommunityPlans = (): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={PlansCss.plans} spacing="large">
      <div className={css.planContainer}>
        <CommunityPlansCard />
        <div className={css.enterpriseSaaSContainer}>
          <EnterprisePlansCard />
          <SaasPlansCard />
        </div>
      </div>

      <a target="_blank" href={getString(linkStringKey)} rel="noreferrer">
        <Text
          color={Color.PRIMARY_6}
          rightIcon="main-share"
          rightIconProps={{ color: Color.PRIMARY_6 }}
          flex={{ align: centerCenter }}
        >
          {getString('authSettings.cdCommunityPlan.harnessLinkText')}
        </Text>
      </a>
    </Layout.Vertical>
  )
}
export default CommunityPlans
