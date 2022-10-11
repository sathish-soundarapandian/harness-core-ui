/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { Divider } from '@blueprintjs/core'

import {
  AllowedTypes,
  ButtonSize,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  ModalDialog,
  MultiTypeInputType,
  SelectOption,
  useToggleOpen
} from '@harness/uicore'

import type { EnvironmentYaml } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import EnvironmentEntitiesList from '../EnvironmentEntitiesList/EnvironmentEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentWithInputs
} from '../types'
import { useGetEnvironmentsData } from './useGetEnvironmentsData'
import AddEditEnvironmentModal from '../../DeployInfrastructureStep/AddEditEnvironmentModal'
import DeployInfrastructure from '../DeployInfrastructure/DeployInfrastructure'

import css from './DeployEnvironment.module.scss'

interface DeployEnvironmentProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  isMultiEnvironment: boolean
  identifiersToLoad?: string[]
  /** env group specific props */
  isUnderEnvGroup?: boolean
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
  identifiersToLoad,
  isUnderEnvGroup,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled
}: DeployEnvironmentProps): JSX.Element {
  const { values, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()

  // State
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(getAllFixedEnvironments(initialValues))

  // Constants
  const isFixed =
    getMultiTypeFromValue(isMultiEnvironment ? values.environments : values.environment) === MultiTypeInputType.FIXED

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
    envIdentifiers: defaultTo(identifiersToLoad, selectedEnvironments),
    loadSpecificIdentifiers: !isEmpty(identifiersToLoad)
  })

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiEnvironment])

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

          setValues({ ...values, ...updatedEnvironments })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, environmentsList, environmentsData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForEnvironments =
    Array.isArray(values.environments) && values.environments
      ? getString('environments')
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
      if (draft.environment) {
        draft.environment = newEnvironmentInfo.identifier
        draft.infrastructure = ''
      } else if (Array.isArray(draft.environments)) {
        draft.environments.push({ label: newEnvironmentInfo.name, value: newEnvironmentInfo.identifier })
        if (draft.infrastructures) {
          draft.infrastructures[newEnvironmentInfo.identifier] = []
        }
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onEnvironmentEntityUpdate = (): void => {
    refetchEnvironmentsList()
    refetchEnvironmentsData()
  }

  const onRemoveEnvironmentFromList = (environmentToDelete: string): void => {
    const newFormValues = produce(values, draft => {
      if (draft.environment) {
        draft.environment = ''
        draft.infrastructure = ''
        delete draft.environments
      } else if (Array.isArray(draft.environments)) {
        draft.environments = draft.environments.filter(env => env.value !== environmentToDelete)
        if (draft.infrastructures?.[environmentToDelete] && Array.isArray(draft.infrastructures[environmentToDelete])) {
          delete draft.infrastructures[environmentToDelete]
        }
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {isMultiEnvironment ? (
          <FormMultiTypeMultiSelectDropDown
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironments')}
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironments' }}
            name={'environments'}
            // Form group disabled
            disabled={disabled}
            dropdownProps={{
              placeholder: placeHolderForEnvironments,
              items: selectOptions,
              // Field disabled
              disabled
            }}
            onChange={items => {
              setSelectedEnvironments(getSelectedEnvironmentsFromOptions(items))
            }}
            multiTypeProps={{
              width: 280,
              allowableTypes
            }}
          />
        ) : (
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
            name="environment"
            useValue
            disabled={disabled}
            placeholder={placeHolderForEnvironment}
            multiTypeInputProps={{
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedEnvironments(getSelectedEnvironmentsFromOptions(item as SelectOption))
              }
            }}
            selectItems={selectOptions}
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
      {isMultiEnvironment && !isUnderEnvGroup ? (
        <FormInput.CheckBox
          label={getString('cd.pipelineSteps.environmentTab.multiEnvironmentsParallelDeployLabel')}
          name="parallel"
        />
      ) : null}
      {isFixed && !isEmpty(selectedEnvironments) && (
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
              <DeployInfrastructure
                initialValues={initialValues}
                readonly={readonly}
                allowableTypes={allowableTypes}
                environmentIdentifier={selectedEnvironments[0]}
                stageIdentifier={stageIdentifier}
                deploymentType={deploymentType}
                customDeploymentRef={customDeploymentRef}
              />
            </>
          )}
        </>
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
    </>
  )
}
