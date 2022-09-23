/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Icon, Text, Button, ButtonVariation, Color, ButtonSize } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ProvisioningStatus } from './Constants'

interface ProvisioningStatusProps {
  provisioningStatus?: ProvisioningStatus
  onStartProvisioning: () => void
  showProvisioningStatus?: boolean
}

import css from './InfraProvisioningWizard.module.scss'

export const ProvisioningStatusPill: React.FC<ProvisioningStatusProps> = props => {
  const { provisioningStatus, onStartProvisioning, showProvisioningStatus = true } = props
  const { getString } = useStrings()
  switch (provisioningStatus) {
    case ProvisioningStatus.FAILURE:
      return showProvisioningStatus ? (
        <Layout.Vertical padding={{ top: 'large' }}>
          <Layout.Horizontal
            className={css.provisioningFailed}
            flex
            padding={{ left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }}
            spacing="xsmall"
          >
            <Icon name="danger-icon" size={24} />
            <Text font={{ weight: 'semi-bold' }} color={Color.RED_600}>
              {getString('ci.getStartedWithCI.provisioningFailed')}
            </Text>
          </Layout.Horizontal>
          {/* Hiding till feature readiness */}
          {/* <Button
            variation={ButtonVariation.LINK}
            icon="contact-support"
            text={getString('common.contactSupport')}
            disabled={true}
            minimal
          /> */}
        </Layout.Vertical>
      ) : null
    case ProvisioningStatus.SUCCESS:
      return showProvisioningStatus ? (
        <Layout.Horizontal
          className={css.provisioningSuccessful}
          flex={{ justifyContent: 'flex-start' }}
          padding={{ left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }}
          spacing="xsmall"
        >
          <Icon name="success-tick" size={24} />
          <Text font={{ weight: 'semi-bold' }} color={Color.GREEN_800}>
            {getString('ci.successful')}
          </Text>
        </Layout.Horizontal>
      ) : null
    case ProvisioningStatus.TO_DO:
      return (
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('ci.getStartedWithCI.startProvisioning')}
          size={ButtonSize.SMALL}
          onClick={onStartProvisioning}
        />
      )
    default:
      return <></>
  }
}
