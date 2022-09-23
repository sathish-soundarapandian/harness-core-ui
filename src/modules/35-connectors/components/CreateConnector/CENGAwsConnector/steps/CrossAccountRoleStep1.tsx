/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { uniq } from 'lodash-es'
import cx from 'classnames'
import { Button, Layout, StepProps, CardSelect, Icon, IconName, Container, Text } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { CE_AWS_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import type { CEAwsConnectorDTO } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

export enum Features {
  VISIBILITY = 'VISIBILITY',
  OPTIMIZATION = 'OPTIMIZATION',
  BILLING = 'BILLING'
}

interface CardData {
  icon: IconName
  text: string
  value: Features
  heading: string
  prefix: string
  features: string[]
  footer: React.ReactNode
}

const useSelectedCards = (featuresEnabled: Features[]) => {
  const { getString } = useStrings()
  const FeatureCards = useRef<CardData[]>([
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: Features.BILLING,
      heading: getString('connectors.costVisibility'),
      prefix: getString('common.aws'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.default.feat1'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat2'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat3'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat4'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat5')
      ],
      footer: getString('connectors.ceAws.crossAccountRoleStep1.default.footer')
    },
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: Features.VISIBILITY,
      heading: getString('connectors.ceAws.crossAccountRoleStep1.visible.heading'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.visible.prefix'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat1'),
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat2')
      ],
      footer: (
        <>
          {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
          <a
            href="https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_ecs_and_resource_inventory_management"
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {getString('permissions').toLowerCase()}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleStep1.optimize.footer')}
        </>
      )
    },
    {
      icon: 'nav-settings',
      text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: Features.OPTIMIZATION,
      heading: getString('common.ce.autostopping'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.optimize.prefix'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat1'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
      ],
      footer: (
        <>
          {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
          <a
            href="https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_resource_optimization_using_auto_stopping_rules"
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {getString('permissions').toLowerCase()}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleStep1.optimize.footer')}
        </>
      )
    }
  ]).current

  const [selectedCards, setSelectedCards] = useState<CardData[]>(() => {
    const initialSelectedCards = []
    for (const fe of featuresEnabled) {
      const card = FeatureCards.find(c => c.value === fe)
      if (card) {
        initialSelectedCards.push(card)
      }
    }
    return initialSelectedCards
  })

  return { selectedCards, setSelectedCards, FeatureCards }
}

const CrossAccountRoleStep1: React.FC<StepProps<CEAwsConnectorDTO>> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, previousStep } = props
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []
  const isGovCloudAccount = prevStepData?.spec?.isAWSGovCloudAccount
  const defaultSelectedFeature = isGovCloudAccount ? Features.OPTIMIZATION : Features.BILLING
  const { selectedCards, setSelectedCards, FeatureCards } = useSelectedCards(
    uniq([...featuresEnabled, defaultSelectedFeature]) as Features[]
  )

  useStepLoadTelemetry(CE_AWS_CONNECTOR_CREATION_EVENTS.LOAD_CHOOSE_REQUIREMENTS)

  const handleSubmit = () => {
    const features: Features[] = selectedCards.map(card => card.value)
    const newspec = {
      crossAccountAccess: { crossAccountRoleArn: '' },
      ...prevStepData?.spec,
      featuresEnabled: features
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec

    trackEvent(ConnectorActions.CENGAwsConnectorCrossAccountRoleStep1Submit, {
      category: Category.CONNECTOR
    })

    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  const handleCardSelection = (item: CardData) => {
    if (item.value === defaultSelectedFeature) return
    const sc = [...selectedCards]
    const index = sc.indexOf(item)
    if (index > -1) {
      sc.splice(index, 1)
    } else {
      sc.push(item)
    }

    setSelectedCards(sc)
  }

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.CENGAwsConnectorCrossAccountRoleStep1Load, {
    category: Category.CONNECTOR
  })

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Text
        font={{ variation: FontVariation.H3 }}
        tooltipProps={{ dataTooltipId: 'awsConnectorRequirements' }}
        margin={{ bottom: 'large' }}
      >
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
      </Text>
      <Text color="grey800">{getString('connectors.ceAws.crossAccountRoleStep1.description')}</Text>
      <Container>
        <Layout.Horizontal className={css.infoCard}>
          <Icon name="info-messaging" size={20} className={css.infoIcon} />
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
            {getString('connectors.ceAws.crossAccountRoleStep1.info')}
          </Text>
        </Layout.Horizontal>
        <div style={{ flex: 1 }}>
          <CardSelect
            data={FeatureCards}
            selected={selectedCards}
            multi={true}
            className={css.cards}
            onChange={item => {
              handleCardSelection(item)
            }}
            cornerSelected={true}
            renderItem={item => <Card {...item} isDefault={defaultSelectedFeature === item.value} />}
          />
          <Layout.Horizontal className={css.buttonPanel} spacing="small">
            <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
            <Button
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={handleSubmit}
              disabled={!prevStepData?.includeBilling && selectedCards.length == 0}
            />
          </Layout.Horizontal>
        </div>
      </Container>
    </Layout.Vertical>
  )
}

interface CardProps extends CardData {
  isDefault: boolean
}

const Card = (props: CardProps) => {
  const { prefix, icon, heading, features, footer, isDefault } = props
  return (
    <Container
      className={cx(css.featureCard, {
        [css.defaultCard]: isDefault
      })}
    >
      <Layout.Vertical spacing="medium" padding={{ left: 'large', right: 'large' }}>
        <Layout.Horizontal spacing="small">
          <Icon name={icon} size={32} />
          <Container>
            <Text color="grey900" style={{ fontSize: 9, fontWeight: 500 }}>
              {prefix.toUpperCase()}
            </Text>
            <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
              {heading}
            </Text>
          </Container>
        </Layout.Horizontal>
        <ul className={css.features}>
          {features.map((feat, idx) => {
            return (
              <li key={idx}>
                <Text
                  icon="main-tick"
                  iconProps={{ color: 'green600', size: 12, padding: { right: 'small' } }}
                  font="small"
                  style={{ lineHeight: '20px' }}
                >
                  {feat}
                </Text>
              </li>
            )
          })}
        </ul>
      </Layout.Vertical>
      <Container className={css.footer}>
        <Text font={{ size: 'small', italic: true }} color="grey400">
          {footer}
        </Text>
      </Container>
    </Container>
  )
}

export default CrossAccountRoleStep1
