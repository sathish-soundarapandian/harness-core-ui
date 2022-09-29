/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil, set, unset } from 'lodash-es'
import { parse } from 'yaml'
import { connect, FormikProps } from 'formik'
import { Spinner } from '@blueprintjs/core'
import produce from 'immer'

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
  RUNTIME_INPUT_VALUE,
  SelectOption,
  useToaster
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { useStrings } from 'framework/strings'
import {
  EnvironmentResponse,
  EnvironmentResponseDTO,
  EnvironmentYamlV2,
  useGetEnvironmentInputs,
  useGetEnvironmentListV2,
  useGetServiceOverrideInputs
} from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'

import { useMutateAsGet } from '@common/hooks'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { isMultiTypeRuntime } from '@common/utils/utils'
import AddEditEnvironmentModal from '../AddEditEnvironmentModal'
import { isEditEnvironment } from '../utils'

import css from '../DeployInfrastructureStep.module.scss'

interface DeployEnvironmentProps {
  initialValues: DeployStageConfig
  formik?: FormikProps<DeployStageConfig>
  readonly?: boolean
  allowableTypes: AllowedTypes
  serviceRef?: string
  path?: string
  gitOpsEnabled?: boolean
  stepViewType?: StepViewType
}

function DeployEnvironment({
  initialValues,
  readonly,
  formik,
  allowableTypes,
  serviceRef,
  path,
  gitOpsEnabled,
  stepViewType
}: DeployEnvironmentProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

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
  } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: {
      filterType: 'Environment'
    },
    lazy: !orgIdentifier || (stepViewType === StepViewType.InputSet && isMultiTypeRuntime(environmentRefType))
  })

  const {
    data: environmentInputsResponse,
    loading: environmentInputsLoading,
    refetch: refetchEnvironmentInputs
  } = useGetEnvironmentInputs({
    lazy: true
  })

  const {
    data: serviceOverrideInputsResponse,
    loading: serviceOverrideInputsLoading,
    refetch: refetchServiceOverrideInputs
  } = useGetServiceOverrideInputs({
    lazy: true
  })

  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()

  useEffect(() => {
    // once response has loaded
    if (!environmentInputsLoading && !serviceOverrideInputsLoading) {
      // check for exisitence of environment and service override runtime inputs
      if (
        environmentInputsResponse?.data?.inputSetTemplateYaml ||
        serviceOverrideInputsResponse?.data?.inputSetTemplateYaml
      ) {
        const parsedEnvironmentYaml = parse(defaultTo(environmentInputsResponse?.data?.inputSetTemplateYaml, '{}'))
        const parsedServiceOverridesYaml = parse(
          defaultTo(serviceOverrideInputsResponse?.data?.inputSetTemplateYaml, '{}')
        )

        if (path) {
          updateStageFormTemplate(
            {
              environmentRef: RUNTIME_INPUT_VALUE,
              ...(parsedEnvironmentYaml?.environmentInputs && {
                environmentInputs: parsedEnvironmentYaml?.environmentInputs
              }),
              ...(parsedServiceOverridesYaml?.serviceOverrideInputs && {
                serviceOverrideInputs: parsedServiceOverridesYaml?.serviceOverrideInputs
              }),
              ...(!gitOpsEnabled && { infrastructureDefinitions: RUNTIME_INPUT_VALUE }),
              ...(gitOpsEnabled && { gitOpsClusters: RUNTIME_INPUT_VALUE })
            },
            path
          )

          const values = { ...formik?.values }
          if (parsedEnvironmentYaml.environmentInputs) {
            set(values, 'environment.environmentInputs', {
              ...clearRuntimeInput(parsedEnvironmentYaml.environmentInputs)
            })
          } else {
            unset(values, 'environment.environmentInputs')
          }

          if (parsedServiceOverridesYaml.serviceOverrideInputs) {
            set(values, 'environment.serviceOverrideInputs', {
              ...clearRuntimeInput(parsedServiceOverridesYaml.serviceOverrideInputs)
            })
          } else {
            unset(values, `environment.serviceOverrideInputs`)
          }

          if (gitOpsEnabled) {
            set(values, `environment.gitOpsClusters`, '')
          } else {
            set(values, `environment.infrastructureDefinitions`, '')
          }
          formik?.setValues({ ...values })
        } else {
          formik?.setValues({
            ...formik.values,
            environment: {
              ...formik.values.environment,
              ...parsedEnvironmentYaml,
              ...parsedServiceOverridesYaml
            }
          } as DeployStageConfig)
        }
      } else if (
        !environmentInputsResponse?.data?.inputSetTemplateYaml &&
        !serviceOverrideInputsResponse?.data?.inputSetTemplateYaml &&
        path
      ) {
        const updatedTemplate = produce(getStageFormTemplate(path), (draft: EnvironmentYamlV2) => {
          if (draft) {
            delete draft.environmentInputs
            delete draft.serviceOverrideInputs
          }
          if (gitOpsEnabled) {
            set(draft, 'gitOpsClusters', RUNTIME_INPUT_VALUE)
          } else {
            set(draft, 'infrastructureDefinitions', RUNTIME_INPUT_VALUE)
          }
        })
        const environmentValues = get(formik?.values, 'environment')

        if (environmentValues) {
          if (environmentValues.environmentRef === RUNTIME_INPUT_VALUE) {
            set(environmentValues, 'environmentInputs', RUNTIME_INPUT_VALUE)
            set(environmentValues, 'serviceOverrideInputs', RUNTIME_INPUT_VALUE)
          } else {
            unset(environmentValues, 'environmentInputs')
            unset(environmentValues, 'serviceOverrideInputs')
          }

          formik?.setFieldValue('environment', {
            ...environmentValues,
            ...(!gitOpsEnabled && {
              infrastructureDefinitions:
                environmentValues.environmentRef === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : []
            }),
            ...(gitOpsEnabled && {
              gitOpsClusters: environmentValues.environmentRef === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : []
            })
          })
          updateStageFormTemplate(updatedTemplate, path)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentInputsLoading, serviceOverrideInputsLoading])

  useEffect(() => {
    // this fetches the environment runtime inputs and service override inputs upon selection of environment
    if (selectedEnvironment?.identifier) {
      const queryParams = {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier: selectedEnvironment?.identifier
      }
      refetchEnvironmentInputs({
        queryParams
      })
      if (!isNil(serviceRef) && !isEmpty(serviceRef)) {
        refetchServiceOverrideInputs({
          queryParams: {
            ...queryParams,
            serviceIdentifier: serviceRef
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironment])

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
      initialValues.environment?.environmentRef
    ) {
      if (getMultiTypeFromValue(initialValues.environment?.environmentRef) === MultiTypeInputType.FIXED) {
        const existingEnvironment = environmentsSelectOptions.find(
          env => env.value === initialValues.environment?.environmentRef
        )
        if (!existingEnvironment) {
          if (!readonly) {
            formik?.setFieldValue('environment.environmentRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: initialValues.environment.environmentRef,
              value: initialValues.environment.environmentRef
            })
            setEnvironmentsSelectOptions(options)
          }
        } else {
          formik?.setFieldValue('environment.environmentRef', existingEnvironment?.value)
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

  const updateEnvironmentsList = (values: EnvironmentResponseDTO): void => {
    const newEnvironmentsList = [...defaultTo(environments, [])]
    const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === values.identifier)
    if (existingIndex >= 0) {
      newEnvironmentsList.splice(existingIndex, 1, values)
    } else {
      newEnvironmentsList.unshift(values)
    }
    setEnvironments(newEnvironmentsList)
    setSelectedEnvironment(newEnvironmentsList?.find(environment => environment.identifier === values?.identifier))
    formik?.setFieldValue('environment.environmentRef', values.identifier)
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

  return (
    <Layout.Horizontal
      className={css.formRow}
      spacing="medium"
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      <FormInput.MultiTypeInput
        label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
        tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
        name={'environment.environmentRef'}
        useValue
        disabled={readonly || (environmentRefType === MultiTypeInputType.FIXED && environmentsLoading)}
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
            if (formik?.values['infrastructureRef']) {
              formik?.setFieldValue('infrastructureRef', '')
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
      {(environmentInputsLoading || serviceOverrideInputsLoading) && (
        <Container margin={{ top: 'xlarge' }}>
          <Spinner size={20} />
        </Container>
      )}
      {!path && environmentRefType === MultiTypeInputType.FIXED && (
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
  )
}

export default connect(DeployEnvironment)
