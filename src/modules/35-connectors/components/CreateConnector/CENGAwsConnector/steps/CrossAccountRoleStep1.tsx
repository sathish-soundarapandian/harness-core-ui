/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { uniq } from 'lodash-es'
import { Button, Layout, StepProps, Container, Text, Checkbox } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { String, StringKeys, useStrings } from 'framework/strings'
import { CE_AWS_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import type { CEAwsConnectorDTO } from './OverviewStep'

import VisibilityIcon from '../images/ce-visibility.svg'
import InventoryIcon from '../images/ce-visibility-plus.svg'
import OptimizationIcon from '../images/ce-settings.svg'
import EmptyState from '../images/empty-state.svg'

import css from '../CreateCeAwsConnector.module.scss'

export enum Features {
  VISIBILITY = 'VISIBILITY',
  OPTIMIZATION = 'OPTIMIZATION',
  BILLING = 'BILLING'
}

interface CardData {
  icon: string
  text: string
  value: Features
  heading: string
  desc: StringKeys
  prefix: string
  features: string[]
  footer: StringKeys
}

const useSelectedCards = (featuresEnabled: Features[]) => {
  const { getString } = useStrings()

  const FeatureCards = useRef<CardData[]>([
    {
      icon: VisibilityIcon,
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: Features.BILLING,
      desc: 'connectors.ceAws.crossAccountRoleStep1.cards.costVisibility.header',
      heading: getString('connectors.costVisibility'),
      prefix: getString('common.aws'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.default.feat1'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat2'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat3'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat4'),
        getString('connectors.ceAzure.chooseRequirements.billing.feat5')
      ],
      footer: 'connectors.ceAws.crossAccountRoleStep1.cards.costVisibility.footer'
    },
    {
      icon: InventoryIcon,
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: Features.VISIBILITY,
      desc: 'connectors.ceAws.crossAccountRoleStep1.cards.inventoryManagement.header',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.visible.heading'),
      prefix: getString('common.aws'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat1'),
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat2')
      ],
      footer: 'connectors.ceAws.crossAccountRoleStep1.cards.inventoryManagement.footer'
    },
    {
      icon: OptimizationIcon,
      text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: Features.OPTIMIZATION,
      desc: 'connectors.ceAws.crossAccountRoleStep1.cards.autoStopping.header',
      heading: getString('common.ce.autostopping'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.optimize.prefix'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat1'),
        getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat2'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
      ],
      footer: 'connectors.ceAws.crossAccountRoleStep1.cards.autoStopping.footer'
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
              <Layout.Vertical spacing="medium" style={{ alignItems: 'center' }}>
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
    <Container onMouseEnter={setFeatureDetails}>
      <Checkbox
        checked={isSelected}
        onClick={handleCardSelection}
        className={css.cardCtn}
        disabled={isDefault}
        labelElement={
          <>
            <img src={feature.icon} height={16} />
            <Text inline font={{ variation: FontVariation.SMALL }} margin={{ left: 'xsmall' }}>
              <String stringID={feature.desc} useRichText />
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
        <img src={feature.icon} width={32} />
        <Container>
          <Text color={Color.GREY_900} className={css.featurePrefix}>
            {feature?.prefix}
          </Text>
          <Text color={Color.GREY_900} style={{ fontWeight: 500 }}>
            {feature?.heading}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Container>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} margin={{ bottom: 'xsmall' }}>
          {getString('connectors.ceAws.crossAccountRoleStep1.cards.permissionsInvolved')}
        </Text>
        {feature?.features.map(feat => (
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
          <String stringID={feature?.footer} useRichText />
        </Text>
      </Container>
    </>
  )
}
