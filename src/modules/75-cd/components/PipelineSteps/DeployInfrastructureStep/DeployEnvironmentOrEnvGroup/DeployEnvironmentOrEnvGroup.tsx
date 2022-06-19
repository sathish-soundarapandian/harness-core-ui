/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'

import {
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Dialog,
  FormInput,
  SplitButton,
  ButtonSize,
  ButtonVariation,
  SplitButtonOption
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { useStrings } from 'framework/strings'
import { EnvironmentResponse, EnvironmentResponseDTO, useGetEnvironmentListV2 } from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useMutateAsGet } from '@common/hooks'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import type { DeployInfrastructureStepConfig } from '../DeployInfrastructureStep'
import AddEditEnvironmentModal from '../AddEditEnvironmentModal'
import { isEditEnvironmentOrEnvGroup } from '../utils'
import DeployClusters from '../DeployClusters/DeployClusters'

import css from '../DeployInfrastructureStep.module.scss'

// SONAR recommendation
const flexStart = 'flex-start'

export function DeployEnvironmentOrEnvGroup({
  initialValues,
  readonly,
  formikRef,
  allowableTypes
}: {
  initialValues: DeployInfrastructureStepConfig
  readonly: boolean
  formikRef: React.MutableRefObject<FormikProps<DeployInfrastructureStepConfig> | null>
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const {
    data: environmentsResponse,
    loading: environmentsLoading,
    error: environmentsError
  } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: {
      filterType: 'Environment'
    }
  })

  const [environments, setEnvironments] = useState<EnvironmentResponseDTO[]>()
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentResponseDTO>()
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()
  const [environmentOrEnvGroupRefType, setEnvironmentOrEnvGroupRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environmentOrEnvGroupRef)
  )

  useEffect(() => {
    if (!environmentsLoading && !get(environmentsResponse, 'data.empty')) {
      setEnvironments(
        defaultTo(
          get(environmentsResponse, 'data.content', [])?.map((environmentObj: EnvironmentResponse) => ({
            ...environmentObj.environment
          })),
          []
        )
      )
    }
  }, [environmentsLoading, environmentsResponse])

  useEffect(() => {
    if (!isNil(environments)) {
      setEnvironmentsSelectOptions(
        environments.map(environment => {
          return { label: defaultTo(environment.name, ''), value: defaultTo(environment.identifier, '') }
        })
      )
    }
  }, [environments])

  useEffect(() => {
    if (
      !isEmpty(environmentsSelectOptions) &&
      !isNil(environmentsSelectOptions) &&
      initialValues.environmentOrEnvGroupRef
    ) {
      if (getMultiTypeFromValue(initialValues.environmentOrEnvGroupRef) === MultiTypeInputType.FIXED) {
        const existingEnvironment = environmentsSelectOptions.find(
          env => env.value === initialValues.environmentOrEnvGroupRef
        )
        if (!existingEnvironment) {
          if (!readonly) {
            formikRef.current?.setFieldValue('environmentOrEnvGroupRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: initialValues.environmentOrEnvGroupRef,
              value: initialValues.environmentOrEnvGroupRef
            } as SelectOption)
            setEnvironmentsSelectOptions(options)
          }
        } else {
          formikRef.current?.setFieldValue('environmentOrEnvGroupRef', existingEnvironment)
          setSelectedEnvironment(
            environments?.find(environment => environment.identifier === existingEnvironment?.value)
          )
        }
      }
    }
  }, [environmentsSelectOptions])

  useEffect(() => {
    if (!isNil(environmentsError)) {
      showError(getRBACErrorMessage(environmentsError))
    }
  }, [environmentsError])

  const updateEnvironmentsList = (values: EnvironmentResponseDTO) => {
    formikRef.current?.setFieldValue('environmentOrEnvGroupRef', { label: values.name, value: values.identifier })
    if (!isNil(environments) && !isEmpty(environments)) {
      const newEnvironmentsList = [...environments]
      const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === values.identifier)
      if (existingIndex >= 0) {
        newEnvironmentsList.splice(existingIndex, 1, values)
      } else {
        newEnvironmentsList.unshift(values)
      }
      setEnvironments(newEnvironmentsList)
      setSelectedEnvironment(newEnvironmentsList?.find(environment => environment.identifier === values?.identifier))
    }
    hideEnvironmentModal()
  }

  const [showEnvironmentModal, hideEnvironmentModal] = useModalHook(() => {
    const environmentValues = parse(defaultTo(selectedEnvironment?.yaml, '{}'))
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideEnvironmentModal}
        title={
          isEditEnvironmentOrEnvGroup(selectedEnvironment) ? getString('editEnvironment') : getString('newEnvironment')
        }
        className={css.dialogStyles}
      >
        <AddEditEnvironmentModal
          data={{
            ...environmentValues
          }}
          onCreateOrUpdate={updateEnvironmentsList}
          closeModal={hideEnvironmentModal}
          isEdit={Boolean(selectedEnvironment)}
        />
      </Dialog>
    )
  }, [environments, updateEnvironmentsList])

  return (
    <Layout.Horizontal
      className={css.formRow}
      spacing="medium"
      flex={{ alignItems: flexStart, justifyContent: flexStart }}
    >
      <FormInput.SelectWithSubmenuTypeInput
        label={getString('cd.pipelineSteps.environmentTab.specifyEnvironmentOrGroup')}
        name="environmentOrEnvGroupRef"
        disabled={environmentsLoading} //|| environmentGroupsLoading}
        selectItems={
          environmentsLoading // || environmentGroupsLoading
            ? [{ value: '', label: 'Loading...', submenuItems: [] }]
            : [
                {
                  label: getString('environment'),
                  value: getString('environment'),
                  submenuItems: defaultTo(environmentsSelectOptions, []),
                  hasSubItems: true
                }
                // {
                //   label: getString('common.environmentGroup.label'),
                //   value: getString('common.environmentGroup.label'),
                //   submenuItems: defaultTo(environmentGroupsSelectOptions, []),
                //   hasSubItems: true
                // }
              ]
        }
        selectWithSubmenuTypeInputProps={{
          onTypeChange: setEnvironmentOrEnvGroupRefType,
          width: 300,
          allowableTypes,
          selectWithSubmenuProps: {
            addClearBtn: !readonly,
            items: environmentsLoading
              ? [{ value: '', label: 'Loading...', submenuItems: [] }]
              : [
                  {
                    label: getString('environment'),
                    value: getString('environment'),
                    submenuItems: defaultTo(environmentsSelectOptions, []),
                    hasSubItems: true
                  }
                  // {
                  //   label: getString('common.environmentGroup.label'),
                  //   value: getString('common.environmentGroup.label'),
                  //   submenuItems: defaultTo(environmentGroupsSelectOptions, []),
                  //   hasSubItems: true
                  // }
                ],
            onChange: (primaryOption?: SelectOption, secondaryOption?: SelectOption) => {
              if (primaryOption?.value === getString('environment')) {
                formikRef.current?.setValues({
                  ...formikRef,
                  environmentOrEnvGroupRef: secondaryOption,
                  clusterRef: []
                })
                setSelectedEnvironment(
                  environments?.find(environment => environment.identifier === secondaryOption?.value)
                )
              }
              // else if (primaryOption?.value === getString('common.environmentGroup.label')) {
              //   setFieldValue('environmentOrEnvGroupRef', secondaryOption)
              //   setFieldValue('environmentGroup.envGroupRef', secondaryOption?.value)
              //   setSelectedEnvironment(undefined)
              //   setSelectedEnvironmentGroup(
              //     environmentGroups?.find(environmentGroup => environmentGroup.identifier === secondaryOption?.value)
              //   )
              // }
              else {
                formikRef.current?.setFieldValue('environmentOrEnvGroupRef', primaryOption)
                setSelectedEnvironment(undefined)
              }
            }
          }
        }}
      />
      {environmentOrEnvGroupRefType === MultiTypeInputType.FIXED && (
        <SplitButton
          margin={{ top: 'xlarge' }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          text={
            isEditEnvironmentOrEnvGroup(selectedEnvironment)
              ? getString('editEnvironment')
              : getString('cd.pipelineSteps.environmentTab.plusNewEnvironment')
          }
          id={isEditEnvironmentOrEnvGroup(selectedEnvironment) ? 'edit-environment' : 'add-new-environment'}
          onClick={showEnvironmentModal}
        >
          <SplitButtonOption text={getString('common.environmentGroup.new')} onClick={showEnvironmentModal} />
        </SplitButton>
      )}
      {/* {Boolean(values.environmentGroup?.envGroupRef) &&
              selectedEnvironmentGroup &&
              environmentOrEnvGroupRefType === MultiTypeInputType.FIXED && (
                <DeployEnvironmentInEnvGroup
                  selectedEnvironmentGroup={selectedEnvironmentGroup}
                  setSelectedEnvironment={setSelectedEnvironment}
                  formikRef={formikRef}
                  initialValues={initialValues}
                  allowableTypes={allowableTypes}
                  readonly={readonly}
                />
              )} */}
      {Boolean((formikRef.current?.values?.environmentOrEnvGroupRef as SelectOption)?.value) &&
        environmentOrEnvGroupRefType === MultiTypeInputType.FIXED &&
        selectedEnvironment?.identifier && (
          <DeployClusters
            environmentIdentifier={selectedEnvironment?.identifier}
            formikRef={formikRef}
            allowableTypes={allowableTypes}
          />
        )}
    </Layout.Horizontal>
  )
}
