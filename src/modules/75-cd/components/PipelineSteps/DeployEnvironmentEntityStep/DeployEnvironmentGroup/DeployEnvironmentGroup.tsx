/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { defaultTo, isEmpty, isNil, noop } from 'lodash-es'
import { useFormikContext } from 'formik'

import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import type { DeployEnvironmentEntityCustomStepProps, DeployEnvironmentEntityFormState } from '../types'
import { useGetEnvironmentGroupsData } from './useGetEnvironmentGroupsData'
import EnvironmentGroupsList from '../EnvironmentGroupsList/EnvironmentGroupsList'

interface DeployEnvironmentGroupProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
}

export function getAllFixedEnvironmentGroups(data: DeployEnvironmentEntityFormState): string[] {
  if (data.environmentGroup && getMultiTypeFromValue(data.environmentGroup) === MultiTypeInputType.FIXED) {
    return [data.environmentGroup]
  }

  return []
}

export function getSelectedEnvironmentGroupsFromOptions(items: SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
  }

  return []
}

export default function DeployEnvironmentGroup({
  initialValues,
  readonly,
  allowableTypes,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: DeployEnvironmentGroupProps): JSX.Element {
  const { values } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()

  // State
  const [selectedEnvironmentGroups, setSelectedEnvironmentGroups] = useState(
    getAllFixedEnvironmentGroups(initialValues)
  )

  // Constants
  const isFixed = getMultiTypeFromValue(values.environmentGroup) === MultiTypeInputType.FIXED

  // API
  const {
    environmentGroupsList,
    loadingEnvironmentGroupsList,
    // This is required only when updating the entities list
    updatingEnvironmentGroupsList
    // refetchEnvironmentGroupsList,
  } = useGetEnvironmentGroupsData()

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentGroupsList)) {
      return environmentGroupsList.map(environmentGroup => ({
        label: defaultTo(environmentGroup.envGroup?.name, ''),
        value: defaultTo(environmentGroup.envGroup?.identifier, '')
      }))
    }

    return []
  }, [environmentGroupsList])

  const disabled = readonly || (isFixed && loadingEnvironmentGroupsList)

  const placeHolderForEnvironmentGroup = loadingEnvironmentGroupsList
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironmentGroup')

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <FormInput.MultiTypeInput
          tooltipProps={{ dataTooltipId: 'specifyYourEnvironmentGroup' }}
          label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironmentGroup')}
          name="environmentGroup"
          useValue
          disabled={disabled}
          placeholder={placeHolderForEnvironmentGroup}
          multiTypeInputProps={{
            width: 300,
            selectProps: { items: selectOptions },
            allowableTypes,
            defaultValueToReset: '',
            onChange: item => {
              setSelectedEnvironmentGroups(getSelectedEnvironmentGroupsFromOptions([item as SelectOption]))
            }
          }}
          selectItems={selectOptions}
        />
        {/* {!isTemplateView && isFixed && (
          <RbacButton
            margin={{ top: 'xlarge' }}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            disabled={readonly}
            onClick={showEnvironmentModal}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
            text={
              isEditEnvironment(selectedEnvironment)
                ? getString('edit')
                : getString('common.plusNewName', { name: getString('environment') })
            }
            id={isEditEnvironment(selectedEnvironment) ? 'edit-environment' : 'add-new-environment'}
          />
        )} */}
      </Layout.Horizontal>
      {isFixed && !isEmpty(selectedEnvironmentGroups) && (
        <EnvironmentGroupsList
          loading={loadingEnvironmentGroupsList || updatingEnvironmentGroupsList}
          environmentGroupsList={environmentGroupsList}
          readonly={readonly}
          allowableTypes={allowableTypes}
          // onEnvironmentEntityUpdate={onEnvironmentEntityUpdate}
          // onRemoveEnvironmentFromList={removeEnvironmentFromList}
          onEnvironmentGroupEntityUpdate={noop as any}
          onRemoveEnvironmentGroupFromList={noop as any}
          initialValues={initialValues}
          stageIdentifier={stageIdentifier}
          deploymentType={deploymentType}
          customDeploymentRef={customDeploymentRef}
          gitOpsEnabled={gitOpsEnabled}
        />
      )}
    </>
  )
}
