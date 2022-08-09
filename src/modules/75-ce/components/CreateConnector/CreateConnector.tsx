/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Dialog, IconName, IDialogProps } from '@blueprintjs/core'
import { Button, CardSelect, Carousel, Container, Heading, Icon, Layout, Text } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_NAMES } from '@ce/TrackingEventsConstants'
import { CE_CONNECTOR_CLICK } from '@connectors/trackingConstants'
import AutoStoppingImage from './images/autoStopping.svg'
import BudgetsImage from './images/budgets-anomalies.svg'
import PerspectiveImage from './images/Perspectives.svg'
import bgImage from './images/perspectiveBg.png'
import NoData from '../OverviewPage/OverviewNoData'
import css from './CreateConnector.module.scss'

// interface useCreateConnectorProps {}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    position: 'relative',
    height: 500
  }
}

interface CloudProviderListProps {
  onChange?: (selectedProvider: string) => void
  selected?: string
}

export interface UseCreateConnectorProps {
  portalClassName?: string
  onSuccess?: () => void
  onClose?: () => void
}

const CloudProviderList: React.FC<CloudProviderListProps> = ({ onChange, selected }) => {
  const providers = [
    {
      icon: 'service-aws',
      title: 'AWS'
    },
    {
      icon: 'gcp',
      title: 'GCP'
    },
    {
      icon: 'service-azure',
      title: 'Azure'
    },
    {
      icon: 'service-kubernetes',
      title: 'Kubernetes'
    }
  ]
  return (
    <div className={css.cloudProviderListContainer}>
      <CardSelect
        data={providers}
        cornerSelected={true}
        renderItem={item => (
          <div>
            <Icon name={item.icon as IconName} size={26} />
          </div>
        )}
        onChange={value => onChange?.(value.title)}
        selected={providers.find(_p => _p.title === selected)}
        className={css.listContainer}
      ></CardSelect>
      <div className={css.textList}>
        {providers.map(provider => (
          <Text key={provider.title}>{provider.title}</Text>
        ))}
      </div>
    </div>
  )
}

interface NoConnectorDataProps {
  showConnectorModal?: boolean
}

export const NoConnectorDataHandling: (props: NoConnectorDataProps) => JSX.Element = ({ showConnectorModal }) => {
  const { openModal, closeModal } = useCreateConnectorMinimal({
    portalClassName: css.excludeSideNavOverlay,
    onSuccess: () => {
      closeModal()
    }
  })

  const [showNoDataOverlay, setShowNoDataOverlay] = useState(!showConnectorModal)

  useEffect(() => {
    showConnectorModal && openModal()
  }, [])

  const handleConnectorClick = (): void => {
    setShowNoDataOverlay(false)
    openModal()
  }

  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}>
      {showNoDataOverlay && <NoData onConnectorCreateClick={handleConnectorClick} />}
    </div>
  )
}

export const useCreateConnectorMinimal = (props: UseCreateConnectorProps) => {
  const { portalClassName, onSuccess } = props
  const { trackEvent } = useTelemetry()
  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: () => {
      onSuccess?.()
    }
  })

  const handleConnectorCreation = (selectedProvider: string) => {
    let connectorType
    switch (selectedProvider) {
      case 'AWS':
        connectorType = Connectors.CEAWS
        break
      case 'GCP':
        connectorType = Connectors.CE_GCP
        break
      case 'Azure':
        connectorType = Connectors.CE_AZURE
        break
      case 'Kubernetes':
        connectorType = Connectors.CE_KUBERNETES
        break
    }

    if (connectorType) {
      trackEvent(CE_CONNECTOR_CLICK, {
        connectorType: connectorType,
        page: PAGE_NAMES.NO_CONNECTOR_MODAL
      })
      openConnectorModal(false, connectorType, {
        connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
      })
    }
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        style={{ width: 450, padding: 40 }}
        enforceFocus={false}
        {...(portalClassName && { portalClassName, usePortal: true })}
      >
        <Text color={Color.GREY_700} font={{ weight: 'bold', size: 'normal' }} style={{ marginBottom: 10 }}>
          You have not added any connectors yet.
        </Text>
        <Text color={Color.GREY_700} font={{ weight: 'bold', size: 'normal' }} style={{ marginBottom: 20 }}>
          Create one to plug in your data and start exploring Cloud cost Management and everything it has to offer!
        </Text>
        <Text font={{ size: 'normal' }} style={{ marginBottom: 10 }}>
          Choose your cloud Provider
        </Text>
        <CloudProviderList onChange={handleConnectorCreation} />
      </Dialog>
    )
  }, [])

  return { openModal: showModal, closeModal: hideModal }
}

const FeaturesCarousel = () => {
  const data = useMemo(
    () => [
      {
        title: 'Create Cost perspectives',
        description:
          'Create visualisations of relevant data to specific teams, groups, departments, BUs, LOBs cost-centers etc. This provides relevant data to specific teams for decentralized cost management.',
        ctaLink: '',
        imgSrc: PerspectiveImage
      },
      {
        title: 'Set Budgets and receive Alerts on anomalies and overspend',
        description:
          'Once a perspective is created you can schedule <b>reports</b>, create budgets, configure <b>anomaly alerts</b>, get <b>recommendations</b> to improve save costs for a decentralised cost management.',
        ctaLink: '',
        imgSrc: BudgetsImage
      },
      {
        title: 'Create AutoStopping rules',
        description:
          'AutoStopping Rules dynamically make sure that your non-production workloads are running (and costing you) only when you’re using them, and never when they are idle.',
        ctaLink: '',
        imgSrc: AutoStoppingImage
      }
    ],
    []
  )

  const [activeSlide, setActiveSlide] = useState<number>(1)

  useEffect(() => {
    const id = setTimeout(() => {
      setActiveSlide(prevActiveSlide => (prevActiveSlide === data.length ? 1 : prevActiveSlide + 1))
    }, 20000)
    return () => {
      clearTimeout(id)
    }
  }, [activeSlide])

  return (
    <Carousel defaultSlide={activeSlide} onChange={setActiveSlide} className={css.featuresCarousel}>
      {data.map(item => {
        return (
          <div key={item.title} className={css.featureSlide}>
            <div className={css.title}>{item.title}</div>
            <div className={css.imgContainer}>
              <img src={item.imgSrc} alt={item.title} />
            </div>
            <p dangerouslySetInnerHTML={{ __html: item.description }} />
          </div>
        )
      })}
    </Carousel>
  )
}

const useCreateConnector = (props: UseCreateConnectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>()
  const { trackEvent } = useTelemetry()

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: () => {
      props?.onSuccess?.()
    },
    onClose: () => {
      props?.onClose?.()
    }
  })

  const handleConnectorCreation = () => {
    let connectorType
    switch (selectedProvider) {
      case 'AWS':
        connectorType = Connectors.CEAWS
        break
      case 'GCP':
        connectorType = Connectors.CE_GCP
        break
      case 'Azure':
        connectorType = Connectors.CE_AZURE
        break
      case 'Kubernetes':
        connectorType = Connectors.CE_KUBERNETES
        break
    }

    if (connectorType) {
      trackEvent(CE_CONNECTOR_CLICK, {
        connectorType: connectorType,
        page: PAGE_NAMES.START_TRIAL_MODAL
      })

      openConnectorModal(false, connectorType, {
        connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
      })
    }
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps} className={css.createConnectorDialog}>
        <Layout.Horizontal style={{ height: '100%' }}>
          <Container className={css.connectorsSection}>
            <Heading>{'Welcome!'}</Heading>
            <Text>Let’s get you started with Cloud Cost Management</Text>
            <Text>
              To begin with, you need to create a Connector that will pull in data from your Cloud provider into CCM
            </Text>
            <section style={{ paddingTop: 15 }}>
              <Text className={css.selectProviderLabel}>Select your Cloud provider</Text>
              <CloudProviderList onChange={setSelectedProvider} selected={selectedProvider} />
            </section>
            <Button
              text={'Next'}
              disabled={!selectedProvider}
              intent="primary"
              onClick={handleConnectorCreation}
              className={css.nextButton}
            />
          </Container>
          <Container className={css.carouselSection}>
            <FeaturesCarousel />
          </Container>
        </Layout.Horizontal>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props?.onClose?.()
            hideModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, [selectedProvider])

  return {
    openModal: showModal
  }
}

export default useCreateConnector
