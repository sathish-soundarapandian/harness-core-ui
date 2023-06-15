/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { Button, Container, StepWizard } from '@harness/uicore'
import { Dialog } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type { SAMLSettings } from 'services/cd-ng'
import Overview from './steps/Overview'
import SelectProvider from './steps/SelectProvider'
import IdentityProvider from './steps/IdentityProvider'
import AdditionalFunctions from './steps/AdditionalFunctions'
import css from './useSAMLProvider.module.scss'

interface Props {
  onSuccess: () => void
}

interface UseSAMLProviderReturn {
  openSAMlProvider: (_samlProvider?: SAMLSettings) => void
  closeSAMLProvider: () => void
}

export const useSAMLProviderModalV2 = ({ onSuccess }: Props): UseSAMLProviderReturn => {
  const { getString } = useStrings()
  const [samlProvider, setSamlProvider] = React.useState<SAMLSettings>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        style={{
          width: 'auto',
          minWidth: 1175,
          minHeight: 640,
          borderLeft: 0,
          padding: 0,
          position: 'relative',
          overflow: 'auto'
        }}
      >
        <Container className={css.container}>
          {samlProvider ? (
            <StepWizard title={getString('authSettings.SAMLProvider')} stepClassName={css.stepDetailsContainer}>
              <Overview name={getString('overview')} samlSettings={samlProvider} />
              <IdentityProvider name={getString('authSettings.identityProviderLabel')} samlProvider={samlProvider} />
              <AdditionalFunctions
                name={getString('common.advancedSettings')}
                onSubmit={() => {
                  onSuccess()
                  hideModal()
                }}
                samlProvider={samlProvider}
              />
            </StepWizard>
          ) : (
            <StepWizard title={getString('authSettings.SAMLProvider')} stepClassName={css.stepDetailsContainer}>
              <Overview name={getString('overview')} samlSettings={samlProvider} />
              <SelectProvider name={getString('authSettings.selectProvider')} />
              <IdentityProvider name={getString('authSettings.identityProviderLabel')} samlProvider={samlProvider} />
              <AdditionalFunctions
                name={getString('common.advancedSettings')}
                onSubmit={() => {
                  onSuccess()
                  hideModal()
                }}
                samlProvider={samlProvider}
              />
            </StepWizard>
          )}
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [samlProvider]
  )

  const open = (_samlProvider?: SAMLSettings): void => {
    setSamlProvider(_samlProvider)
    showModal()
  }

  return {
    openSAMlProvider: open,
    closeSAMLProvider: hideModal
  }
}
