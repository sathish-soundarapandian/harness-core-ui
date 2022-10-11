/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Divider } from '@blueprintjs/core'

import { ButtonVariation, Card, Text, Color, AllowedTypes, Container, Layout, TagsPopover } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentGroupData
} from '../types'

import DeployEnvironment from '../DeployEnvironment/DeployEnvironment'

import css from './EnvironmentGroupsList.module.scss'

export interface EnvironmentGroupCardProps
  extends EnvironmentGroupData,
    Required<DeployEnvironmentEntityCustomStepProps> {
  readonly: boolean
  allowableTypes: AllowedTypes
  onEditClick: (environment: EnvironmentGroupData) => void
  onDeleteClick: (environment: EnvironmentGroupData) => void
  initialValues: DeployEnvironmentEntityFormState
}

export function EnvironmentGroupCard({
  envGroup,
  readonly,
  allowableTypes,
  onEditClick,
  onDeleteClick,
  initialValues,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: EnvironmentGroupCardProps): React.ReactElement {
  const { getString } = useStrings()
  const { name, identifier, tags, envIdentifiers } = envGroup || {}

  return (
    <Card className={css.card}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Layout.Vertical>
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
            spacing="small"
            margin={{ bottom: 'xsmall' }}
          >
            <Text color={Color.PRIMARY_7}>{name}</Text>
            {!isEmpty(tags) && (
              <TagsPopover iconProps={{ size: 14, color: Color.GREY_600 }} tags={defaultTo(tags, {})} />
            )}
          </Layout.Horizontal>

          <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
            {getString('common.ID')}: {identifier}
          </Text>
        </Layout.Vertical>

        <Container>
          <RbacButton
            variation={ButtonVariation.ICON}
            icon="edit"
            data-testid={`edit-environment-group-${identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ envGroup })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT_GROUP,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP
            }}
          />
          <RbacButton
            variation={ButtonVariation.ICON}
            icon="remove-minus"
            data-testid={`delete-environment-group-${identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ envGroup })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT_GROUP,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.DELETE_ENVIRONMENT_GROUP
            }}
          />
        </Container>
      </Layout.Horizontal>

      <>
        <Container margin={{ top: 'medium', bottom: 'medium' }}>
          <Divider />
        </Container>

        <DeployEnvironment
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
          isMultiEnvironment
          isUnderEnvGroup
          stageIdentifier={stageIdentifier}
          deploymentType={deploymentType}
          customDeploymentRef={customDeploymentRef}
          gitOpsEnabled={gitOpsEnabled}
          identifiersToLoad={envIdentifiers}
        />
      </>
    </Card>
  )
}
