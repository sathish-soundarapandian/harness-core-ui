/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, PageBody, Text, ModalDialog, Card, Icon, Button, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'

import { String, useStrings } from 'framework/strings'
import QuickK8sIcon from '@ce/images/quick-kubernetes.svg'

import { CloudProviderList } from '../CreateConnector/CreateConnector'

import EmptyStateImage from './images/EmptyState.svg'
import EmptySearchImage from './images/EmptySearch.svg'
import css from './CloudIntegrationTabs.module.scss'

interface NoConnectorsProps {
  handleConnectorCreation: (selectedProvider: string) => void
  k8sSelected: boolean
  setK8sSelected: React.Dispatch<React.SetStateAction<boolean>>
  openAdvancedK8sModal: () => void
  openQuicK8sCreateModal: () => void
}

const NoConnectors: React.FC<NoConnectorsProps> = ({
  handleConnectorCreation,
  k8sSelected,
  setK8sSelected,
  openAdvancedK8sModal,
  openQuicK8sCreateModal
}) => {
  const { getString } = useStrings()

  const [quickCreateSelected, setQuickCreateSelected] = useState(true)

  return (
    <PageBody className={css.emptyStateCtn}>
      <Layout.Vertical spacing={'xxlarge'} style={{ margin: 'auto', alignItems: 'center' }}>
        <img src={EmptyStateImage} width={250} />
        <Text font={{ variation: FontVariation.BODY, align: 'center' }}>
          <String stringID="ce.cloudIntegration.emptyStateDesc" useRichText />
        </Text>
        <Text font={{ variation: FontVariation.H4, align: 'center' }} margin={{ top: 'large' }}>
          {getString('ce.cloudIntegration.createConnector')}
        </Text>
        <div className={css.cloudProviderList}>
          <CloudProviderList onChange={handleConnectorCreation} iconSize={30} />
        </div>
      </Layout.Vertical>
      <ModalDialog
        isOpen={k8sSelected}
        onClose={() => {
          setK8sSelected(false)
        }}
        title={getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
        enforceFocus={false}
        className={css.modalContainer}
      >
        <Container
          margin={{
            left: 'large'
          }}
        >
          <div className={css.k8SCardContainer}>
            <Card
              onClick={() => {
                setQuickCreateSelected(true)
              }}
              interactive
              className={cx(css.card, { [css.selected]: quickCreateSelected })}
            >
              <img src={QuickK8sIcon} width={56} />
              <Text className={css.recommended} color={Color.PRIMARY_7}>
                {getString('common.recommended')}
              </Text>
            </Card>
            <Card
              onClick={() => {
                setQuickCreateSelected(false)
              }}
              interactive
              className={cx(css.card, { [css.selected]: !quickCreateSelected })}
            >
              <Icon name={'app-kubernetes'} size={56} />
            </Card>
          </div>
          <div className={css.k8SCardLabel}>
            <div>
              <Text font={{ weight: 'semi-bold', variation: FontVariation.H6 }} color={Color.GREY_700}>
                {getString('ce.k8sQuickCreate.quickCreate')}
              </Text>
              <Text margin={{ top: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL }}>
                {getString('ce.k8sQuickCreate.time.5mins')}
              </Text>
            </div>
            <div>
              <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} color={Color.GREY_700}>
                {getString('ce.k8sQuickCreate.advanced')}
              </Text>
              <Text margin={{ top: 'small' }} font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
                {getString('ce.k8sQuickCreate.time.10mins')}
              </Text>
            </div>
          </div>
          <Container
            margin={{
              top: 'xlarge'
            }}
            className={css.continueButton}
          >
            <Button
              text={getString('continue')}
              intent="primary"
              onClick={() => {
                quickCreateSelected ? openQuicK8sCreateModal() : openAdvancedK8sModal()
              }}
            />
          </Container>
        </Container>
      </ModalDialog>
    </PageBody>
  )
}

export default NoConnectors

export const EmptySearchState: React.FC = () => {
  const { getString } = useStrings()
  return (
    <PageBody className={cx(css.emptyStateCtn, css.emptySearch)}>
      <Layout.Vertical style={{ margin: 'auto', alignItems: 'center' }}>
        <img src={EmptySearchImage} width={250} />
        <Text font={{ variation: FontVariation.BODY, align: 'center' }}>
          {getString('ce.cloudIntegration.noSearchResults')}
        </Text>
      </Layout.Vertical>
    </PageBody>
  )
}
