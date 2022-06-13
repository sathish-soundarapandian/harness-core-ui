import { StepWizard } from '@harness/uicore'
import React from 'react'
import { produce } from 'immer'
import { set } from 'lodash-es'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import RepoStore from './RepoStore'
import RepoDetails from './RepoDetails'
import css from './ReleaseRepo.module.scss'
import type { StageElementConfig } from 'services/cd-ng'

function ReleaseRepoWizard(props: any): React.ReactElement {
  const { stage } = props
  const { allowableTypes, isReadonly, updateStage } = usePipelineContext()
  const { expressions } = useVariablesExpression()

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
          props.handleSubmit(values)
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
