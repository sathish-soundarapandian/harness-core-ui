/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Dialog,
  Layout,
  MultiTypeInputType,
  SelectOption,
  SplitButton,
  SplitButtonOption
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { defaultTo, isEmpty, isNil, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import {
  EnvironmentGroupResponseDTO,
  EnvironmentResponseDTO,
  InfrastructureResponseDTO,
  useGetEnvironmentGroupList,
  useGetEnvironmentListV2,
  useGetInfrastructureList
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useMutateAsGet } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { getEnvironmentRefSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { InfrastructureModal } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureModal'
import {
  DeployInfrastructureProps,
  DeployInfrastructureState,
  isEditEnvironment,
  isEditInfrastructure,
  PipelineInfrastructureV2
} from './utils'
import { AddEditEnvironmentModal } from './AddEditEnvironmentModal'

import css from './DeployInfrastructureStep.module.scss'
import infraCss from '../../EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureDefinition.module.scss'

// SONAR recommendation
const flexStart = 'flex-start'

export function DeployInfrastructureWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}: DeployInfrastructureProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()

  const [state, setState] = useState<DeployInfrastructureState>({
    isEdit: false,
    isEnvironment: false,
    data: { name: '', identifier: '' }
  })

  const formikRef = useRef<FormikProps<unknown> | null>(null)

  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)
  useEffect(() => {
    subscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef })
  }, [])

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
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (!environmentsLoading && !environmentsResponse?.data?.empty) {
      const environmentsList: EnvironmentResponseDTO[] = []
      if (environmentsResponse?.data?.content) {
        environmentsResponse.data.content.forEach(environmentObj => {
          environmentsList.push({ ...environmentObj.environment })
        })
      }
      setEnvironments(environmentsList)
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
    if (!isEmpty(environmentsSelectOptions) && !isNil(environmentsSelectOptions) && initialValues.environmentRef) {
      if (getMultiTypeFromValue(initialValues.environmentRef) === MultiTypeInputType.FIXED) {
        const doesExist = environmentsSelectOptions.filter(env => env.value === initialValues.environmentRef).length > 0
        if (!doesExist) {
          if (!readonly) {
            formikRef.current?.setFieldValue('environmentRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: initialValues.environmentRef,
              value: initialValues.environmentRef
            })
            setEnvironmentsSelectOptions(options)
          }
        }
      }
    }
  }, [environmentsSelectOptions])

  if (!isNil(environmentsError)) {
    showError(getRBACErrorMessage(environmentsError), undefined, 'cd.env.list.error')
  }

  const updateEnvironmentsList = (value: EnvironmentResponseDTO) => {
    formikRef.current?.setValues({ environmentRef: value.identifier, ...(state.isEnvironment && { environment: {} }) })
    if (!isNil(environments) && !isEmpty(environments)) {
      const newEnvironmentsList = [...environments]
      const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newEnvironmentsList.splice(existingIndex, 1, value)
      } else {
        newEnvironmentsList.unshift(value)
      }
      setEnvironments(newEnvironmentsList)
    }
    onClose()
  }

  const [showEnvironmentModal, hideEnvironmentModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={onClose}
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
      >
        <AddEditEnvironmentModal
          data={{
            name: defaultTo(state.data?.name, ''),
            identifier: defaultTo(state.data?.identifier, ''),
            orgIdentifier,
            projectIdentifier,
            ...state.data
          }}
          isEnvironment={state.isEnvironment}
          isEdit={state.isEdit}
          onCreateOrUpdate={updateEnvironmentsList}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideEnvironmentModal()
  }, [hideEnvironmentModal])

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environments ? (environments[0]?.identifier as string) : ''
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })

  const {
    data: environmentGroupsResponse,
    loading: environmentGroupsLoading,
    error: environmentGroupsError
  } = useMutateAsGet(useGetEnvironmentGroupList, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: {
      filterType: 'EnvironmentGroup'
    }
  })

  const [environmentGroups, setEnvironmentGroups] = useState<EnvironmentGroupResponseDTO[]>()
  const [environmentGroupsSelectOptions, setEnvironmentGroupsSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (!environmentGroupsLoading && !environmentGroupsResponse?.data?.empty) {
      const environmentGroupsList: EnvironmentGroupResponseDTO[] = []
      if (environmentGroupsResponse?.data?.content) {
        environmentGroupsResponse.data.content.forEach(environmentObj => {
          environmentGroupsList.push({ ...environmentObj.envGroup })
        })
      }
      setEnvironmentGroups(environmentGroupsList)
    }
  }, [environmentGroupsLoading, environmentGroupsResponse])

  useEffect(() => {
    if (!isNil(environmentGroups)) {
      setEnvironmentGroupsSelectOptions(
        environmentGroups.map(environmentGroup => {
          return { label: defaultTo(environmentGroup.name, ''), value: defaultTo(environmentGroup.identifier, '') }
        })
      )
    }
  }, [environments])

  useEffect(() => {
    if (
      !isEmpty(environmentGroupsSelectOptions) &&
      !isNil(environmentGroupsSelectOptions) &&
      initialValues.environmentRef
    ) {
      if (getMultiTypeFromValue(initialValues.environmentRef) === MultiTypeInputType.FIXED) {
        const doesExist =
          environmentGroupsSelectOptions.filter(env => env.value === initialValues.environmentRef).length > 0
        if (!doesExist) {
          if (!readonly) {
            formikRef.current?.setFieldValue('environmentRef', '')
          } else {
            const options = [...environmentGroupsSelectOptions]
            options.push({
              label: initialValues.environmentRef,
              value: initialValues.environmentRef
            })
            setEnvironmentGroupsSelectOptions(options)
          }
        }
      }
    }
  }, [environmentGroupsSelectOptions])

  if (!isNil(environmentGroupsError)) {
    showError(getRBACErrorMessage(environmentGroupsError), undefined, 'cd.env.list.error')
  }

  const updateEnvironmentGroupsList = (value: EnvironmentGroupResponseDTO) => {
    formikRef.current?.setValues({ environmentRef: value.identifier, ...(state.isEnvironment && { environment: {} }) })
    if (!isNil(environmentGroups) && !isEmpty(environmentGroups)) {
      const newEnvironmentGroupsList = [...environmentGroups]
      const existingIndex = newEnvironmentGroupsList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newEnvironmentGroupsList.splice(existingIndex, 1, value)
      } else {
        newEnvironmentGroupsList.unshift(value)
      }
      setEnvironmentGroups(newEnvironmentGroupsList)
    }
    onClose()
  }

  const [showEnvironmentGroupsModal, hideEnvironmentGroupsModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={onEnvGroupModalClose}
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
      >
        <AddEditEnvironmentModal
          data={{
            name: defaultTo(state.data?.name, ''),
            identifier: defaultTo(state.data?.identifier, ''),
            orgIdentifier,
            projectIdentifier,
            ...state.data
          }}
          isEnvironment={state.isEnvironment}
          isEdit={state.isEdit}
          onCreateOrUpdate={updateEnvironmentGroupsList}
          closeModal={onEnvGroupModalClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onEnvGroupModalClose = useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideEnvironmentGroupsModal()
  }, [hideEnvironmentGroupsModal])

  const [canEnvironmentGroupEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT_GROUP,
      resourceIdentifier: environmentGroups ? (environmentGroups[0]?.identifier as string) : ''
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT_GROUP],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canEnvironmentGroupCreate] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT_GROUP
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT_GROUP]
  })

  const [infrastructureRefType, setInfrastructureRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue((formikRef?.current as any)?.values?.infrastructureRef)
  )

  const {
    data: infrastructuresResponse,
    loading: infrastructuresLoading,
    error: infrastructuresError,
    refetch: infrastructuresRefetch
  } = useGetInfrastructureList({
    lazy: true
  })

  const [infrastructures, setInfrastructures] = useState<InfrastructureResponseDTO[]>()
  const [infrastructuresSelectOptions, setInfrastructuresSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (!infrastructuresLoading && !infrastructuresResponse?.data?.empty) {
      const infrastructuresList: InfrastructureResponseDTO[] = []
      if (infrastructuresResponse?.data?.content) {
        infrastructuresResponse.data.content.forEach(environmentObj => {
          infrastructuresList.push({ ...environmentObj.infrastructure })
        })
      }
      setInfrastructures(infrastructuresList)
    }
  }, [infrastructuresLoading, infrastructuresResponse])

  useEffect(() => {
    if (!isNil(infrastructures)) {
      setInfrastructuresSelectOptions(
        infrastructures.map(infrastructure => {
          return { label: defaultTo(infrastructure.name, ''), value: defaultTo(infrastructure.identifier, '') }
        })
      )
    }
  }, [infrastructures])

  useEffect(() => {
    if (
      !isEmpty(infrastructuresSelectOptions) &&
      !isNil(infrastructuresSelectOptions) &&
      (initialValues as any).infrastructureRef
    ) {
      if (getMultiTypeFromValue((initialValues as any).infrastructureRef) === MultiTypeInputType.FIXED) {
        const doesExist =
          infrastructuresSelectOptions.filter(
            infra => infra.value === ((initialValues as any).infrastructureRef as unknown as string)
          ).length > 0
        if (!doesExist) {
          if (!readonly) {
            formikRef.current?.setFieldValue('infrastructureRef', '')
          } else {
            const options = [...infrastructuresSelectOptions]
            options.push({
              label: (initialValues as any).infrastructureRef,
              value: (initialValues as any).infrastructureRef
            })
            setInfrastructuresSelectOptions(options)
          }
        }
      }
    }
  }, [infrastructuresSelectOptions])

  if (!isNil(infrastructuresError)) {
    showError(getRBACErrorMessage(infrastructuresError), undefined, 'cd.env.list.error')
  }

  const updateInfrastructuresList = (value: InfrastructureResponseDTO) => {
    formikRef.current?.setValues({ environmentRef: value.identifier, ...(state.isEnvironment && { environment: {} }) })
    if (!isNil(infrastructures) && !isEmpty(infrastructures)) {
      const newInfrastructureList = [...infrastructures]
      const existingIndex = newInfrastructureList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newInfrastructureList.splice(existingIndex, 1, value)
      } else {
        newInfrastructureList.unshift(value)
      }
      setInfrastructures(newInfrastructureList)
    }
    onInfraModalClose()
  }

  const [infrastructureToEdit, setInfrastructureToEdit] = useState<string | undefined>()

  const [showInfrastructuresModal, hideInfrastructuresModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        isCloseButtonShown
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideInfrastructuresModal}
        title={getString('cd.infrastructure.createNew')}
        className={cx('padded-dialog', infraCss.dialogStyles)}
      >
        <InfrastructureModal
          hideModal={hideInfrastructuresModal}
          refetch={updateInfrastructuresList}
          envIdentifier={(formikRef.current as any)?.values.environmentRef?.value}
          infrastructureToEdit={infrastructureToEdit}
          setInfrastructureToEdit={setInfrastructureToEdit}
        />
      </Dialog>
    ),
    [state, formikRef.current, infrastructureToEdit, setInfrastructureToEdit]
  )

  const onInfraModalClose = useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideInfrastructuresModal()
  }, [hideInfrastructuresModal])

  return (
    <>
      <Formik<PipelineInfrastructureV2>
        formName="deployInfrastructureStepForm"
        onSubmit={noop}
        validate={(values: PipelineInfrastructureV2) => {
          if (values.environmentRef2) {
            onUpdate?.({
              environmentGroup: {
                envGroupRef: values.environmentOrEnvGroupRef?.value,
                envGroupConfig: [
                  {
                    environmentRef: (values.environmentRef as any).value,
                    infrastructureDefinitions: (values as any).infrastructureDefinitions.map((infra: string) => ({
                      ref: infra
                    }))
                  }
                ]
              }
            } as any)
          } else {
            onUpdate?.({
              environment: {
                environmentRef: (values.environmentOrEnvGroupRef as any).value,
                infrastructureDefinitions: (values as any).infrastructureDefinitions.map((infra: string) => ({
                  ref: infra
                }))
              }
            } as any)
          }
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          environmentOrEnvGroupRef: getEnvironmentRefSchema(getString)
        })}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.ENVIRONMENT }))
          formikRef.current = formik as FormikProps<unknown> | null
          const { values, setFieldValue } = formik
          return (
            <FormikForm>
              <Layout.Horizontal
                className={css.formRow}
                spacing="medium"
                flex={{ alignItems: 'flex-end', justifyContent: flexStart }}
              >
                <FormInput.SelectWithSubmenuTypeInput
                  label={getString('cd.specifyEnvironmentOrGroup')}
                  name="environmentOrEnvGroupRef"
                  disabled={environmentsLoading || environmentGroupsLoading}
                  selectWithSubmenuTypeInputProps={{
                    items:
                      environmentsLoading || environmentGroupsLoading
                        ? [{ value: '', label: 'Loading...', submenuItems: [] }]
                        : [
                            {
                              label: getString('environment'),
                              value: getString('environment'),
                              submenuItems: environmentsResponse?.data?.content?.map(environmentObject => ({
                                label: environmentObject.environment?.name,
                                value: environmentObject.environment?.identifier
                              })) as SelectOption[]
                            },
                            {
                              label: getString('common.environmentGroup.label'),
                              value: getString('common.environmentGroup.label'),
                              submenuItems: environmentGroupsResponse?.data?.content?.map(environmentGroupObject => ({
                                label: environmentGroupObject.envGroup?.name,
                                value: environmentGroupObject.envGroup?.identifier
                              })) as SelectOption[]
                            }
                          ],
                    onChange: (primaryOption: SelectOption, secondaryOption: SelectOption) => {
                      if (primaryOption?.value === getString('environment')) {
                        setFieldValue('environmentOrEnvGroupRef', secondaryOption)
                        setFieldValue('environmentGroup.envGroupRef', '')
                        infrastructuresRefetch({
                          queryParams: {
                            accountIdentifier: accountId,
                            orgIdentifier,
                            projectIdentifier,
                            environmentIdentifier: secondaryOption?.value as string
                          }
                        })
                      } else if (primaryOption?.value === getString('common.environmentGroup.label')) {
                        setFieldValue('environmentOrEnvGroupRef', secondaryOption)
                        setFieldValue('environmentGroup.envGroupRef', secondaryOption?.value)
                      } else {
                        setFieldValue('environmentOrEnvGroupRef', primaryOption)
                      }
                    }
                  }}
                />

                {getMultiTypeFromValue(formik.values.environmentOrEnvGroupRef) === MultiTypeInputType.FIXED && (
                  <SplitButton
                    margin={{ bottom: 'small' }}
                    size={ButtonSize.SMALL}
                    variation={ButtonVariation.LINK}
                    disabled={
                      readonly || isEditEnvironment(values)
                        ? !canEdit && !canEnvironmentGroupEdit
                        : !canCreate && !canEnvironmentGroupCreate
                    }
                    text={
                      isEditEnvironment(values)
                        ? getString('editEnvironment')
                        : getString('cd.pipelineSteps.environmentTab.plusNewEnvironment')
                    }
                    id={isEditEnvironment(values) ? 'edit-environment' : 'add-new-environment'}
                    onClick={() => {
                      const isEdit = isEditEnvironment(values)
                      if (isEdit) {
                        if (values.environment?.identifier) {
                          setState({
                            isEdit,
                            formik,
                            isEnvironment: true,
                            data: values.environment
                          })
                        } else {
                          setState({
                            isEdit,
                            formik,
                            isEnvironment: false,
                            data: environments?.find(env => env.identifier === values.environmentRef)
                          })
                        }
                      } else {
                        setState({
                          isEdit: false,
                          isEnvironment: false,
                          formik
                        })
                      }
                      showEnvironmentModal()
                    }}
                  >
                    {Boolean(formik?.values.environmentRef) && (
                      <SplitButtonOption
                        text={getString('common.environmentGroup.new')}
                        onClick={() => {
                          const isEdit = isEditEnvironment(values)
                          if (isEdit) {
                            if (values.environment?.identifier) {
                              setState({
                                isEdit,
                                formik,
                                isEnvironment: true,
                                data: values.environment
                              })
                            } else {
                              setState({
                                isEdit,
                                formik,
                                isEnvironment: false,
                                data: environments?.find(env => env.identifier === values.environmentRef)
                              })
                            }
                          } else {
                            setState({
                              isEdit: false,
                              isEnvironment: false,
                              formik
                            })
                          }
                          showEnvironmentGroupsModal()
                        }}
                      />
                    )}
                  </SplitButton>
                )}

                {Boolean(formik.values.environmentGroup?.envGroupRef) && (
                  <>
                    <FormInput.MultiTypeInput
                      label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
                      tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                      name="environmentRef2"
                      disabled={
                        readonly ||
                        (getMultiTypeFromValue(formik.values.environmentGroup?.envGroupRef) ===
                          MultiTypeInputType.FIXED &&
                          environmentsLoading)
                      }
                      placeholder={
                        environmentsLoading
                          ? getString('loading')
                          : getString('cd.pipelineSteps.environmentTab.selectEnvironment')
                      }
                      multiTypeInputProps={{
                        width: 280,
                        onChange: item => {
                          if (values.environmentRef2 && (item as SelectOption).value !== values.environmentRef2) {
                            setFieldValue('environmentRef2', item as SelectOption)
                            infrastructuresRefetch({
                              queryParams: {
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier,
                                environmentIdentifier: (item as SelectOption)?.value as string
                              }
                            })
                          }
                        },
                        selectProps: {
                          addClearBtn: !readonly,
                          items: defaultTo(environmentsSelectOptions, [])
                        },
                        expressions,
                        allowableTypes
                      }}
                      selectItems={defaultTo(environmentsSelectOptions, [])}
                    />
                    <Button
                      margin={{ bottom: 'small' }}
                      size={ButtonSize.SMALL}
                      variation={ButtonVariation.LINK}
                      disabled={readonly || isEditEnvironment(values) ? !canEdit : !canCreate}
                      text={
                        isEditEnvironment(values)
                          ? getString('editEnvironment')
                          : getString('cd.pipelineSteps.environmentTab.plusNewEnvironment')
                      }
                      id={isEditEnvironment(values) ? 'edit-environment' : 'add-new-environment'}
                      onClick={() => {
                        const isEdit = isEditEnvironment(values)
                        if (isEdit) {
                          if (values.environment?.identifier) {
                            setState({
                              isEdit,
                              formik,
                              isEnvironment: true,
                              data: values.environment
                            })
                          } else {
                            setState({
                              isEdit,
                              formik,
                              isEnvironment: false,
                              data: environments?.find(env => env.identifier === values.environmentRef)
                            })
                          }
                        } else {
                          setState({
                            isEdit: false,
                            isEnvironment: false,
                            formik
                          })
                        }
                        showEnvironmentModal()
                      }}
                    />
                  </>
                )}
                {Boolean(values.environmentOrEnvGroupRef) &&
                  getMultiTypeFromValue(values.environmentOrEnvGroupRef) === MultiTypeInputType.FIXED && (
                    <>
                      <FormInput.MultiTypeInput
                        label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
                        tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
                        name="infrastructureRef"
                        useValue
                        disabled={
                          readonly || (infrastructureRefType === MultiTypeInputType.FIXED && infrastructuresLoading)
                        }
                        placeholder={
                          infrastructuresLoading
                            ? getString('loading')
                            : getString('cd.pipelineSteps.environmentTab.selectInfrastructure')
                        }
                        multiTypeInputProps={{
                          onTypeChange: setInfrastructureRefType,
                          width: 280,
                          onChange: item => {
                            if ((item as SelectOption).value !== (values as any).infrastructureRef) {
                              setFieldValue('infrastructureDefinitions', [(item as SelectOption)?.value])
                              setInfrastructureToEdit(
                                infrastructures?.filter(
                                  infra => infra.identifier === (item as SelectOption)?.value
                                )?.[0].yaml
                              )
                            }
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
                      {infrastructureRefType === MultiTypeInputType.FIXED && (
                        <Button
                          margin={{ bottom: 'small' }}
                          size={ButtonSize.SMALL}
                          variation={ButtonVariation.LINK}
                          disabled={readonly || (isEditEnvironment(values) ? !canEdit : !canCreate)}
                          onClick={() => {
                            const isEdit = isEditEnvironment(values)
                            if (isEdit) {
                              if (values.environment?.identifier) {
                                setState({
                                  isEdit,
                                  formik,
                                  isEnvironment: true,
                                  data: values.environment
                                })
                              } else {
                                setState({
                                  isEdit,
                                  formik,
                                  isEnvironment: false,
                                  data: environments?.find(env => env.identifier === values.infrastructureRef)
                                })
                              }
                            } else {
                              setState({
                                isEdit: false,
                                isEnvironment: false,
                                formik
                              })
                            }
                            showInfrastructuresModal()
                          }}
                          text={
                            isEditInfrastructure(values)
                              ? getString('common.editName', { name: getString('infrastructureText') })
                              : getString('common.plusNewName', { name: getString('infrastructureText') })
                          }
                          id={isEditInfrastructure(values) ? 'edit-infrastructure' : 'add-new-infrastructure'}
                        />
                      )}
                    </>
                  )}
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}
