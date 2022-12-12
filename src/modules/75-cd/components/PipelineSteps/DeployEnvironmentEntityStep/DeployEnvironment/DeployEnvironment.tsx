/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { Divider } from '@blueprintjs/core'
import { v4 as uuid } from 'uuid'

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

import type { EnvironmentYaml } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import { isMultiTypeExpression, isMultiTypeFixed, isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import EnvironmentEntitiesList from '../EnvironmentEntitiesList/EnvironmentEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentWithInputs
} from '../types'
import { useGetEnvironmentsData } from './useGetEnvironmentsData'
import AddEditEnvironmentModal from '../../DeployInfrastructureStep/AddEditEnvironmentModal'
import DeployInfrastructure from '../DeployInfrastructure/DeployInfrastructure'
import DeployCluster from '../DeployCluster/DeployCluster'

import InlineEntityFilters from '../components/InlineEntityFilters/InlineEntityFilters'
import {
  EntityFilterType,
  EntityType,
  InlineEntityFiltersRadioType
} from '../components/InlineEntityFilters/InlineEntityFiltersUtils'
import css from './DeployEnvironment.module.scss'

interface DeployEnvironmentProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  isMultiEnvironment: boolean
  identifiersToLoad?: string[]
  /** env group specific props */
  isUnderEnvGroup?: boolean
  envGroupIdentifier?: string
}

export function getAllFixedEnvironments(data: DeployEnvironmentEntityFormState): string[] {
  if (data.environment && getMultiTypeFromValue(data.environment) === MultiTypeInputType.FIXED) {
    return [data.environment as string]
  } else if (data.environments && Array.isArray(data.environments)) {
    return data.environments.map(environment => environment.value as string)
  }

  return []
}

export function getSelectedEnvironmentsFromOptions(items: SelectOption | SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
    /** If single environment, then items should contain some value.
     * If it's empty or runtime or expression return empty array */
  } else if (items && getMultiTypeFromValue(items) === MultiTypeInputType.FIXED) {
    return [items.value as string]
  }

  return []
}

export default function DeployEnvironment({
  initialValues,
  readonly,
  allowableTypes,
  isMultiEnvironment,
  envGroupIdentifier,
  isUnderEnvGroup,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: DeployEnvironmentProps): JSX.Element {
  const { values, setFieldValue, setValues, errors, setFieldError, setFieldTouched } =
    useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { refetchPipelineVariable } = usePipelineVariables()
  const uniquePathForEnvironments = React.useRef(`_pseudo_field_${uuid()}`)
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()

  const { GLOBAL_SERVICE_ENV } = useFeatureFlags()

  // State
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(getAllFixedEnvironments(initialValues))
  const [environmentsType, setEnvironmentsType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environment || initialValues.environments)
  )

  // Constants
  const isFixed = isMultiTypeFixed(environmentsType)
  const isRuntime = isMultiTypeRuntime(environmentsType)
  const isExpression = isMultiTypeExpression(environmentsType)
  const filterPrefix = 'environmentFilters.runtime'

  // API
  const {
    environmentsList,
    environmentsData,
    loadingEnvironmentsList,
    loadingEnvironmentsData,
    // This is required only when updating the entities list
    updatingEnvironmentsData,
    refetchEnvironmentsList,
    refetchEnvironmentsData,
    prependEnvironmentToEnvironmentList
  } = useGetEnvironmentsData({
    envIdentifiers: selectedEnvironments,
    envGroupIdentifier
  })

  useEffect(() => {
    /**
     * This sets the type of the field when toggling between single, multi environment & environment group
     * This is required as the initialValues get updated 1 tick later and hence type would be fixed by default
     */
    if (
      (isValueRuntimeInput(values.environment) || isValueRuntimeInput(values.environments)) &&
      !isMultiTypeRuntime(environmentsType)
    ) {
      setEnvironmentsType(MultiTypeInputType.RUNTIME)
    }
  }, [values.environment, values.environments, environmentsType])

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentsList)) {
      return environmentsList.map(environment => ({ label: environment.name, value: environment.identifier }))
    }

    return []
  }, [environmentsList])

  const loading = loadingEnvironmentsList || loadingEnvironmentsData

  useEffect(() => {
    // This condition is required to clear the list when switching from multi environment to single environment
    if (!isMultiEnvironment && !values.environment && selectedEnvironments.length) {
      setSelectedEnvironments([])
    }

    // This condition sets the unique path when switching from single env to multi env after the component has loaded with single env view
    if (
      isMultiEnvironment &&
      ((values.environments?.length && selectedEnvironments.length) || (!isFixed && values.environments))
    ) {
      setFieldValue(uniquePathForEnvironments.current, values.environments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiEnvironment])

  useEffect(() => {
    if (errors.environments) {
      setFieldError(uniquePathForEnvironments.current, errors.environments)
    } else {
      setFieldError(uniquePathForEnvironments.current, undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])

  useEffect(() => {
    if (!loading) {
      // update environments in formik
      /* istanbul ignore else */
      if (values && environmentsData.length > 0) {
        if (values.environment && !values.environmentInputs?.[values.environment]) {
          const environment = environmentsData.find(
            environmentData => environmentData.environment.identifier === values.environment
          )

          setValues({
            ...values,
            // if environment input is not found, add it, else use the existing one
            environmentInputs: {
              [values.environment]: get(values.environmentInputs, [values.environment], environment?.environmentInputs)
            }
          })
        } else if (Array.isArray(values.environments)) {
          const updatedEnvironments = values.environments.reduce<EnvironmentWithInputs>(
            (p, c) => {
              const environment = environmentsData.find(
                environmentData => environmentData.environment.identifier === c.value
              )

              if (environment) {
                p.environments.push({ label: environment.environment.name, value: environment.environment.identifier })
                // if environment input is not found, add it, else use the existing one
                const environmentInputs = get(
                  values.environmentInputs,
                  [environment.environment.identifier],
                  environment?.environmentInputs
                )

                p.environmentInputs[environment.environment.identifier] = environmentInputs
              } else {
                p.environments.push(c)
              }

              return p
            },
            { environments: [], environmentInputs: {}, parallel: values.parallel }
          )

          setValues({
            ...values,
            ...updatedEnvironments,
            // set value of unique path created to handle environments if some environments are already selected, else select All
            [uniquePathForEnvironments.current]: selectedEnvironments.map(envId => ({
              label: defaultTo(
                environmentsList.find(environmentInList => environmentInList.identifier === envId)?.name,
                envId
              ),
              value: envId
            }))
          })
        }
      } else if (isMultiEnvironment && isEmpty(selectedEnvironments)) {
        // set value of unique path to All in case no environments are selected or runtime if environments is set to runtime
        // This is specifically used for on load
        const envIdentifierValue =
          getMultiTypeFromValue(initialValues.environments) === MultiTypeInputType.RUNTIME
            ? initialValues.environments
            : [SELECT_ALL_OPTION]

        setFieldValue(`${uniquePathForEnvironments.current}`, envIdentifierValue)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, environmentsList, environmentsData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForEnvironments =
    Array.isArray(values.environments) && values.environments
      ? getString('environments')
      : isUnderEnvGroup
      ? getString('common.allEnvironments')
      : getString('cd.pipelineSteps.environmentTab.selectEnvironments')

  if (loading) {
    placeHolderForEnvironments = getString('loading')
  }

  const placeHolderForEnvironment = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironment')

  const updateFormikAndLocalState = (newFormValues: DeployEnvironmentEntityFormState): void => {
    // this sets the form values
    setValues(newFormValues)
    // this updates the local state
    setSelectedEnvironments(getAllFixedEnvironments(newFormValues))
  }

  const updateEnvironmentsList = (newEnvironmentInfo: EnvironmentYaml): void => {
    prependEnvironmentToEnvironmentList(newEnvironmentInfo)
    closeAddNewModal()

    const newFormValues = produce(values, draft => {
      if (draft.environments && Array.isArray(draft.environments)) {
        draft.environments.push({ label: newEnvironmentInfo.name, value: newEnvironmentInfo.identifier })
        if (gitOpsEnabled && draft.clusters) {
          if (draft.infrastructures) {
            delete draft.infrastructures
          }
        } else if (!gitOpsEnabled && draft.infrastructures) {
          if (draft.clusters) {
            delete draft.clusters
          }
        }
        set(draft, uniquePathForEnvironments.current, draft.environments)
      } else {
        draft.environment = newEnvironmentInfo.identifier
        if (gitOpsEnabled) {
          draft.cluster = ''
        } else {
          draft.infrastructure = ''
        }
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onEnvironmentEntityUpdate = (): void => {
    refetchPipelineVariable?.()
    refetchEnvironmentsList()
    refetchEnvironmentsData()
  }

  const onRemoveEnvironmentFromList = (environmentToDelete: string): void => {
    const newFormValues = produce(values, draft => {
      if (draft.environment) {
        draft.environment = ''

        if (gitOpsEnabled) {
          draft.cluster = ''
        } else {
          draft.infrastructure = ''
        }

        delete draft.environments
      } else if (Array.isArray(draft.environments)) {
        const filteredEnvironments = draft.environments.filter(env => env.value !== environmentToDelete)
        draft.environments = filteredEnvironments
        set(draft, uniquePathForEnvironments.current, filteredEnvironments)
        setFieldTouched(uniquePathForEnvironments.current, true)

        if (
          gitOpsEnabled &&
          draft.clusters?.[environmentToDelete] &&
          Array.isArray(draft.clusters[environmentToDelete])
        ) {
          delete draft.clusters[environmentToDelete]
        } else if (
          !gitOpsEnabled &&
          draft.infrastructures?.[environmentToDelete] &&
          Array.isArray(draft.infrastructures[environmentToDelete])
        ) {
          delete draft.infrastructures[environmentToDelete]
        }
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const handleFilterRadio = (selectedRadioValue: InlineEntityFiltersRadioType): void => {
    if (selectedRadioValue === InlineEntityFiltersRadioType.MANUAL) {
      unstable_batchedUpdates(() => {
        setFieldValue(gitOpsEnabled ? 'clusters' : 'infrastructures', RUNTIME_INPUT_VALUE)
        setFieldValue(filterPrefix, undefined)
      })
    }
  }
  const commonProps = {
    name: isMultiEnvironment ? uniquePathForEnvironments.current : 'environment',
    tooltipProps: isMultiEnvironment
      ? { dataTooltipId: 'specifyYourEnvironments' }
      : { dataTooltipId: 'specifyYourEnvironment' },
    label: isMultiEnvironment
      ? getString('cd.pipelineSteps.environmentTab.specifyYourEnvironments')
      : getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment'),
    disabled: disabled
  }

  return (
    <>
      <Layout.Horizontal
        spacing="medium"
        flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        className={css.inputField}
        margin={{ bottom: isMultiEnvironment ? 'medium' : 'none' }}
      >
        {isMultiEnvironment ? (
          GLOBAL_SERVICE_ENV && !isUnderEnvGroup ? (
            /*** This condition is added as entities one step down the entity tree
              will be following the parent scope so no need of the new component here ***/
            <MultiTypeEnvironmentField
              {...commonProps}
              placeholder={placeHolderForEnvironments}
              openAddNewModal={openAddNewModal}
              isMultiSelect
              onMultiSelectChange={(items: SelectOption[]) => {
                setFieldTouched(uniquePathForEnvironments.current, true)
                if (items?.at(0)?.value === 'All') {
                  setFieldValue(`environments`, undefined)
                  setSelectedEnvironments([])
                } else {
                  unstable_batchedUpdates(() => {
                    setFieldValue(`environments`, items)
                    if (isValueRuntimeInput(items)) {
                      setFieldValue(gitOpsEnabled ? 'clusters' : 'infrastructures', RUNTIME_INPUT_VALUE)
                    }
                  })
                  setSelectedEnvironments(getSelectedEnvironmentsFromOptions(items))
                }
              }}
              width={300}
              multiTypeProps={{
                expressions,
                onTypeChange: setEnvironmentsType,
                allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
              }}
            />
          ) : (
            <FormMultiTypeMultiSelectDropDown
              {...commonProps}
              dropdownProps={{
                placeholder: placeHolderForEnvironments,
                items: selectOptions,
                // Field disabled
                disabled,
                isAllSelectionSupported: isUnderEnvGroup
              }}
              onChange={items => {
                setFieldTouched(uniquePathForEnvironments.current, true)
                if (items?.at(0)?.value === 'All') {
                  setFieldValue(`environments`, undefined)
                  setSelectedEnvironments([])
                } else {
                  setFieldValue(`environments`, items)
                  setSelectedEnvironments(getSelectedEnvironmentsFromOptions(items))
                }
              }}
              multiTypeProps={{
                onTypeChange: setEnvironmentsType,
                width: 280,
                allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
              }}
            />
          )
        ) : !GLOBAL_SERVICE_ENV ? (
          <FormInput.MultiTypeInput
            {...commonProps}
            useValue
            placeholder={placeHolderForEnvironment}
            multiTypeInputProps={{
              onTypeChange: setEnvironmentsType,
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes: gitOpsEnabled ? getAllowableTypesWithoutExpression(allowableTypes) : allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedEnvironments(getSelectedEnvironmentsFromOptions(item as SelectOption))
              },
              expressions
            }}
            selectItems={selectOptions}
          />
        ) : (
          <MultiTypeEnvironmentField
            {...commonProps}
            placeholder={placeHolderForEnvironment}
            setRefValue={true}
            openAddNewModal={openAddNewModal}
            onChange={item => {
              setSelectedEnvironments([item])
            }}
            width={300}
            multiTypeProps={{
              expressions,
              allowableTypes: gitOpsEnabled ? getAllowableTypesWithoutExpression(allowableTypes) : allowableTypes,
              defaultValueToReset: ''
            }}
          />
        )}
        {isFixed && !isUnderEnvGroup && (
          <RbacButton
            margin={{ top: 'xlarge' }}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            disabled={readonly}
            onClick={openAddNewModal}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
            text={getString('common.plusNewName', { name: getString('environment') })}
          />
        )}
      </Layout.Horizontal>

      <Layout.Vertical className={css.mainContent} spacing="medium">
        {isMultiEnvironment && !isUnderEnvGroup ? (
          <FormInput.CheckBox
            label={getString('cd.pipelineSteps.environmentTab.multiEnvironmentsParallelDeployLabel')}
            name="parallel"
          />
        ) : null}

        {((isFixed && !isEmpty(selectedEnvironments)) || (isExpression && values.environment)) && (
          <>
            <EnvironmentEntitiesList
              loading={loading || updatingEnvironmentsData}
              environmentsData={environmentsData}
              readonly={readonly}
              allowableTypes={allowableTypes}
              onEnvironmentEntityUpdate={onEnvironmentEntityUpdate}
              onRemoveEnvironmentFromList={onRemoveEnvironmentFromList}
              initialValues={initialValues}
              stageIdentifier={stageIdentifier}
              deploymentType={deploymentType}
              customDeploymentRef={customDeploymentRef}
              gitOpsEnabled={gitOpsEnabled}
            />

            {!loading && !isMultiEnvironment && (
              <>
                <Divider />
                {gitOpsEnabled ? (
                  <DeployCluster
                    initialValues={initialValues}
                    readonly={readonly}
                    allowableTypes={getAllowableTypesWithoutExpression(allowableTypes)}
                    isMultiCluster
                    environmentIdentifier={selectedEnvironments[0]}
                  />
                ) : (
                  <DeployInfrastructure
                    initialValues={initialValues}
                    readonly={readonly}
                    allowableTypes={allowableTypes}
                    environmentIdentifier={selectedEnvironments[0]}
                    deploymentType={deploymentType}
                    customDeploymentRef={customDeploymentRef}
                    lazyInfrastructure={isExpression}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* This component is specifically for filters */}
        {isRuntime && !readonly && (isMultiEnvironment ? true : gitOpsEnabled) && (
          <InlineEntityFilters
            filterPrefix={filterPrefix}
            entityStringKey={gitOpsEnabled ? 'common.clusters' : 'common.infrastructures'}
            onRadioValueChange={handleFilterRadio}
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
        )}

        <ModalDialog
          isOpen={isAddNewModalOpen}
          onClose={closeAddNewModal}
          title={getString('newEnvironment')}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          enforceFocus={false}
          lazy
          width={1128}
          height={840}
          className={css.dialogStyles}
        >
          <AddEditEnvironmentModal
            data={{}}
            onCreateOrUpdate={updateEnvironmentsList}
            closeModal={closeAddNewModal}
            isEdit={false}
          />
        </ModalDialog>
      </Layout.Vertical>
    </>
  )
}
