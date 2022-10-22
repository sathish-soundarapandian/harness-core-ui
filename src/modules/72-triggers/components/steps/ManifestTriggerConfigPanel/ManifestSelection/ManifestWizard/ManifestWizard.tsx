/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, StepWizard, StepProps, AllowedTypes } from '@wings-software/uicore'
import type { IconProps } from '@harness/icons'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ManifestStepInitData, ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import ManifestStore from '../ManifestWizardSteps/ManifestStore'
import type { ManifestTriggerSourceSpec } from '../ManifestInterface'
import css from './ManifestWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

interface ManifestWizardStepsProps {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: ManifestTriggerSourceSpec
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  newConnectorSteps?: any
  lastStep: React.ReactElement<StepProps<ConnectorConfigDTO>>
  iconsProps: IconProps
  isReadonly: boolean
  handleStoreChange: (store?: ManifestStores) => void
  manifestStores: ManifestStores[]
}

export function ManifestWizard({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  expressions,
  allowableTypes,
  manifestStores,
  newConnectorView,
  newConnectorSteps,
  lastStep,
  iconsProps,
  isReadonly
}: ManifestWizardStepsProps): React.ReactElement {
  const { getString } = useStrings()
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleConnectorViewChange(false)
      handleStoreChange()
    }
  }

  /* istanbul ignore next */
  const handleStoreChangeRef = (arg: ManifestStores): void => {
    handleStoreChange?.(arg)
  }

  const renderSubtitle = (): JSX.Element => {
    return (
      <div className={css.subtitle} style={{ display: 'flex' }}>
        <Icon {...iconsProps} size={26} />
        <Text
          style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)', wordBreak: 'normal' }}
          color={Color.WHITE}
        >
          {getString('pipeline.manifestTypeLabels.HelmChartLabel')}
        </Text>
      </div>
    )
  }

  const getManifestStoreInitialValue = (): ManifestStepInitData => {
    const { type, spec } = initialValues
    const { store } = spec

    return {
      connectorRef: store?.spec?.connectorRef,
      store: store?.type as string,
      selectedManifest: type
    }
  }

  return (
    <StepWizard className={css.manifestWizard} subtitle={renderSubtitle()} onStepChange={onStepChange}>
      <ManifestStore
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        manifestStores={manifestStores}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChangeRef}
        initialValues={getManifestStoreInitialValue()}
      />
      {newConnectorView && newConnectorSteps}

      {lastStep}
    </StepWizard>
  )
}
