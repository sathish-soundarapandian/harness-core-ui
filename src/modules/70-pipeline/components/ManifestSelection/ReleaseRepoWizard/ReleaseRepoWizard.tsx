import { StepWizard } from '@harness/uicore'
import React from 'react'
import { produce } from 'immer'
import { set } from 'lodash-es'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import RepoStore from './RepoStore'
import RepoDetails from './RepoDetails'
import css from './ReleaseRepo.module.scss'

function ReleaseRepoWizard(props: any): React.ReactElement {
  const { stage } = props
  const { allowableTypes, isReadonly, updateStage } = usePipelineContext()
  const { expressions } = useVariablesExpression()
  const updateStageData = (values: any): void => {
    const listOfManifests = stage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests || []

    const filteredManifestIdx = listOfManifests.findIndex(
      (item: any) => item.manifest.identifier === values.manifest.identifier
    )

    if (filteredManifestIdx) {
      listOfManifests[filteredManifestIdx] = values
    } else {
      listOfManifests.push(values)
    }

    const path = 'stage.stage.spec.serviceConfig.serviceDefinition.spec.manifests'

    if (stage) {
      updateStage(
        produce(stage, (draft: any) => {
          set(draft, path, listOfManifests)
        }) as any
      )
    }
  }

  return (
    <StepWizard className={css.releaseRepoWizard} onCompleteWizard={props.onClose}>
      <RepoStore
        stepName="Release Repo Store"
        name="Release Repo Store"
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        handleConnectorViewChange={() => props.handleConnectorViewChange(true)}
        handleStoreChange={props.handleStoreChange}
        initialValues={props.initialValues}
      />
      <RepoDetails
        key={'RepoDetails'}
        name={'RepoDetails'}
        expressions={expressions}
        allowableTypes={allowableTypes}
        stepName={'RepoDetails'}
        initialValues={props.initialValues}
        manifest={props.manifest}
        handleSubmit={values => {
          updateStageData(values)
          props.onClose()
          // updateStage(values)
        }}
        isReadonly={isReadonly}
      />
      {/* {lastSteps?.length ? lastSteps?.map(step => step) : null} */}
    </StepWizard>
  )
}

export default ReleaseRepoWizard
