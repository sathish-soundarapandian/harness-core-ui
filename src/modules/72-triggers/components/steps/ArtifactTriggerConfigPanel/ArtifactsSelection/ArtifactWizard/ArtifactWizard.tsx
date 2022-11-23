/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, Icon } from '@harness/uicore'
import type { IconProps } from '@harness/icons'
import { String, StringKeys, useStrings } from 'framework/strings'
import type { ArtifactTriggerConfig } from 'services/pipeline-ng'
import { ArtifactConnector } from '../ArtifactRepository/ArtifactConnector'
import type { InitialArtifactDataType, ConnectorRefLabelType, ArtifactType } from '../ArtifactInterface'
import { ArtifactTitleIdByType } from '../ArtifactHelper'
import css from './ArtifactWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}
interface ArtifactWizardProps {
  handleViewChange: (isConnectorView: boolean) => void
  artifactInitialValue: InitialArtifactDataType
  lastSteps: JSX.Element | undefined
  newConnectorSteps?: any
  labels: ConnectorRefLabelType
  selectedArtifact: ArtifactTriggerConfig['type']
  newConnectorView: boolean
  iconsProps: IconProps | undefined
  showConnectorStep: boolean
}

function ArtifactWizard({
  labels,
  selectedArtifact,
  handleViewChange,
  artifactInitialValue,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  iconsProps,
  showConnectorStep
}: ArtifactWizardProps): React.ReactElement {
  const { getString } = useStrings()

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 3) {
      handleViewChange(false)
    }
  }

  const renderSubtitle = (): JSX.Element | undefined => {
    const artifact = selectedArtifact as ArtifactType
    const stringId = selectedArtifact && ArtifactTitleIdByType[artifact]
    if (selectedArtifact) {
      return (
        <div className={css.subtitle} style={{ display: 'flex' }}>
          <Icon size={26} {...(iconsProps as IconProps)} />
          <String
            style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)' }}
            stringID={stringId as StringKeys}
          />
        </div>
      )
    }
    return undefined
  }

  return (
    <StepWizard className={css.existingDocker} subtitle={renderSubtitle()} onStepChange={onStepChange}>
      {showConnectorStep ? (
        <ArtifactConnector
          name={getString('connectors.artifactRepository')}
          stepName={labels.secondStepName}
          handleViewChange={() => handleViewChange(true)}
          initialValues={artifactInitialValue}
          selectedArtifact={selectedArtifact}
        />
      ) : null}

      {newConnectorView ? newConnectorSteps : null}
      {lastSteps ? lastSteps : null}
    </StepWizard>
  )
}

export default ArtifactWizard
