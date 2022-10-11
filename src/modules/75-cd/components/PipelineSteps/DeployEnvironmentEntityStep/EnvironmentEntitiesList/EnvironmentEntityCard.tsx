/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Collapse, Divider } from '@blueprintjs/core'
import { useFormikContext } from 'formik'

import {
  ButtonVariation,
  Card,
  Text,
  Color,
  AllowedTypes,
  Container,
  Layout,
  TagsPopover,
  Button,
  ButtonSize
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentData
} from '../types'
import { GenericServiceSpecInputSetMode } from '../../Common/GenericServiceSpec/GenericServiceSpecInputSetMode'
import DeployInfrastructure from '../DeployInfrastructure/DeployInfrastructure'

import css from './EnvironmentEntitiesList.module.scss'

export interface EnvironmentEntityCardProps extends EnvironmentData, Required<DeployEnvironmentEntityCustomStepProps> {
  readonly: boolean
  allowableTypes: AllowedTypes
  onEditClick: (environment: EnvironmentData) => void
  onDeleteClick: (environment: EnvironmentData) => void
  initialValues: DeployEnvironmentEntityFormState
}

export function EnvironmentEntityCard({
  environment,
  environmentInputs,
  readonly,
  allowableTypes,
  onEditClick,
  onDeleteClick,
  initialValues,
  stageIdentifier,
  deploymentType,
  customDeploymentRef
}: EnvironmentEntityCardProps): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { name, identifier, tags } = environment

  const [showInputs, setShowInputs] = useState(false)

  function toggle(): void {
    setShowInputs(show => !show)
  }

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
            data-testid={`edit-environment-${identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ environment, environmentInputs })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
          />
          <RbacButton
            variation={ButtonVariation.ICON}
            icon="remove-minus"
            data-testid={`delete-environment-${identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ environment, environmentInputs })}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: identifier
              },
              permission: PermissionIdentifier.DELETE_ENVIRONMENT
            }}
          />
        </Container>
      </Layout.Horizontal>

      {environmentInputs ? (
        <>
          <Container flex={{ justifyContent: 'center' }}>
            <Button
              icon={showInputs ? 'chevron-up' : 'chevron-down'}
              data-testid="toggle-environment-inputs"
              text={getString(
                showInputs
                  ? 'cd.pipelineSteps.environmentTab.hideEnvironmentInputs'
                  : 'cd.pipelineSteps.environmentTab.viewEnvironmentInputs'
              )}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              onClick={toggle}
            />
          </Container>
          <Collapse keepChildrenMounted={false} isOpen={showInputs}>
            <Container border={{ top: true }}>
              <Text color={Color.GREY_800} font={{ size: 'normal', weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.environmentInputs')}
              </Text>
              <GenericServiceSpecInputSetMode
                factory={factory}
                stageIdentifier={stageIdentifier}
                initialValues={values.environmentInputs?.[identifier] || {}}
                stepViewType={StepViewType.TemplateUsage}
                template={environmentInputs}
                path={`environmentInputs.${identifier}`}
                readonly={readonly}
                allowableTypes={allowableTypes}
              />
            </Container>
          </Collapse>
        </>
      ) : null}

      {!values.environment && (
        <>
          <Container margin={{ top: 'medium', bottom: 'medium' }}>
            <Divider />
          </Container>
          <DeployInfrastructure
            initialValues={initialValues}
            readonly={readonly}
            allowableTypes={allowableTypes}
            environmentIdentifier={identifier}
            isMultiInfrastructure
            stageIdentifier={stageIdentifier}
            deploymentType={deploymentType}
            customDeploymentRef={customDeploymentRef}
          />
        </>
      )}
    </Card>
  )
}
