/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Button,
  Formik,
  FormikForm,
  Layout,
  ModalErrorHandler,
  StepProps,
  IconName,
  Text,
  Container
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { CEAzureConnector } from 'services/ce'
import { CE_AZURE_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import {
  FeatureCard,
  FeatureDetails,
  Features
} from '@connectors/components/CreateConnector/CENGAwsConnector/steps/CrossAccountRoleStep1'
import EmptyState from '@connectors/components/CreateConnector/CENGAwsConnector/images/empty-state.svg'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { CEAzureDTO } from '../Overview/AzureConnectorOverview'
import css from '../../CreateCeAzureConnector_new.module.scss'

interface CloudFeatures {
  VISIBILITY: boolean
  OPTIMIZATION: boolean
}

interface ICard {
  icon: IconName
  text: string
  value: Features
  heading: string
  desc: React.ReactNode
  prefix: string
  features: string[]
  footer: React.ReactNode
}

const useSelectedCards = (featuresEnabled: ICard['value'][]) => {
  const { getString } = useStrings()
  const isGovernanceEnabled = useFeatureFlag(FeatureFlag.CCM_ENABLE_CLOUD_ASSET_GOVERNANCE_UI)

  const FeatureCards = useMemo(() => {
    const cards = [
      {
        prefix: getString('common.azure'),
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        heading: getString('connectors.costVisibility'),
        desc: <Text font={{ variation: FontVariation.SMALL_BOLD }}>{getString('connectors.costVisibility')}</Text>,
        value: Features.BILLING,
        icon: 'ce-visibility',
        features: [
          getString('connectors.ceAzure.chooseRequirements.billing.feat1'),
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
            {getString('connectors.ceAzure.chooseRequirements.billing.footer')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
              {getString('connectors.ceAws.crossAccountRoleStep1.cards.costVisibility.footer3')}
            </Text>
          </>
        )
      },
      {
        prefix: getString('common.azure'),
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        heading: getString('connectors.ceAws.crossAccountRoleStep1.visible.heading'),
        desc: (
          <>
            {getString('common.resourceLabel')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('connectors.ceAzure.chooseRequirements.visibility.heading')}
            </Text>
          </>
        ),
        value: Features.VISIBILITY,
        icon: 'ce-visibility',
        features: [
          getString('connectors.ceAzure.chooseRequirements.visibility.feat1'),
          getString('connectors.ceAzure.chooseRequirements.visibility.feat2')
        ],
        footer: (
          <>
            {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
            <a
              href="https://docs.harness.io/article/v682mz6qfd-set-up-cost-visibility-for-azure#step_4_create_service_principal_and_assign_permissions"
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {getString('permissions').toLowerCase()}
            </a>{' '}
            {getString('connectors.ceAzure.chooseRequirements.optimization.footer2')}
          </>
        )
      },
      {
        prefix: getString('connectors.ceAzure.chooseRequirements.optimization.prefix'),
        text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
        heading: getString('common.ce.autostopping'),
        desc: (
          <>
            {getString('connectors.ceAws.crossAccountRoleStep1.cards.autoStopping.prefix')}{' '}
            <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
              {getString('common.ce.autostopping')}
            </Text>
          </>
        ),
        value: Features.OPTIMIZATION,
        icon: 'nav-settings',
        features: [
          getString('connectors.ceAzure.chooseRequirements.optimization.feat1'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
          getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
        ],
        footer: (
          <>
            {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
            <a
              href="https://docs.harness.io/article/v682mz6qfd-set-up-cost-visibility-for-azure#step_4_create_service_principal_and_assign_permissions"
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {getString('connectors.ceAws.crossAccountRoleStep1.thesePermissions')}
            </a>{' '}
            {getString('connectors.ceAzure.chooseRequirements.optimization.footer2')}
          </>
        )
      }
    ]

    if (isGovernanceEnabled) {
      cards.push({
        icon: 'nav-settings',
        text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
        value: Features.GOVERNANCE,
        desc: (
          <Text inline font={{ variation: FontVariation.SMALL_BOLD }}>
            {getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.header')}
          </Text>
        ),
        heading: getString('connectors.ceAws.crossAccountRoleStep1.cards.governance.header'),
        prefix: getString('common.azure'),
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
      })
    }

    return cards as ICard[]
  }, [isGovernanceEnabled])

  const [selectedCards, setSelectedCards] = useState<ICard[]>(() => {
    const initialSelectedCards = [FeatureCards[0]]
    for (const fe of featuresEnabled) {
      const card = FeatureCards.find(c => c.value === fe)
      // BILLING is selected by default and added above already
      if (card && card.value !== 'BILLING') {
        initialSelectedCards.push(card)
      }
    }
    return initialSelectedCards
  })

  return { selectedCards, setSelectedCards, FeatureCards }
}

const ChooseRequirements: React.FC<StepProps<CEAzureDTO>> = props => {
  const { getString } = useStrings()
  const { previousStep, prevStepData, nextStep } = props
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []
  const { selectedCards, setSelectedCards, FeatureCards } = useSelectedCards(featuresEnabled as Features[])
  const [featuresSelectedError, setFeaturesSelectedError] = useState(
    !prevStepData?.hasBilling && selectedCards.length === 1
  )

  const [featureDetails, setFeatureDetails] = useState<ICard>()

  useStepLoadTelemetry(CE_AZURE_CONNECTOR_CREATION_EVENTS.LOAD_CHOOSE_REQUIREMENT)

  const handleSubmit = () => {
    trackEvent(ConnectorActions.ChooseRequirementsSubmit, {
      category: Category.CONNECTOR,
      connector_type: Connectors.CEAzure
    })

    let features = selectedCards.map(c => c.value)

    if (!prevStepData?.hasBilling) {
      features = features.filter(item => item !== 'BILLING')
    }

    const nextStepData: CEAzureDTO = {
      ...((prevStepData || {}) as CEAzureDTO),
      spec: {
        ...((prevStepData?.spec || {}) as CEAzureConnector),
        featuresEnabled: features
      }
    }

    nextStep?.(nextStepData)
  }

  const handleCardSelection = (item: ICard) => {
    // BILLING is provided by default, and user cannot un-select it
    if (item.value === 'BILLING') return

    const sc = [...selectedCards]
    const index = sc.indexOf(item)
    if (index > -1) {
      sc.splice(index, 1)
    } else {
      sc.push(item)
    }

    setFeaturesSelectedError(!prevStepData?.hasBilling && sc.length === 1)
    setSelectedCards(sc)
  }

  const { trackEvent } = useTelemetry()
  useTrackEvent(ConnectorActions.ChooseRequirementsLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.CEAzure
  })

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Text
        font={{ variation: FontVariation.H3 }}
        tooltipProps={{ dataTooltipId: 'azureChooseRequirements' }}
        margin={{ bottom: 'large' }}
      >
        {getString('connectors.ceAzure.chooseRequirements.heading')}
      </Text>
      <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800}>
        {getString('connectors.ceAzure.chooseRequirements.featureDesc')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} padding={{ top: 'small' }}>
        {getString('connectors.ceAzure.chooseRequirements.info')}
      </Text>
      <Container>
        <Formik<CloudFeatures>
          initialValues={{
            VISIBILITY: false,
            OPTIMIZATION: false
          }}
          formName="CloudFeaturesSelectionForm"
          onSubmit={handleSubmit}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler
                bind={() => {
                  return
                }}
              />
              <Layout.Horizontal margin={{ top: 'large' }}>
                <Container padding={{ top: 'small' }}>
                  {FeatureCards.map(card => (
                    <FeatureCard
                      key={card.value}
                      feature={card}
                      handleCardSelection={() => handleCardSelection(card)}
                      isDefault={Features.BILLING === card.value}
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
                      <Text
                        font={{ variation: FontVariation.TINY, align: 'center' }}
                        width={100}
                        color={Color.GREY_600}
                      >
                        {getString('connectors.ceAws.crossAccountRoleStep1.hoverOver')}
                      </Text>
                    </Layout.Vertical>
                  )}
                </Layout.Vertical>
              </Layout.Horizontal>
              {featuresSelectedError ? (
                <Text color={Color.RED_600} padding={{ top: 'medium' }}>
                  {getString('connectors.ceAzure.chooseRequirements.atleastOneError')}
                </Text>
              ) : null}
              <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
                <Button text={getString('previous')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={featuresSelectedError}>
                  {getString('continue')}
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default ChooseRequirements
