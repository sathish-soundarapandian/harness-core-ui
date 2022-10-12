/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Spinner } from '@blueprintjs/core'

import { AllowedTypes, Container } from '@harness/uicore'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentGroupData
} from '../types'
import { EnvironmentGroupCard } from './EnvironmentGroupEntityCard'

export interface EnvironmentGroupsListProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  loading: boolean
  environmentGroupsList: EnvironmentGroupData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  onEnvironmentGroupEntityUpdate?: (id: string) => void
  onRemoveEnvironmentGroupFromList?: (val: EnvironmentGroupData) => void
  initialValues: DeployEnvironmentEntityFormState
}

export default function EnvironmentGroupsList({
  loading,
  environmentGroupsList,
  readonly,
  allowableTypes,
  initialValues,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: EnvironmentGroupsListProps): React.ReactElement {
  const [environmentGroupToEdit, setEnvironmentGroupToEdit] = React.useState<EnvironmentGroupData | null>(null)
  const [environmentGroupToDelete, setEnvironmentGroupToDelete] = React.useState<EnvironmentGroupData | null>(null)

  useEffect(() => {
    return
  }, [environmentGroupToEdit, environmentGroupToDelete])

  if (loading) {
    return <Spinner />
  }

  return (
    <Container>
      {environmentGroupsList.map(row => {
        return (
          <EnvironmentGroupCard
            key={row.envGroup?.identifier}
            envGroup={row.envGroup}
            initialValues={initialValues}
            onDeleteClick={setEnvironmentGroupToDelete}
            onEditClick={setEnvironmentGroupToEdit}
            allowableTypes={allowableTypes}
            readonly={readonly}
            stageIdentifier={stageIdentifier}
            deploymentType={deploymentType}
            customDeploymentRef={customDeploymentRef}
            gitOpsEnabled={gitOpsEnabled}
          />
        )
      })}
    </Container>
  )
}
