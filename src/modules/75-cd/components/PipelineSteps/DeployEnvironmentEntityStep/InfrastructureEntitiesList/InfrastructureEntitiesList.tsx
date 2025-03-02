/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { Intent, Spinner } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'

import { AllowedTypes, ConfirmationDialog, Layout, ModalDialog, useToggleOpen } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

import type { ButtonProps } from '@rbac/components/Button/Button'
import { useInfrastructureUnsavedChanges } from '@cd/hooks/useInfrastructureUnsavedChanges'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'

import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { DeployEnvironmentEntityCustomStepProps, InfrastructureData } from '../types'
import { InfrastructureEntityCard } from './InfrastructureEntityCard'

import css from './InfrastructureEntitiesList.module.scss'

export interface InfrastructureEntitiesListProps
  extends Required<Pick<DeployEnvironmentEntityCustomStepProps, 'customDeploymentRef'>> {
  loading: boolean
  infrastructuresData: InfrastructureData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  onInfrastructureEntityUpdate: () => void
  onRemoveInfrastructureFromList: (id: string) => void
  environmentPermission?: ButtonProps['permission']
}

export default function InfrastructureEntitiesList({
  loading,
  infrastructuresData,
  readonly,
  allowableTypes,
  onInfrastructureEntityUpdate,
  onRemoveInfrastructureFromList,
  environmentIdentifier,
  customDeploymentRef,
  environmentPermission
}: InfrastructureEntitiesListProps): React.ReactElement {
  const { getString } = useStrings()
  const { getTemplate } = useTemplateSelector()

  const [infrastructureToEdit, setInfrastructureToEdit] = React.useState<InfrastructureData | null>(null)
  const [infrastructureToDelete, setInfrastructureToDelete] = React.useState<InfrastructureData | null>(null)

  const selectedInfrastructure = useMemo(
    () => defaultTo(infrastructureToEdit?.infrastructureDefinition?.yaml, '{}'),
    [infrastructureToEdit]
  )

  const { isInfraUpdated, handleInfrastructureUpdate, updatedInfrastructure } = useInfrastructureUnsavedChanges({
    selectedInfrastructure
  })

  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()

  useEffect(() => {
    if (infrastructureToDelete) {
      openDeleteConfirmation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructureToDelete])

  const handleDeleteConfirmation = (confirmed: boolean): void => {
    if (infrastructureToDelete && confirmed) {
      onRemoveInfrastructureFromList(infrastructureToDelete.infrastructureDefinition.identifier)
    }
    setInfrastructureToDelete(null)
    closeDeleteConfirmation()
  }

  const closeEditModal = (): void => {
    setInfrastructureToEdit(null)
  }

  const handleInfrastructureEntityUpdate = (): void => {
    closeEditModal()
    onInfrastructureEntityUpdate()
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <Layout.Vertical spacing={'medium'} margin={{ top: 'medium' }}>
        {infrastructuresData.map(row => {
          return (
            <InfrastructureEntityCard
              key={row.infrastructureDefinition.identifier}
              infrastructureDefinition={row.infrastructureDefinition}
              infrastructureInputs={row.infrastructureInputs}
              onDeleteClick={setInfrastructureToDelete}
              onEditClick={setInfrastructureToEdit}
              allowableTypes={allowableTypes}
              readonly={readonly}
              environmentIdentifier={environmentIdentifier}
              environmentPermission={environmentPermission}
            />
          )
        })}
      </Layout.Vertical>

      <ModalDialog
        isOpen={!!infrastructureToEdit}
        onClose={closeEditModal}
        title={getString('common.editName', { name: getString('infrastructureText') })}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={840}
        className={css.dialogStyles}
      >
        <InfrastructureModal
          hideModal={closeEditModal}
          refetch={handleInfrastructureEntityUpdate}
          environmentIdentifier={environmentIdentifier}
          selectedInfrastructure={selectedInfrastructure}
          stageDeploymentType={infrastructureToEdit?.infrastructureDefinition.deploymentType as ServiceDeploymentType}
          stageCustomDeploymentData={customDeploymentRef}
          getTemplate={getTemplate}
          scope={getScopeFromValue(environmentIdentifier)}
          isInfraUpdated={isInfraUpdated}
          handleInfrastructureUpdate={handleInfrastructureUpdate}
          updatedInfra={updatedInfrastructure}
        />
      </ModalDialog>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        titleText={getString('cd.pipelineSteps.environmentTab.deleteInfrastructureFromListDialogTitleText')}
        contentText={getString('cd.pipelineSteps.environmentTab.deleteInfrastructureFromListConfirmationText', {
          name: infrastructureToDelete?.infrastructureDefinition.name
        })}
        confirmButtonText={getString('common.remove')}
        cancelButtonText={getString('cancel')}
        onClose={handleDeleteConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
