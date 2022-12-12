/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { defaultTo, isEmpty, isNil } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'

import {
  AllowedTypes,
  ButtonSize,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  ModalDialog,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  useToggleOpen
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvironmentGroupResponseDTO } from 'services/cd-ng'

import type { Scope } from '@common/interfaces/SecretsInterface'

import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'

import CreateEnvironmentGroupModal from '@cd/components/EnvironmentGroups/CreateEnvironmentGroupModal'

import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentGroupConfig
} from '../types'
import { useGetEnvironmentGroupsData } from './useGetEnvironmentGroupsData'
import EnvironmentGroupsList from '../EnvironmentGroupsList/EnvironmentGroupsList'

import DeployEnvironment from '../DeployEnvironment/DeployEnvironment'
import DeployCluster from '../DeployCluster/DeployCluster'
import DeployInfrastructure from '../DeployInfrastructure/DeployInfrastructure'
import InlineEntityFilters from '../components/InlineEntityFilters/InlineEntityFilters'
import {
  EntityFilterType,
  EntityType,
  InlineEntityFiltersRadioType
} from '../components/InlineEntityFilters/InlineEntityFiltersUtils'

import css from './DeployEnvironmentGroup.module.scss'

interface DeployEnvironmentGroupProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  scope: Scope
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
  gitOpsEnabled,
  scope
}: DeployEnvironmentGroupProps): JSX.Element {
  const { values, setValues, setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()

  // State
  const [selectedEnvironmentGroups, setSelectedEnvironmentGroups] = useState(
    getAllFixedEnvironmentGroups(initialValues)
  )

  // Constants
  const isFixed = getMultiTypeFromValue(values.environmentGroup) === MultiTypeInputType.FIXED
  const isRuntime = getMultiTypeFromValue(values.environmentGroup) === MultiTypeInputType.RUNTIME
  const filterPrefix = 'environmentGroupFilters'

  // API
  const {
    environmentGroupsList,
    loadingEnvironmentGroupsList,
    // This is required only when updating the entities list
    updatingEnvironmentGroupsList,
    refetchEnvironmentGroupsList,
    prependEnvironmentGroupToEnvironmentGroupsList
  } = useGetEnvironmentGroupsData(scope)

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

  const updateFormikAndLocalState = (newFormValues: DeployEnvironmentEntityFormState): void => {
    // this sets the form values
    setValues(newFormValues)
    // this updates the local state
    setSelectedEnvironmentGroups(getAllFixedEnvironmentGroups(newFormValues))
  }

  const updateEnvironmentGroupsList = (newEnvironmentGroupInfo: EnvironmentGroupResponseDTO): void => {
    prependEnvironmentGroupToEnvironmentGroupsList({
      envGroup: newEnvironmentGroupInfo as EnvironmentGroupConfig
    })
    closeAddNewModal()

    const newFormValues = produce(values, draft => {
      if (draft.environmentGroup && Array.isArray(draft.environments)) {
        draft.environmentGroup = newEnvironmentGroupInfo.identifier

        delete draft.environments
        delete draft.infrastructures
        delete draft.clusters
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onEnvironmentGroupEntityUpdate = (): void => {
    refetchEnvironmentGroupsList()
  }

  const onRemoveEnvironmentGroupFromList = (): void => {
    const newFormValues = produce(values, draft => {
      if (draft.environmentGroup) {
        draft.environmentGroup = ''
        draft.environments = []
        draft.infrastructures = {}
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const handleFilterRadio = (selectedRadioValue: InlineEntityFiltersRadioType): void => {
    if (selectedRadioValue === InlineEntityFiltersRadioType.MANUAL) {
      unstable_batchedUpdates(() => {
        setFieldValue('environments', RUNTIME_INPUT_VALUE)
        setFieldValue(filterPrefix, undefined)
      })
    } else {
      setFieldValue('infraClusterFilters', undefined)
    }
  }

  const handleInfraClustersFilterRadio = (selectedRadioValue: InlineEntityFiltersRadioType): void => {
    if (selectedRadioValue === InlineEntityFiltersRadioType.MANUAL) {
      setFieldValue('infraClusterFilters', undefined)
    }
  }

  return (
    <>
      <Layout.Horizontal
        spacing="medium"
        flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        className={css.inputField}
      >
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
            allowableTypes: getAllowableTypesWithoutExpression(allowableTypes),
            defaultValueToReset: '',
            onChange: item => {
              setSelectedEnvironmentGroups(getSelectedEnvironmentGroupsFromOptions([item as SelectOption]))
            }
          }}
          selectItems={selectOptions}
        />
        {isFixed && (
          <RbacButton
            margin={{ top: 'xlarge' }}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            disabled={readonly}
            onClick={openAddNewModal}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT_GROUP
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP
            }}
            text={getString('common.plusNewName', { name: getString('common.environmentGroup.label') })}
          />
        )}
      </Layout.Horizontal>
      <Layout.Vertical className={css.mainContent} spacing="medium">
        {isFixed && !isEmpty(selectedEnvironmentGroups) && (
          <EnvironmentGroupsList
            loading={loadingEnvironmentGroupsList || updatingEnvironmentGroupsList}
            environmentGroupsList={environmentGroupsList.filter(envGroupInList =>
              envGroupInList.envGroup?.identifier
                ? selectedEnvironmentGroups.includes(envGroupInList.envGroup.identifier)
                : false
            )}
            readonly={readonly}
            allowableTypes={allowableTypes}
            onEnvironmentGroupEntityUpdate={onEnvironmentGroupEntityUpdate}
            onRemoveEnvironmentGroupFromList={onRemoveEnvironmentGroupFromList}
            initialValues={initialValues}
            stageIdentifier={stageIdentifier}
            deploymentType={deploymentType}
            customDeploymentRef={customDeploymentRef}
            gitOpsEnabled={gitOpsEnabled}
          />
        )}

        {/* This component is specifically for filters */}
        {isRuntime && !readonly && (
          <InlineEntityFilters
            filterPrefix={filterPrefix}
            entityStringKey="environments"
            onRadioValueChange={handleFilterRadio}
            readonly={readonly}
            showCard
            baseComponent={
              <DeployEnvironment
                initialValues={{
                  environments: RUNTIME_INPUT_VALUE as any
                }}
                readonly
                allowableTypes={allowableTypes}
                isMultiEnvironment
                isUnderEnvGroup
                stageIdentifier={stageIdentifier}
                deploymentType={deploymentType}
                customDeploymentRef={customDeploymentRef}
                gitOpsEnabled={gitOpsEnabled}
              />
            }
            entityFilterListProps={{
              entities: [EntityType.ENVIRONMENTS, gitOpsEnabled ? EntityType.CLUSTERS : EntityType.INFRASTRUCTURES],
              filters: [EntityFilterType.ALL, EntityFilterType.TAGS],
              placeholderProps: {
                entity: getString('common.filterOnName', {
                  name: 'environments or ' + getString(gitOpsEnabled ? 'common.clusters' : 'common.infrastructures')
                }),
                tags: getString('common.filterOnName', { name: getString('typeLabel') })
              },
              allowableTypes
            }}
          >
            <InlineEntityFilters
              filterPrefix={'infraClusterFilters'}
              entityStringKey={gitOpsEnabled ? 'common.clusters' : 'common.infrastructures'}
              onRadioValueChange={handleInfraClustersFilterRadio}
              readonly={readonly}
              showCard
              hasTopMargin
              baseComponent={
                <>
                  {gitOpsEnabled ? (
                    <DeployCluster
                      initialValues={{
                        environments: RUNTIME_INPUT_VALUE as any
                      }}
                      readonly
                      allowableTypes={allowableTypes}
                      isMultiCluster
                      environmentIdentifier={''}
                      lazyCluster
                    />
                  ) : (
                    <DeployInfrastructure
                      initialValues={{
                        environments: RUNTIME_INPUT_VALUE as any
                      }}
                      readonly
                      allowableTypes={allowableTypes}
                      environmentIdentifier={''}
                      isMultiInfrastructure
                      deploymentType={deploymentType}
                      customDeploymentRef={customDeploymentRef}
                      lazyInfrastructure
                    />
                  )}
                </>
              }
              entityFilterListProps={{
                entities: [gitOpsEnabled ? EntityType.CLUSTERS : EntityType.INFRASTRUCTURES],
                filters: [EntityFilterType.ALL, EntityFilterType.TAGS],
                placeholderProps: {
                  entity: getString('common.filterOnName', {
                    name: getString(gitOpsEnabled ? 'common.clusters' : 'common.infrastructures')
                  }),
                  tags: getString('common.filterOnName', { name: getString('typeLabel') })
                },
                allowableTypes
              }}
            />
          </InlineEntityFilters>
        )}

        <ModalDialog
          isOpen={isAddNewModalOpen}
          onClose={closeAddNewModal}
          title={getString('common.newName', { name: getString('common.environmentGroup.label') })}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          enforceFocus={false}
          lazy
          width={1024}
        >
          <CreateEnvironmentGroupModal
            data={{}}
            onCreateOrUpdate={updateEnvironmentGroupsList}
            closeModal={closeAddNewModal}
            isEdit={false}
          />
        </ModalDialog>
      </Layout.Vertical>
    </>
  )
}
