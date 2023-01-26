/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'
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

import { useStrings } from 'framework/strings'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import { isValueRuntimeInput } from '@common/utils/utils'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'

import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import InfrastructureEntitiesList from '../InfrastructureEntitiesList/InfrastructureEntitiesList'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  InfrastructureWithInputs,
  InfrastructureYaml
} from '../types'
import { useGetInfrastructuresData } from './useGetInfrastructuresData'

import css from './DeployInfrastructure.module.scss'

interface DeployInfrastructureProps
  extends Required<
    Omit<DeployEnvironmentEntityCustomStepProps, 'gitOpsEnabled' | 'stageIdentifier' | 'serviceIdentifiers'>
  > {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentIdentifier: string
  isMultiInfrastructure?: boolean
  lazyInfrastructure?: boolean
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
  deploymentType,
  customDeploymentRef,
  lazyInfrastructure
}: DeployInfrastructureProps): JSX.Element {
  const { values, setFieldValue, setValues } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { refetchPipelineVariable } = usePipelineVariables()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()
  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentRef || {}
  const { getTemplate } = useTemplateSelector()
  const uniquePathForInfrastructures = React.useRef(`_pseudo_field_${uuid()}`)
  let envToFetchInfraInputs = environmentIdentifier

  // State
  const [selectedInfrastructures, setSelectedInfrastructures] = useState(
    getAllFixedInfrastructures(initialValues, environmentIdentifier)
  )
  const [infrastructureRefType, setInfrastructureRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.infrastructure)
  )

  if (get(values, 'category') === 'group') {
    const scope = getScopeFromValue(get(values, 'environmentGroup') as string)
    envToFetchInfraInputs = scope !== Scope.PROJECT ? `${scope}.${environmentIdentifier}` : environmentIdentifier
  }

  // Constants
  const isFixed =
    (isMultiInfrastructure
      ? getMultiTypeFromValue(values.infrastructures?.[environmentIdentifier])
      : infrastructureRefType) === MultiTypeInputType.FIXED

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
    environmentIdentifier: envToFetchInfraInputs,
    // this condition makes the yaml metadata call data
    infrastructureIdentifiers: lazyInfrastructure ? [] : selectedInfrastructures,
    deploymentType,
    ...(shouldAddCustomDeploymentData && {
      deploymentTemplateIdentifier,
      versionLabel
    }),
    lazyInfrastructure
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
                  `['${environmentIdentifier}'].${values.infrastructure}`,
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
                  `['${environmentIdentifier}'].${infrastructure.infrastructureDefinition.identifier}`,
                  infrastructureInputs
                )
              } else {
                p.infrastructures[environmentIdentifier].push(c)
              }

              return p
            },
            {
              infrastructures: {},
              infrastructureInputs: {}
            }
          )
          setValues({
            ...values,
            // set value of unique path created to handle infrastructures if some infrastructures are already selected, else select All
            [uniquePathForInfrastructures.current]: selectedInfrastructures.map(infraId => ({
              label: defaultTo(
                infrastructuresList.find(infrastructureInList => infrastructureInList.identifier === infraId)?.name,
                infraId
              ),
              value: infraId
            })),
            infrastructures: { ...values.infrastructures, ...updatedInfrastructures.infrastructures },
            infrastructureInputs: { ...values.infrastructureInputs, ...updatedInfrastructures.infrastructureInputs }
          })
        }
      } else if (isMultiInfrastructure && isEmpty(selectedInfrastructures)) {
        // set value of unique path to All in case no infrastructures are selected or runtime if infrastructures is set to runtime
        // This is specifically used for on load
        const infraIdentifierValue =
          getMultiTypeFromValue(values.infrastructures?.[environmentIdentifier]) === MultiTypeInputType.RUNTIME
            ? values.infrastructures?.[environmentIdentifier]
            : [SELECT_ALL_OPTION]

        // This if condition is used to show runtime value for the infrastructure when it is shown for filtering
        if (readonly && isValueRuntimeInput(initialValues.environments)) {
          setFieldValue(`${uniquePathForInfrastructures.current}`, RUNTIME_INPUT_VALUE)
        } else {
          setFieldValue(`${uniquePathForInfrastructures.current}`, infraIdentifierValue)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, infrastructuresList, infrastructuresData])

  const disabled = readonly || (isFixed && loading)

  let placeHolderForInfrastructures =
    values.infrastructures && Array.isArray(values.infrastructures[environmentIdentifier])
      ? getString('common.infrastructures')
      : getString('cd.pipelineSteps.environmentTab.allInfrastructures')

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
      if (draft.category === 'multi') {
        if (draft.infrastructures && Array.isArray(draft.infrastructures[environmentIdentifier])) {
          draft.infrastructures[environmentIdentifier].push({
            label: newInfrastructureInfo.name,
            value: newInfrastructureInfo.identifier
          })
        } else {
          set(draft, `infrastructures.['${environmentIdentifier}']`, [
            {
              label: newInfrastructureInfo.name,
              value: newInfrastructureInfo.identifier
            }
          ])
        }
        set(draft, uniquePathForInfrastructures.current, draft.infrastructures?.[environmentIdentifier])
      } else {
        draft.infrastructure = newInfrastructureInfo.identifier
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onInfrastructureEntityUpdate = (): void => {
    refetchPipelineVariable?.()
    refetchInfrastructuresList()
    refetchInfrastructuresData()
  }

  const onRemoveInfrastructureFromList = (infrastructureToDelete: string): void => {
    const newFormValues = produce(values, draft => {
      if (draft.infrastructure) {
        draft.infrastructure = ''
        delete draft.infrastructures
      } else if (draft.infrastructures && Array.isArray(draft.infrastructures[environmentIdentifier])) {
        const filteredInfrastructures = draft.infrastructures[environmentIdentifier].filter(
          infra => infra.value !== infrastructureToDelete
        )
        draft.infrastructures[environmentIdentifier] = filteredInfrastructures
        set(draft, uniquePathForInfrastructures.current, filteredInfrastructures)
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
            name={uniquePathForInfrastructures.current}
            // Form group disabled
            disabled={disabled}
            dropdownProps={{
              placeholder: placeHolderForInfrastructures,
              items: selectOptions,
              // Field disabled
              disabled,
              isAllSelectionSupported: true
            }}
            onChange={items => {
              if (items?.at(0)?.value === 'All') {
                setFieldValue(`infrastructures.['${environmentIdentifier}']`, undefined)
                setSelectedInfrastructures([])
              } else {
                setFieldValue(`infrastructures.['${environmentIdentifier}']`, items)
                setSelectedInfrastructures(getSelectedInfrastructuresFromOptions(items))
              }
            }}
            multiTypeProps={{
              width: 280,
              allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
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
              onTypeChange: setInfrastructureRefType,
              width: 300,
              selectProps: { items: selectOptions },
              allowableTypes,
              defaultValueToReset: '',
              onChange: item => {
                setSelectedInfrastructures(getSelectedInfrastructuresFromOptions([item as SelectOption]))
              },
              expressions
            }}
            selectItems={selectOptions}
          />
        )}
        {isFixed && !lazyInfrastructure && (
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
          scope={getScopeFromValue(environmentIdentifier)}
        />
      </ModalDialog>
    </>
  )
}
