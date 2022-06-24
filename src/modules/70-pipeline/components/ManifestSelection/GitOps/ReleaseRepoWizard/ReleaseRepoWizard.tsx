/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType, StepWizard } from '@harness/uicore'
import React from 'react'
import { get } from 'lodash-es'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ReleaseRepoManifest } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import RepoStore from './RepoStore'
import RepoDetails from './RepoDetails'
import type { ManifestStores, ManifestTypes } from '../../ManifestInterface'

import css from '../../ManifestWizard/ManifestWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

interface ReleaseRepoStepProps {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: ReleaseRepoManifest | any

  labels: ConnectorRefLabelType
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  newConnectorSteps?: any

  isReadonly: boolean
  handleStoreChange: any
  manifestStoreTypes: ManifestStores[]
  types: ManifestTypes[]
  onClose: () => void
  manifest?: ReleaseRepoManifest | null
  handleSubmit: (values: any) => void
}

function ReleaseRepoWizard({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  newConnectorView,
  newConnectorSteps,
  onClose,
  handleSubmit,
  manifest,
  allowableTypes,
  isReadonly
}: ReleaseRepoStepProps): React.ReactElement {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const onStepChange = (arg: StepChangeData<any>): void => {
    /*istanbul ignore next */
    const prevStep = get(arg, 'prevStep', '')
    /*istanbul ignore next */
    const nextStep = get(arg, 'nextStep', '')
    /*istanbul ignore next */
    /*istanbul ignore else */
    if (prevStep && nextStep && prevStep > nextStep && nextStep <= 1) {
      /*istanbul ignore next */
      handleConnectorViewChange(false)
    }
  }
  return (
    <StepWizard className={css.manifestWizard} onCompleteWizard={onClose} onStepChange={onStepChange}>
      <RepoStore
        stepName={getString('pipeline.releaseRepoStore')}
        name={getString('pipeline.releaseRepoStore')}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        handleConnectorViewChange={
          /*istanbul ignore next */
          () => {
            /*istanbul ignore next */
            handleConnectorViewChange(true)
          }
        }
        handleStoreChange={handleStoreChange}
        initialValues={initialValues}
        selectedManifest={manifest}
      />
      {/*istanbul ignore next */}
      {newConnectorView ? newConnectorSteps : null}
      <RepoDetails
        key={getString('pipeline.manifestType.manifestDetails')}
        name={getString('pipeline.manifestType.manifestDetails')}
        expressions={expressions}
        allowableTypes={allowableTypes}
        stepName={getString('pipeline.manifestType.manifestDetails')}
        initialValues={initialValues}
        manifest={manifest}
        handleSubmit={
          /*istanbul ignore next */
          values => {
            /*istanbul ignore next */
            handleSubmit(values)
            /*istanbul ignore next */
            onClose()
          }
        }
        isReadonly={isReadonly}
      />
    </StepWizard>
  )
}

export default ReleaseRepoWizard
