/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { get, isEmpty, isNil, set } from 'lodash-es'
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
  SelectOption,
  useToggleOpen
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'

import InfrastructureEntitiesList from '../InfrastructureEntitiesList/InfrastructureEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  InfrastructureWithInputs,
  InfrastructureYaml
} from '../types'
import { useGetInfrastructuresData } from './useGetInfrastructuresData'

import css from './DeployInfrastructure.module.scss'

interface DeployInfrastructureProps extends Required<Omit<DeployEnvironmentEntityCustomStepProps, 'gitOpsEnabled'>> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  isMultiInfrastructure?: boolean
}

export function getAllFixedInfrastructures(
  data: DeployEnvironmentEntityFormState,
  environmentIdentifier: string
): string[] {
  if (data.infrastructure && getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.FIXED) {
    return [data.infrastructure as string]
  } else if (
    data.infrastructures?.[environmentIdentifier] &&
    Array.isArray(data.infrastructures[environmentIdentifier])
  ) {
    return data.infrastructures[environmentIdentifier].map(infrastructure => infrastructure.value as string)
  }

  return []
}

export function getSelectedInfrastructuresFromOptions(items: SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
  }

  return []
}

export default function DeployInfrastructure({
  initialValues,
  readonly,
  allowableTypes,
  environmentIdentifier,
  isMultiInfrastructure,
  stageIdentifier,
  deploymentType,
  customDeploymentRef
}: DeployInfrastructureProps): JSX.Element {
  const { values, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()
  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentRef || {}
  const { getTemplate } = useTemplateSelector()

  // State
  const [selectedInfrastructures, setSelectedInfrastructures] = useState(
    getAllFixedInfrastructures(initialValues, environmentIdentifier)
  )

  // Constants
  const isFixed =
    getMultiTypeFromValue(
      isMultiInfrastructure ? values.infrastructures?.[environmentIdentifier] : values.infrastructure
    ) === MultiTypeInputType.FIXED

  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  // API
  const {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    // This is required only when updating the entities list
    updatingInfrastructuresData,
    refetchInfrastructuresList,
    refetchInfrastructuresData,
    prependInfrastructureToInfrastructureList
  } = useGetInfrastructuresData({
    environmentIdentifier,
    infrastructureIdentifiers: selectedInfrastructures,
    deploymentType,
    ...(shouldAddCustomDeploymentData && {
      deploymentTemplateIdentifier,
      versionLabel
    })
  })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(infrastructuresList)) {
      return infrastructuresList.map(infrastructure => ({
        label: infrastructure.name,
        value: infrastructure.identifier
      }))
    }

    return []
  }, [infrastructuresList])

  const loading = loadingInfrastructuresList || loadingInfrastructuresData

  useEffect(() => {
    if (!loading) {
      // update infrastructures in formik
      /* istanbul ignore else */
      if (values && infrastructuresData.length > 0) {
        if (values.infrastructure && !values.infrastructureInputs?.[environmentIdentifier]?.[values.infrastructure]) {
          const infrastructure = infrastructuresData.find(
            infrastructureData => infrastructureData.infrastructureDefinition.identifier === values.infrastructure
          )

          setValues({
            ...values,
            // if infrastructure input is not found, add it, else use the existing one
            infrastructureInputs: {
              [environmentIdentifier]: {
                [values.infrastructure]: get(
                  values.infrastructureInputs,
                  `${environmentIdentifier}.${values.infrastructure}`,
                  infrastructure?.infrastructureInputs
                )
              }
            }
          })
        } else if (values.infrastructures && Array.isArray(values.infrastructures?.[environmentIdentifier])) {
          const updatedInfrastructures = values.infrastructures[environmentIdentifier].reduce<InfrastructureWithInputs>(
            (p, c) => {
              const infrastructure = infrastructuresData.find(
                infrastructureData => infrastructureData.infrastructureDefinition.identifier === c.value
              )

              if (!Array.isArray(p.infrastructures[environmentIdentifier])) {
                p.infrastructures[environmentIdentifier] = []
              }

              if (infrastructure) {
                p.infrastructures[environmentIdentifier].push({
                  label: infrastructure.infrastructureDefinition.name,
                  value: infrastructure.infrastructureDefinition.identifier
                })
                // if infrastructure input is not found, add it, else use the existing one
                const infrastructureInputs = get(
                  values.infrastructureInputs,
                  [environmentIdentifier, infrastructure.infrastructureDefinition.identifier],
                  infrastructure?.infrastructureInputs
                )

                set(
                  p.infrastructureInputs,
                  `${environmentIdentifier}.${infrastructure.infrastructureDefinition.identifier}`,
                  infrastructureInputs
                )
              } else {
                p.infrastructures[environmentIdentifier].push(c)
              }

              return p
            },
            {
              infrastructures: {},
              infrastructureInputs: {},
              deployToAllInfrastructures: values.deployToAllInfrastructures
            }
          )

          setValues({
            ...values,
            infrastructures: { ...values.infrastructures, ...updatedInfrastructures.infrastructures },
            infrastructureInputs: { ...values.infrastructureInputs, ...updatedInfrastructures.infrastructureInputs }
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, infrastructuresList, infrastructuresData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForInfrastructures =
    values.infrastructures && Array.isArray(values.infrastructures[environmentIdentifier])
      ? getString('common.infrastructures')
      : getString('cd.pipelineSteps.environmentTab.selectInfrastructures')

  if (loading) {
    placeHolderForInfrastructures = getString('loading')
  }

  const placeHolderForInfrastructure = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')

  const updateFormikAndLocalState = (newFormValues: DeployEnvironmentEntityFormState): void => {
    // this sets the form values
    setValues(newFormValues)
    // this updates the local state
    setSelectedInfrastructures(getAllFixedInfrastructures(newFormValues, environmentIdentifier))
  }

  const updateInfrastructuresList = (newInfrastructureInfo: InfrastructureYaml): void => {
    prependInfrastructureToInfrastructureList(newInfrastructureInfo)
    closeAddNewModal()

    const newFormValues = produce(values, draft => {
      if (draft.infrastructures && Array.isArray(draft.infrastructures[environmentIdentifier])) {
        draft.infrastructures[environmentIdentifier].push({
          label: newInfrastructureInfo.name,
          value: newInfrastructureInfo.identifier
        })
      } else {
        draft.infrastructure = newInfrastructureInfo.identifier
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onInfrastructureEntityUpdate = (): void => {
    refetchInfrastructuresList()
    refetchInfrastructuresData()
  }

  const onRemoveInfrastructureFromList = (infrastructureToDelete: string): void => {
    const newFormValues = produce(values, draft => {
      if (draft.infrastructure) {
        draft.infrastructure = ''
        delete draft.infrastructures
      } else if (draft.infrastructures && Array.isArray(draft.infrastructures[environmentIdentifier])) {
        draft.infrastructures[environmentIdentifier] = draft.infrastructures[environmentIdentifier].filter(
          infra => infra.value !== infrastructureToDelete
        )
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {isMultiInfrastructure ? (
          <FormMultiTypeMultiSelectDropDown
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructures')}
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructures' }}
            name={`infrastructures.${environmentIdentifier}`}
            // Form group disabled
            disabled={disabled}
            dropdownProps={{
              placeholder: placeHolderForInfrastructures,
              items: selectOptions,
              // Field disabled
              disabled
            }}
            onChange={items => {
              setSelectedInfrastructures(getSelectedInfrastructuresFromOptions(items))
            }}
            multiTypeProps={{
              width: 280,
              allowableTypes
            }}
          />
        ) : (
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            name="infrastructure"
            useValue
            disabled={disabled}
            placeholder={placeHolderForInfrastructure}
            multiTypeInputProps={{
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedInfrastructures(getSelectedInfrastructuresFromOptions([item as SelectOption]))
              }
            }}
            selectItems={selectOptions}
          />
        )}
        {isFixed && (
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
            text={getString('common.plusNewName', { name: getString('infrastructureText') })}
          />
        )}
      </Layout.Horizontal>
      {isFixed && !isEmpty(selectedInfrastructures) && (
        <InfrastructureEntitiesList
          loading={loading || updatingInfrastructuresData}
          infrastructuresData={infrastructuresData}
          readonly={readonly}
          allowableTypes={allowableTypes}
          onInfrastructureEntityUpdate={onInfrastructureEntityUpdate}
          onRemoveInfrastructureFromList={onRemoveInfrastructureFromList}
          environmentIdentifier={environmentIdentifier}
          stageIdentifier={stageIdentifier}
          customDeploymentRef={customDeploymentRef}
        />
      )}

      <ModalDialog
        isOpen={isAddNewModalOpen}
        onClose={closeAddNewModal}
        title={getString('common.newName', { name: getString('infrastructureText') })}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={840}
        className={css.dialogStyles}
      >
        <InfrastructureModal
          hideModal={closeAddNewModal}
          refetch={updateInfrastructuresList}
          environmentIdentifier={environmentIdentifier}
          selectedInfrastructure={''}
          stageDeploymentType={deploymentType as ServiceDeploymentType}
          stageCustomDeploymentData={customDeploymentRef}
          getTemplate={getTemplate}
        />
      </ModalDialog>
    </>
  )
}
