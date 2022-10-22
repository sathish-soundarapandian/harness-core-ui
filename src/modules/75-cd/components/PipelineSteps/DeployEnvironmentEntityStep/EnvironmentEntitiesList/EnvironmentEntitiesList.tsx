/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Intent, Spinner } from '@blueprintjs/core'
import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'

import { AllowedTypes, ConfirmationDialog, Container, ModalDialog, useToggleOpen } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentData
} from '../types'
import AddEditEnvironmentModal from '../../DeployInfrastructureStep/AddEditEnvironmentModal'
import { EnvironmentEntityCard } from './EnvironmentEntityCard'

import css from './EnvironmentEntitiesList.module.scss'

export interface EnvironmentEntitiesListProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  loading: boolean
  environmentsData: EnvironmentData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  onEnvironmentEntityUpdate: () => void
  onRemoveEnvironmentFromList: (id: string) => void
  initialValues: DeployEnvironmentEntityFormState
}

export default function EnvironmentEntitiesList({
  loading,
  environmentsData,
  readonly,
  allowableTypes,
  onEnvironmentEntityUpdate,
  onRemoveEnvironmentFromList,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled,
  initialValues
}: EnvironmentEntitiesListProps): React.ReactElement {
  const { getString } = useStrings()

  const [environmentToEdit, setEnvironmentToEdit] = React.useState<EnvironmentData | null>(null)
  const [environmentToDelete, setEnvironmentToDelete] = React.useState<EnvironmentData | null>(null)

  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()

  useEffect(() => {
    if (environmentToDelete) {
      openDeleteConfirmation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentToDelete])

  const handleDeleteConfirmation = (confirmed: boolean): void => {
    if (environmentToDelete && confirmed) {
      onRemoveEnvironmentFromList(environmentToDelete.environment.identifier)
    }
    setEnvironmentToDelete(null)
    closeDeleteConfirmation()
  }

  const closeEditModal = (): void => {
    setEnvironmentToEdit(null)
  }

  const handleEnvironmentEntityUpdate = (): void => {
    closeEditModal()
    onEnvironmentEntityUpdate()
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <Container className={css.environmentEntitiesList}>
        {environmentsData.map(row => {
          return (
            <EnvironmentEntityCard
              key={row.environment.identifier}
              environment={row.environment}
              environmentInputs={row.environmentInputs}
              onDeleteClick={setEnvironmentToDelete}
              onEditClick={setEnvironmentToEdit}
              allowableTypes={allowableTypes}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              gitOpsEnabled={gitOpsEnabled}
              deploymentType={deploymentType}
              customDeploymentRef={customDeploymentRef}
              initialValues={initialValues}
            />
          )
        })}
      </Container>

      <ModalDialog
        isOpen={!!environmentToEdit}
        onClose={closeEditModal}
        title={getString('editEnvironment')}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={840}
        className={css.dialogStyles}
      >
        <AddEditEnvironmentModal
          data={{
            ...parse(defaultTo(environmentToEdit?.environment?.yaml, '{}'))
          }}
          onCreateOrUpdate={handleEnvironmentEntityUpdate}
          closeModal={closeEditModal}
          isEdit={true}
        />
      </ModalDialog>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        titleText={getString('cd.pipelineSteps.environmentTab.deleteEnvironmentFromListDialogTitleText')}
        contentText={getString('cd.pipelineSteps.environmentTab.deleteEnvironmentFromListConfirmationText', {
          name: environmentToDelete?.environment.name
        })}
        confirmButtonText={getString('common.remove')}
        cancelButtonText={getString('cancel')}
        onClose={handleDeleteConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
