/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
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
import {
  DeploymentStageConfig,
  InfrastructureResponse,
  InfrastructureResponseDTO,
  useGetInfrastructureList
} from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import type { DeployEnvironmentEntityFormState } from '../utils'
import { isEditInfrastructure } from '../../DeployInfrastructureStep/utils'
import InfrastructureEntitiesList from '../InfrastructureEntitiesList/InfrastructureEntitiesList'
import css from '../DeployEnvironment/DeployEnvironment.module.scss'

interface DeploySingleInfrastructureProps {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  environmentRef: string
  stepViewType?: StepViewType
}

export default function DeploySingleInfrastructure({
  initialValues,
  readonly,
  allowableTypes,
  stepViewType,
  environmentRef
}: DeploySingleInfrastructureProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { stage } = getStageFromPipeline(selectedStageId || '')
  const { getTemplate } = useTemplateSelector()

  const [environmentIdentifier, setEnvironmentIdentifier] = useState<string>(environmentRef)
  const [infrastructures, setInfrastructures] = useState<InfrastructureResponseDTO[]>()
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<InfrastructureResponseDTO>()
  const [infrastructuresSelectOptions, setInfrastructuresSelectOptions] = useState<SelectOption[]>()
  const [infrastructureRefType, setInfrastructureRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environment?.infrastructureRef)
  )

  const isFixed = infrastructureRefType === MultiTypeInputType.FIXED
  const isTemplateView = useMemo(() => isTemplatizedView(stepViewType), [stepViewType])

  useEffect(() => {
    if (environmentIdentifier !== environmentRef) {
      setEnvironmentIdentifier(environmentRef)
      setSelectedInfrastructure(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentRef])

  const {
    data: infrastructuresResponse,
    loading: infrastructuresLoading,
    error: infrastructuresError
  } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      deploymentType: (stage?.stage?.spec as DeployStageConfig)?.deploymentType
    },
    lazy: getMultiTypeFromValue(environmentIdentifier) === MultiTypeInputType.RUNTIME
  })

  useEffect(() => {
    // istanbul ignore else
    if (!infrastructuresLoading && !get(infrastructuresResponse, 'data.empty')) {
      setInfrastructures(
        defaultTo(
          get(infrastructuresResponse, 'data.content', [])?.map((infrastructureObj: InfrastructureResponse) => ({
            ...infrastructureObj.infrastructure
          })),
          []
        )
      )
    } else if (!infrastructuresLoading && get(infrastructuresResponse, 'data.empty')) {
      setInfrastructures([])
    }
  }, [infrastructuresLoading, infrastructuresResponse])

  useEffect(() => {
    // istanbul ignore else
    if (!isNil(infrastructures)) {
      setInfrastructuresSelectOptions(
        infrastructures.map(infrastructure => {
          return { label: defaultTo(infrastructure.name, ''), value: defaultTo(infrastructure.identifier, '') }
        })
      )
    }
  }, [infrastructures])

  useEffect(() => {
    // istanbul ignore else
    if (
      !isEmpty(infrastructuresSelectOptions) &&
      !isNil(infrastructuresSelectOptions) &&
      initialValues.environment?.infrastructureRef
    ) {
      // istanbul ignore else
      if (getMultiTypeFromValue(initialValues.environment?.infrastructureRef) === MultiTypeInputType.FIXED) {
        const existingInfrastructure = infrastructuresSelectOptions.find(
          infra => infra.value === initialValues.environment?.infrastructureRef
        )
        if (!existingInfrastructure) {
          if (!readonly) {
            setFieldValue('environment.infrastructureRef', '')
          } else {
            const options = [...infrastructuresSelectOptions]
            options.push({
              label: initialValues.environment.infrastructureRef,
              value: initialValues.environment.infrastructureRef
            })
            setInfrastructuresSelectOptions(options)
          }
        } else {
          setFieldValue('environment.infrastructureRef', existingInfrastructure.value)
          setSelectedInfrastructure(infrastructures?.find(infra => infra.identifier === existingInfrastructure?.value))
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresSelectOptions])

  useEffect(() => {
    // istanbul ignore else
    if (!isNil(infrastructuresError)) {
      showError(getRBACErrorMessage(infrastructuresError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresError])

  const updateInfrastructuresList = /* istanbul ignore next */ (updatedValues: InfrastructureResponseDTO): void => {
    const newInfrastructureList = [...defaultTo(infrastructures, [])]

    const existingIndex = newInfrastructureList.findIndex(item => item.identifier === updatedValues.identifier)
    if (existingIndex >= 0) {
      newInfrastructureList.splice(existingIndex, 1, updatedValues)
    } else {
      newInfrastructureList.unshift(updatedValues)
    }

    setInfrastructures(newInfrastructureList)
    setSelectedInfrastructure(
      newInfrastructureList?.find(infrastructure => infrastructure.identifier === updatedValues?.identifier)
    )

    setFieldValue('environment.infrastructureRef', updatedValues.identifier)
    hideInfrastructuresModal()
  }

  const [showInfrastructuresModal, hideInfrastructuresModal] = useModalHook(
    () => (
      <ModalDialog
        isOpen
        isCloseButtonShown
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideInfrastructuresModal}
        title={
          isEditInfrastructure(selectedInfrastructure?.yaml)
            ? getString('cd.infrastructure.edit')
            : getString('cd.infrastructure.createNew')
        }
        width={1128}
        height={840}
        className={css.dialogStyles}
      >
        <InfrastructureModal
          hideModal={hideInfrastructuresModal}
          refetch={updateInfrastructuresList}
          environmentIdentifier={environmentIdentifier}
          selectedInfrastructure={selectedInfrastructure?.yaml}
          stageDeploymentType={
            isEditInfrastructure(selectedInfrastructure?.yaml)
              ? undefined
              : ((stage?.stage?.spec as DeploymentStageConfig)?.deploymentType as ServiceDeploymentType)
          }
          stageCustomDeploymentData={(stage?.stage?.spec as DeploymentStageConfig)?.customDeploymentRef}
          getTemplate={getTemplate}
        />
      </ModalDialog>
    ),
    [environmentIdentifier, selectedInfrastructure, setSelectedInfrastructure]
  )

  return (
    <>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <FormInput.MultiTypeInput
          label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
          tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
          name={'environment.infrastructureRef'}
          useValue
          disabled={readonly || (infrastructureRefType === MultiTypeInputType.FIXED && infrastructuresLoading)}
          placeholder={
            infrastructuresLoading
              ? getString('loading')
              : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')
          }
          multiTypeInputProps={{
            onTypeChange: setInfrastructureRefType,
            width: 280,
            onChange: item => {
              setSelectedInfrastructure(
                infrastructures?.find(infra => infra.identifier === (item as SelectOption)?.value)
              )
            },
            selectProps: {
              addClearBtn: !readonly,
              items: defaultTo(infrastructuresSelectOptions, [])
            },
            expressions,
            allowableTypes
          }}
          selectItems={defaultTo(infrastructuresSelectOptions, [])}
        />
        {!isTemplateView && isFixed && (
          <RbacButton
            margin={{ top: 'xlarge' }}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            disabled={readonly}
            onClick={showInfrastructuresModal}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
            text={
              isEditInfrastructure(selectedInfrastructure?.yaml)
                ? getString('edit')
                : getString('common.plusNewName', { name: getString('infrastructureText') })
            }
            id={isEditInfrastructure(selectedInfrastructure?.yaml) ? 'edit-infrastructure' : 'add-new-infrastructure'}
          />
        )}
      </Layout.Horizontal>
      {isFixed && selectedInfrastructure && (
        <InfrastructureEntitiesList
          data={[selectedInfrastructure]}
          onEditClick={showInfrastructuresModal}
          onDeleteClick={() => {
            setSelectedInfrastructure(undefined)
            setFieldValue('environment.infrastructureRef', '')
          }}
        />
      )}
    </>
  )
}
