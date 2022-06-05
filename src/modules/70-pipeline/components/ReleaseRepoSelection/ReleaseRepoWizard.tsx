import { StepWizard } from '@harness/uicore'
import React from 'react'
import { usePipelineContext } from '../PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import RepoStore from './RepoStore'

import css from './ReleaseRepo.module.scss'

function ReleaseRepoWizard(props: any): React.ReactElement {
  const { allowableTypes, isReadonly } = usePipelineContext()
  const { expressions } = useVariablesExpression()

  return (
    <StepWizard
      className={css.releaseRepoWizard}
      onStepChange={() => {
        // setCounter(counter + 1)
      }}
    >
      <RepoStore
        stepName="Release Repo Store"
        name="Release Repo Store"
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        handleConnectorViewChange={() => props.handleConnectorViewChange(true)}
        handleStoreChange={props.handleStoreChange}
        initialValues={{
          store: 'Git',
          connectorRef: undefined
        }}
      />
      <div name="ste" />
      {/* <ManifestRepoTypes
        manifestTypes={types}
        name={getString('pipeline.manifestType.manifestRepoType')}
        stepName={labels.firstStepName}
        selectedManifest={selectedManifest}
        changeManifestType={changeManifestType}
        initialValues={initialValues}
      />
      <ManifestStore
        name={getString('pipeline.manifestType.manifestSource')}
        stepName={labels.secondStepName}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        manifestStoreTypes={manifestStoreTypes}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChange}
        initialValues={initialValues}
      />
      {newConnectorView ? newConnectorSteps : null} */}

      {/* {lastSteps?.length ? lastSteps?.map(step => step) : null} */}
    </StepWizard>
  )
}

export default ReleaseRepoWizard
