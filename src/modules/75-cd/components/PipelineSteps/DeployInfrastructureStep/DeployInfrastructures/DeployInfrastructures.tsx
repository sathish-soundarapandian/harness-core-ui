/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { parse } from 'yaml'
import { Spinner } from '@blueprintjs/core'

import {
  AllowedTypes,
  ButtonSize,
  ButtonVariation,
  Container,
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
  InfrastructureResponse,
  InfrastructureResponseDTO,
  useGetInfrastructureInputs,
  useGetInfrastructureList
} from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import InfrastructureModal from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useRunPipelineFormContext } from '@pipeline/context/RunPipelineFormContext'
import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { isEditInfrastructure } from '../utils'

import css from './DeployInfrastructures.module.scss'

interface DeployInfrastructuresProps {
  formik?: FormikProps<DeployStageConfig>
  readonly?: boolean
  allowableTypes: AllowedTypes
  initialValues: DeployStageConfig
  environmentRef?: string
  path?: string
}

function DeployInfrastructures({
  initialValues,
  formik,
  readonly,
  allowableTypes,
  environmentRef,
  path
}: DeployInfrastructuresProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()

  const environmentIdentifier = useMemo(() => {
    return defaultTo(environmentRef || /* istanbul ignore next */ formik?.values?.environment?.environmentRef, '')
  }, [environmentRef, /* istanbul ignore next */ formik?.values?.environment?.environmentRef])

  const { updateTemplate } = useRunPipelineFormContext()

  const {
    data: infrastructuresResponse,
    loading: infrastructuresLoading,
    error: infrastructuresError
  } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    },
    lazy: getMultiTypeFromValue(environmentIdentifier) === MultiTypeInputType.RUNTIME
  })

  const {
    data: infrastructureInputsResponse,
    loading: infrastructureInputsLoading,
    refetch: refetchInfrastructureInputs
  } = useGetInfrastructureInputs({
    lazy: true
  })

  const [infrastructures, setInfrastructures] = useState<InfrastructureResponseDTO[]>()
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string | undefined>()
  const [infrastructuresSelectOptions, setInfrastructuresSelectOptions] = useState<SelectOption[]>()
  const [infrastructureRefType, setInfrastructureRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.infrastructureRef)
  )

  useEffect(() => {
    if (!infrastructureInputsLoading) {
      if (infrastructureInputsResponse?.data?.inputSetTemplateYaml) {
        const parsedInfrastructureDefinitionYaml = parse(
          defaultTo(infrastructureInputsResponse?.data?.inputSetTemplateYaml, '{}')
        )

        if (path) {
          formik?.setFieldValue(
            `${path}.infrastructureDefinitions[0]`,
            clearRuntimeInput(parsedInfrastructureDefinitionYaml.infrastructureDefinitions[0])
          )
          updateTemplate(
            parsedInfrastructureDefinitionYaml.infrastructureDefinitions[0],
            `${path}.infrastructureDefinitions[0]`
          )
        } else {
          formik?.setFieldValue('infrastructureInputs', parsedInfrastructureDefinitionYaml)
        }
      }
    } else {
      formik?.setFieldValue('infrastructureInputs', undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructureInputsLoading])

  useEffect(() => {
    // istanbul ignore else
    if (selectedInfrastructure) {
      const parsedInfraYaml = parse(defaultTo(selectedInfrastructure, '{}'))
      refetchInfrastructureInputs({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier,
          infraIdentifiers: [parsedInfraYaml?.infrastructureDefinition?.identifier]
        },
        queryParamStringifyOptions: {
          arrayFormat: 'comma'
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInfrastructure])

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
      initialValues.infrastructureRef
    ) {
      // istanbul ignore else
      if (getMultiTypeFromValue(initialValues.infrastructureRef) === MultiTypeInputType.FIXED) {
        const existingInfrastructure = infrastructuresSelectOptions.find(
          infra => infra.value === initialValues.infrastructureRef
        )
        if (!existingInfrastructure) {
          if (!readonly) {
            formik?.setFieldValue('infrastructureRef', '')
          } else {
            const options = [...infrastructuresSelectOptions]
            options.push({
              label: initialValues.infrastructureRef,
              value: initialValues.infrastructureRef
            })
            setInfrastructuresSelectOptions(options)
          }
        } else {
          formik?.setFieldValue('infrastructureRef', existingInfrastructure.value)
          setSelectedInfrastructure(
            infrastructures?.filter(infra => infra.identifier === existingInfrastructure?.value)?.[0]?.yaml
          )
        }
      }
    }

    // This may not be required anymore
    if (
      !isEmpty(infrastructuresSelectOptions) &&
      !isNil(infrastructuresSelectOptions) &&
      path &&
      initialValues.environment?.infrastructureDefinitions?.[0]?.identifier
    ) {
      setSelectedInfrastructure(
        infrastructures?.filter(
          infra => infra.identifier === initialValues.environment?.infrastructureDefinitions?.[0]?.identifier
        )?.[0]?.yaml
      )
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

  const updateInfrastructuresList = /* istanbul ignore next */ (values: InfrastructureResponseDTO): void => {
    const newInfrastructureList = [...defaultTo(infrastructures, [])]
    const existingIndex = newInfrastructureList.findIndex(item => item.identifier === values.identifier)
    if (existingIndex >= 0) {
      newInfrastructureList.splice(existingIndex, 1, values)
    } else {
      newInfrastructureList.unshift(values)
    }
    setInfrastructures(newInfrastructureList)
    setSelectedInfrastructure(newInfrastructureList[existingIndex >= 0 ? existingIndex : 0]?.yaml)
    formik?.setFieldValue('infrastructureRef', values.identifier)
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
          isEditInfrastructure(selectedInfrastructure)
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
          selectedInfrastructure={selectedInfrastructure}
        />
      </ModalDialog>
    ),
    [environmentIdentifier, selectedInfrastructure, setSelectedInfrastructure]
  )

  return (
    <Layout.Horizontal
      className={css.formRow}
      spacing="medium"
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      <FormInput.MultiTypeInput
        label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
        tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
        name={'infrastructureRef'}
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
              infrastructures?.filter(infra => infra.identifier === (item as SelectOption)?.value)?.[0]?.yaml
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
      {infrastructureInputsLoading && (
        <Container margin={{ top: 'xlarge' }}>
          <Spinner size={20} />
        </Container>
      )}
      {!path && infrastructureRefType === MultiTypeInputType.FIXED && (
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
            isEditInfrastructure(selectedInfrastructure)
              ? getString('edit')
              : getString('common.plusNewName', { name: getString('infrastructureText') })
          }
          id={isEditInfrastructure(selectedInfrastructure) ? 'edit-infrastructure' : 'add-new-infrastructure'}
        />
      )}
    </Layout.Horizontal>
  )
}

export default connect(DeployInfrastructures)
