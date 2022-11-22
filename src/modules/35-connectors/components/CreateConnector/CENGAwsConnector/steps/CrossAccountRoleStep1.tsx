/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { uniq } from 'lodash-es'
import { Button, Layout, StepProps, Container, Text, Checkbox, IconName, Icon } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { CE_AWS_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'

import type { CEAwsConnectorDTO } from './OverviewStep'
import EmptyState from '../images/empty-state.svg'

import css from '../CreateCeAwsConnector.module.scss'

export enum Features {
  VISIBILITY = 'VISIBILITY',
  OPTIMIZATION = 'OPTIMIZATION',
  BILLING = 'BILLING',
  GOVERNANCE = 'GOVERNANCE'
}

interface CardData {
  icon: IconName
  text: string
  value: Features
  heading: string
  desc: React.ReactNode
  prefix: string
  features: string[]
  footer: React.ReactNode
}

const useSelectedCards = (featuresEnabled: Features[]) => {
  const { getString } = useStrings()

  const FeatureCards = useMemo(() => {
    const cards = [
      {
        icon: 'ce-visibility',
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.BILLING,
        desc: <Text font={{ variation: FontVariation.SMALL_BOLD }}>{getString('connectors.costVisibility')}</Text>,
        heading: getString('connectors.costVisibility'),
        prefix: getString('common.aws'),
        features: [
          getString('connectors.ceAws.crossAccountRoleStep1.default.feat1'),
          getString('connectors.ceAzure.chooseRequirements.billing.feat2'),
          getString('connectors.ceAzure.chooseRequirements.billing.feat3'),
          getString('connectors.ceAzure.chooseRequirements.billing.feat4'),
          getString('connectors.ceAzure.chooseRequirements.billing.feat5')
        ],
        footer: (
          <>
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
              {getString('common.default')}
            </Text>{' '}
            {getString('connectors.ceAws.crossAccountRoleStep1.cards.costVisibility.footer2')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
              {getString('connectors.ceAws.crossAccountRoleStep1.cards.costVisibility.footer3')}
            </Text>
          </>
        )
      },
      {
        icon: 'ce-visibility-plus',
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.VISIBILITY,
        desc: (
          <>
            {getString('common.resourceLabel')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('connectors.ceAzure.chooseRequirements.visibility.heading')}
            </Text>
          </>
        ),
        heading: getString('connectors.ceAws.crossAccountRoleStep1.visible.heading'),
        prefix: getString('common.aws'),
        features: [
          getString('connectors.ceAws.crossAccountRoleStep1.visible.feat1'),
          getString('connectors.ceAws.crossAccountRoleStep1.visible.feat2')
        ],
        footer: (
          <>
            {getString('connectors.ceAws.crossAccountRoleStep1.adding')}{' '}
            <a
              href="https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_ecs_and_resource_inventory_management"
              target="_blank"
              rel="noreferrer"
            >
              {getString('connectors.ceAws.crossAccountRoleStep1.thesePermissions')}
            </a>{' '}
            {getString('connectors.ceAws.crossAccountRoleStep1.iamRole')}
          </>
        )
      },
      {
        icon: 'nav-settings',
        text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
        value: Features.OPTIMIZATION,
        desc: (
          <>
            {getString('connectors.ceAws.crossAccountRoleStep1.cards.autoStopping.prefix')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('common.ce.autostopping')}
            </Text>
          </>
        ),
        heading: getString('common.ce.autostopping'),
        prefix: getString('connectors.ceAws.crossAccountRoleStep1.optimize.prefix'),
        features: [
          getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat1'),
          getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat2'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
        ],
        footer: (
          <>
            {getString('connectors.ceAws.crossAccountRoleStep1.adding')}{' '}
            <a
              href="https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_resource_optimization_using_auto_stopping_rules"
              target="_blank"
              rel="noreferrer"
            >
              {getString('connectors.ceAws.crossAccountRoleStep1.thesePermissions')}
            </a>{' '}
            {getString('connectors.ceAws.crossAccountRoleStep1.iamRole')}
          </>
        )
      },
      {
        icon: 'nav-settings',
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.GOVERNANCE,
        desc: (
          <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
            {getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.header')}
          </Text>
        ),
        heading: getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.header'),
        prefix: getString('common.aws'),
        features: [
          getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.feat1'),
          getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.feat2')
        ],
        footer: (
          <>
            {getString('connectors.ceAws.crossAccountRoleStep1.adding')}{' '}
            <a
              href="https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws"
              target="_blank"
              rel="noreferrer"
            >
              {getString('connectors.ceAws.crossAccountRoleStep1.thesePermissions')}
            </a>{' '}
            {getString('connectors.ceAws.crossAccountRoleStep1.iamRole')}
          </>
        )
      }
    ]

    return cards as CardData[]
  }, [])

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

  const [featureDetails, setFeatureDetails] = useState<CardData>()

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Text
        font={{ variation: FontVariation.H4 }}
        tooltipProps={{ dataTooltipId: 'awsConnectorRequirements' }}
        margin={{ bottom: 'large' }}
      >
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
      </Text>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }}>
        {getString('connectors.ceAws.crossAccountRoleStep1.description')}
      </Text>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }} padding={{ top: 'small' }}>
        {getString('connectors.ceAws.crossAccountRoleStep1.info')}
      </Text>
      <Container>
        <Layout.Horizontal margin={{ top: 'large' }}>
          <Container padding={{ top: 'small' }}>
            {FeatureCards.map(card => (
              <FeatureCard
                key={card.value}
                feature={card}
                handleCardSelection={() => handleCardSelection(card)}
                isDefault={defaultSelectedFeature === card.value}
                isSelected={selectedCards.some(selectedCard => selectedCard.value === card.value)}
                setFeatureDetails={() => setFeatureDetails(card)}
              />
            ))}
          </Container>
          <Layout.Vertical spacing="xlarge" className={css.featureDetailsCtn}>
            {featureDetails ? (
              <FeatureDetails feature={featureDetails} />
            ) : (
              <Layout.Vertical spacing="medium" className={css.emptyState}>
                <img src={EmptyState} width={110} />
                <Text font={{ variation: FontVariation.TINY, align: 'center' }} width={100}>
                  {getString('connectors.ceAws.crossAccountRoleStep1.hoverOver')}
                </Text>
              </Layout.Vertical>
            )}
          </Layout.Vertical>
        </Layout.Horizontal>
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
      </Container>
    </Layout.Vertical>
  )
}

export default CrossAccountRoleStep1

const FeatureCard: React.FC<{
  feature: CardData
  isSelected: boolean
  isDefault: boolean
  setFeatureDetails: () => void
  handleCardSelection: () => void
}> = ({ feature, isDefault, isSelected, setFeatureDetails, handleCardSelection }) => {
  return (
    <Container onMouseOver={setFeatureDetails}>
      <Checkbox
        checked={isSelected}
        onClick={handleCardSelection}
        className={css.cardCtn}
        disabled={isDefault}
        labelElement={
          <>
            <Icon name={feature.icon} size={16} />
            <Text inline font={{ variation: FontVariation.SMALL }} margin={{ left: 'xsmall' }}>
              {feature.desc}
            </Text>
          </>
        }
      />
    </Container>
  )
}

const FeatureDetails: React.FC<{ feature: CardData }> = ({ feature }) => {
  const { getString } = useStrings()

  return (
    <>
      <Layout.Horizontal spacing={'xsmall'} style={{ alignItems: 'center' }}>
        <Icon name={feature.icon} size={32} />
        <Container>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.TINY_SEMI }}>
            {feature.prefix}
          </Text>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }}>
            {feature.heading}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Container>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} margin={{ bottom: 'xsmall' }}>
          {getString('connectors.ceAws.crossAccountRoleStep1.cards.permissionsInvolved')}
        </Text>
        {feature.features.map(feat => (
          <Text
            key={feat}
            font={{ variation: FontVariation.SMALL }}
            color={Color.GREY_600}
            icon="tick"
            iconProps={{ size: 12, color: Color.GREEN_700, margin: { right: 'small' } }}
          >
            {feat}
          </Text>
        ))}
      </Container>
      <Container>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} margin={{ bottom: 'xsmall' }}>
          {getString('connectors.ceAws.crossAccountRoleStep1.cards.providedBy')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {feature.footer}
        </Text>
      </Container>
    </>
  )
}
