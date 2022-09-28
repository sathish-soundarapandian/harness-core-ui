/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isNil } from 'lodash-es'
import { parse } from 'yaml'
import { useFormikContext } from 'formik'

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
  useToaster
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { useStrings } from 'framework/strings'
import { EnvironmentResponseDTO, useGetEnvironmentAccessList } from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { isEditEnvironment } from '../../DeployInfrastructureStep/utils'
import AddEditEnvironmentModal from '../../DeployInfrastructureStep/AddEditEnvironmentModal'
import EnvironmentEntitiesList from '../EnvironmentEntitiesList/EnvironmentEntitiesList'

import css from './DeployEnvironment.module.scss'

interface DeployEnvironmentProps {
  initialValues: DeployStageConfig
  readonly?: boolean
  allowableTypes: AllowedTypes
  serviceRef?: string
  gitOpsEnabled?: boolean
  stepViewType?: StepViewType
}

export default function DeployEnvironment({
  initialValues,
  readonly,
  allowableTypes,
  stepViewType
}: DeployEnvironmentProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { values, setFieldValue } = useFormikContext<DeployStageConfig>()

  const [environments, setEnvironments] = useState<EnvironmentResponseDTO[]>()
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentResponseDTO>()
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()
  const [environmentRefType, setEnvironmentRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environment?.environmentRef)
  )

  const {
    data: environmentsResponse,
    loading: environmentsLoading,
    error: environmentsError
  } = useGetEnvironmentAccessList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    if (!environmentsLoading && environmentsResponse?.data?.length) {
      setEnvironments(
        defaultTo(
          environmentsResponse.data.map(environmentObj => ({
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
      initialValues.environment?.environmentRef
    ) {
      if (getMultiTypeFromValue(initialValues.environment?.environmentRef) === MultiTypeInputType.FIXED) {
        const existingEnvironment = environmentsSelectOptions.find(
          env => env.value === initialValues.environment?.environmentRef
        )
        if (!existingEnvironment) {
          if (!readonly) {
            setFieldValue('environment.environmentRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: initialValues.environment.environmentRef,
              value: initialValues.environment.environmentRef
            })
            setEnvironmentsSelectOptions(options)
          }
        } else {
          setFieldValue('environment.environmentRef', existingEnvironment?.value)
          setSelectedEnvironment(
            environments?.find(environment => environment.identifier === existingEnvironment?.value)
          )
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsSelectOptions])

  useEffect(() => {
    if (!isNil(environmentsError)) {
      showError(getRBACErrorMessage(environmentsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsError])

  const updateEnvironmentsList = (updatedValues: EnvironmentResponseDTO): void => {
    const newEnvironmentsList = [...defaultTo(environments, [])]
    const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === updatedValues.identifier)
    if (existingIndex >= 0) {
      newEnvironmentsList.splice(existingIndex, 1, updatedValues)
    } else {
      newEnvironmentsList.unshift(updatedValues)
    }
    setEnvironments(newEnvironmentsList)
    setSelectedEnvironment(
      newEnvironmentsList?.find(environment => environment.identifier === updatedValues?.identifier)
    )
    setFieldValue('environment.environmentRef', updatedValues.identifier)
    hideEnvironmentModal()
  }

  const [showEnvironmentModal, hideEnvironmentModal] = useModalHook(() => {
    const environmentValues = parse(defaultTo(selectedEnvironment?.yaml, '{}'))
    return (
      <ModalDialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideEnvironmentModal}
        title={isEditEnvironment(selectedEnvironment) ? getString('editEnvironment') : getString('newEnvironment')}
        className={css.dialogStyles}
        width={1024}
      >
        <AddEditEnvironmentModal
          data={{
            ...environmentValues
          }}
          onCreateOrUpdate={updateEnvironmentsList}
          closeModal={hideEnvironmentModal}
          isEdit={Boolean(selectedEnvironment)}
        />
      </ModalDialog>
    )
  }, [environments, updateEnvironmentsList])

  const isFixed = environmentRefType === MultiTypeInputType.FIXED
  const isTemplateView = !isTemplatizedView(stepViewType)

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <FormInput.MultiTypeInput
          label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
          tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
          name={'environment.environmentRef'}
          useValue
          disabled={readonly || (isFixed && environmentsLoading)}
          placeholder={
            environmentsLoading ? getString('loading') : getString('cd.pipelineSteps.environmentTab.selectEnvironment')
          }
          multiTypeInputProps={{
            onTypeChange: setEnvironmentRefType,
            width: 280,
            onChange: item => {
              setSelectedEnvironment(
                environments?.find(environment => environment.identifier === (item as SelectOption)?.value)
              )
              if (values['infrastructureRef']) {
                setFieldValue('infrastructureRef', '')
              }
            },
            selectProps: {
              addClearBtn: !readonly,
              items: defaultTo(environmentsSelectOptions, [])
            },
            allowableTypes
          }}
          selectItems={defaultTo(environmentsSelectOptions, [])}
        />
        {!isTemplateView && isFixed && (
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
        )}
      </Layout.Horizontal>
      {isFixed && selectedEnvironment && (
        <EnvironmentEntitiesList data={[selectedEnvironment]} onEditClick={showEnvironmentModal} />
      )}
    </>
  )
}
