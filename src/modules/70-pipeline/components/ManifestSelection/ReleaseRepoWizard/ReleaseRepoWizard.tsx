/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType, StepWizard } from '@harness/uicore'
import React from 'react'
import { get } from 'lodash-es'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ReleaseRepoManifest } from 'services/cd-ng'

import RepoStore from './RepoStore'
import RepoDetails from './RepoDetails'
import type { ManifestStores, ManifestTypes } from '../ManifestInterface'

import css from '../ManifestWizard/ManifestWizard.module.scss'

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
  manifest
}: ReleaseRepoStepProps): React.ReactElement {
  const { allowableTypes, isReadonly } = usePipelineContext()
  const { expressions } = useVariablesExpression()

  const onStepChange = (arg: StepChangeData<any>): void => {
    /*istanbul ignore next */
    const prevStep = get(arg, 'prevStep', '')
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
        stepName="Release Repo Store"
        name="Release Repo Store"
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
      />
      {/*istanbul ignore next */}
      {newConnectorView ? newConnectorSteps : null}
      <RepoDetails
        key={'RepoDetails'}
        name={'RepoDetails'}
        expressions={expressions}
        allowableTypes={allowableTypes}
        stepName={'RepoDetails'}
        initialValues={initialValues}
        manifest={manifest}
        handleSubmit={values => {
          /*istanbul ignore next */
          handleSubmit(values)
          onClose()
        }}
        isReadonly={isReadonly}
      />
    </StepWizard>
  )
}

export default ReleaseRepoWizard
