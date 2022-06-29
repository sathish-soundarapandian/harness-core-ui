/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, StepProps, MultiTypeInputType, Layout, Text, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'
// import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import AzureWebAppServiceStepOne from './AzureWebAppServiceStepOne'

import type { ConnectorTypes } from '../AzureWebAppServiceListView'
import css from '../../AzureWebAppServiceConfig.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export interface AzureWebAppServiceConfigWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}

interface ManifestWizardStepsProps<T> {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: AzureWebAppServiceConfigWizardInitData
  labels: ConnectorRefLabelType
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  newConnectorSteps?: any
  lastSteps: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  iconsProps: IconProps
  isReadonly: boolean
  handleStoreChange: (store?: T) => void
  connectorTypes: any
}

export function AzureWebAppServiceConfigWizard<T>({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  expressions,
  allowableTypes,
  connectorTypes,
  labels,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  isReadonly
}: ManifestWizardStepsProps<T>): React.ReactElement {
  // const { getString } = useStrings()
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleConnectorViewChange(false)
      handleStoreChange()
    }
  }

  /* istanbul ignore next */
  const handleStoreChangeRef = (arg: ConnectorTypes): void => {
    handleStoreChange?.(arg as unknown as T)
  }
  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="file" className={css.remoteIcon} size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>{'Application Settings Script File'}</Text>
    </Layout.Vertical>
  )

  return (
    <StepWizard className={css.manifestWizard} title={getTitle()} onStepChange={onStepChange}>
      <AzureWebAppServiceStepOne
        name={'Application Settings Script File Source'}
        stepName={labels.firstStepName}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        connectorTypes={connectorTypes}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChangeRef}
        initialValues={initialValues}
      />
      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}
