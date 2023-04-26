/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { Collapse, Divider } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { Color } from '@harness/design-system'
import {
  ButtonVariation,
  Card,
  Text,
  AllowedTypes,
  Container,
  Layout,
  TagsPopover,
  Button,
  ButtonSize,
  SelectOption
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { NGEnvironmentInfoConfig } from 'services/cd-ng'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getIdentifierFromName } from '@common/utils/StringUtils'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentData
} from '../../types'
import DeployInfrastructure from '../../DeployInfrastructure/DeployInfrastructure'
import DeployCluster from '../../DeployCluster/DeployCluster'
import {
  InlineEntityFiltersProps,
  InlineEntityFiltersRadioType
} from '../../components/InlineEntityFilters/InlineEntityFiltersUtils'
import { EnvironmentInputs } from './EnvironmentInputs'
import ServiceOverrideInputs from './ServiceOverrideInputs'
import { getToggleTextStringKey } from './EnvironmentEntityCardUtils'

import css from '../EnvironmentEntitiesList.module.scss'

export interface EnvironmentEntityCardProps extends EnvironmentData, Required<DeployEnvironmentEntityCustomStepProps> {
  readonly: boolean
  allowableTypes: AllowedTypes
  onEditClick: (environment: EnvironmentData) => void
  onDeleteClick: (environment: EnvironmentData) => void
  initialValues: DeployEnvironmentEntityFormState
}

const getScopedRefUsingIdentifier = (
  values: DeployEnvironmentEntityFormState,
  environment: NGEnvironmentInfoConfig & {
    yaml: string
  }
): string => {
  const envRef = get(values, 'environment')
  if (envRef) {
    return envRef
  }
  return get(values, 'environments', []).find(
    (env: SelectOption) => getIdentifierFromName(env.label) === environment?.identifier
  )?.value as string
}

export function EnvironmentEntityCard({
  environment,
  environmentInputs,
  serviceOverrideInputs,
  readonly,
  allowableTypes,
  onEditClick,
  onDeleteClick,
  serviceIdentifiers,
  initialValues,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: EnvironmentEntityCardProps): React.ReactElement {
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { name, identifier, tags } = environment
  const scopedEnvRef = getScopedRefUsingIdentifier(values, environment)
  const filterPrefix = useMemo(() => `environmentFilters.${identifier}`, [identifier])
  const { accountId } = useParams<PipelinePathProps>()

  const handleFilterRadio = (selectedRadioValue: InlineEntityFiltersRadioType): void => {
    if (selectedRadioValue === InlineEntityFiltersRadioType.MANUAL) {
      setFieldValue(filterPrefix, undefined)
    }
  }

  const showEnvironmentInputs = !isNil(environmentInputs)
  const showServiceOverrideInputs = !isEmpty(serviceOverrideInputs[scopedEnvRef])

  const [showInputs, setShowInputs] = useState(false)
  const toggleText = useMemo(
    () => getString(getToggleTextStringKey(showInputs, showEnvironmentInputs, showServiceOverrideInputs)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showInputs, showEnvironmentInputs, showServiceOverrideInputs]
  )

  function toggle(): void {
    setShowInputs(show => !show)
  }

  const environmentPermission: ButtonProps['permission'] = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: identifier
    },
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: environment.orgIdentifier,
      projectIdentifier: environment.projectIdentifier
    },
    permission: PermissionIdentifier.EDIT_ENVIRONMENT
  }

  return (
    <Card className={css.card}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Layout.Vertical width={'90%'}>
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
            spacing="small"
            margin={{ bottom: 'xsmall' }}
          >
            <Text color={Color.PRIMARY_7} lineClamp={1}>
              {name}
            </Text>
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
            permission={environmentPermission}
          />
          <Button
            variation={ButtonVariation.ICON}
            icon="remove-minus"
            data-testid={`delete-environment-${identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ environment, environmentInputs })}
          />
        </Container>
      </Layout.Horizontal>

      {showEnvironmentInputs || showServiceOverrideInputs ? (
        <>
          <Container flex={{ justifyContent: 'center' }}>
            <Button
              icon={showInputs ? 'chevron-up' : 'chevron-down'}
              data-testid="toggle-environment-inputs"
              text={toggleText}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              onClick={toggle}
            />
          </Container>
          <Collapse keepChildrenMounted={false} isOpen={showInputs}>
            <EnvironmentInputs
              environmentRef={scopedEnvRef}
              environmentInputs={environmentInputs}
              allowableTypes={allowableTypes}
              deploymentType={deploymentType}
              stageIdentifier={stageIdentifier}
              readonly={readonly}
            />

            <ServiceOverrideInputs
              environmentRef={scopedEnvRef}
              serviceIdentifiers={serviceIdentifiers}
              serviceOverrideInputs={serviceOverrideInputs}
              allowableTypes={allowableTypes}
              deploymentType={deploymentType}
              stageIdentifier={stageIdentifier}
              readonly={readonly}
            />
          </Collapse>
        </>
      ) : null}

      {!values.environment && Array.isArray(values.environments) && scopedEnvRef && (
        <>
          <Container margin={{ top: 'medium', bottom: 'medium' }}>
            <Divider />
          </Container>
          <StepWidget<InlineEntityFiltersProps>
            type={StepType.InlineEntityFilters}
            factory={factory}
            stepViewType={StepViewType.Edit}
            readonly={readonly}
            allowableTypes={allowableTypes}
            initialValues={{
              filterPrefix,
              entityStringKey: gitOpsEnabled ? 'common.clusters' : 'common.infrastructures',
              onRadioValueChange: handleFilterRadio,
              baseComponent: (
                <>
                  {gitOpsEnabled ? (
                    <DeployCluster
                      initialValues={initialValues}
                      readonly={readonly}
                      allowableTypes={allowableTypes}
                      environmentIdentifier={scopedEnvRef}
                      isMultiCluster
                    />
                  ) : (
                    <DeployInfrastructure
                      initialValues={initialValues}
                      readonly={readonly}
                      allowableTypes={allowableTypes}
                      environmentIdentifier={scopedEnvRef}
                      isMultiInfrastructure
                      deploymentType={deploymentType}
                      customDeploymentRef={customDeploymentRef}
                      environmentPermission={environmentPermission}
                    />
                  )}
                </>
              ),
              entityFilterProps: {
                entities: [gitOpsEnabled ? 'gitOpsClusters' : 'infrastructures']
              }
            }}
          />
        </>
      )}
    </Card>
  )
}
