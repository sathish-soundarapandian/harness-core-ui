/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Dialog,
  Layout,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { defaultTo, isEmpty, isNil, noop, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps, FormikValues } from 'formik'
import type { IDialogProps } from '@blueprintjs/core'
import { ServiceRequestDTO, ServiceResponseDTO, ServiceYaml, useGetServiceList, useGetServiceV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { getServiceRefSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import RbacButton from '@rbac/components/Button/Button'
import ServiceEntityEditModal from '@cd/components/Services/ServiceEntityEditModal/ServiceEntityEditModal'
import type { DeployServiceData, DeployServiceProps, DeployServiceState } from './DeployServiceInterface'
import { flexStart, isEditService } from './DeployServiceUtils'
import { NewEditServiceModal } from './NewEditServiceModal'
import css from './DeployServiceStep.module.scss'

function DeployServiceWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceLabel
}: DeployServiceProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const serviceRef = initialValues?.service?.identifier || initialValues?.serviceRef

  const [services, setService] = useState<ServiceYaml[]>()
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>()
  const [state, setState] = useState<DeployServiceState>({ isEdit: false, isService: false })
  const [type, setType] = useState<MultiTypeInputType>(getMultiTypeFromValue(serviceRef))

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const updateServicesList = (value: ServiceRequestDTO): void => {
    formikRef.current?.setValues({ serviceRef: value.identifier, ...(state.isService && { service: {} }) })
    if (!isNil(services)) {
      const newService = {
        description: value.description,
        identifier: defaultTo(value.identifier, ''),
        name: value.name || '',
        tags: value.tags
      }
      const newServicesList = [...services]
      const existingIndex = newServicesList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newServicesList.splice(existingIndex, 1, newService)
      } else {
        newServicesList.unshift(newService)
      }
      setService(newServicesList)
    }
  }

  const {
    data: serviceResponse,
    error,
    loading
  } = useGetServiceList({
    queryParams
  })

  const {
    data: selectedServiceResponse,
    refetch: refetchServiceData,
    loading: serviceDataLoading
  } = useGetServiceV2({
    serviceIdentifier: '',
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (!isNil(selectOptions) && initialValues.serviceRef) {
      if (getMultiTypeFromValue(initialValues.serviceRef) === MultiTypeInputType.FIXED) {
        const doesExist = selectOptions.filter(service => service.value === initialValues.serviceRef).length > 0
        if (!doesExist) {
          if (!readonly) {
            formikRef.current?.setFieldValue('serviceRef', '')
          } else {
            const options = [...selectOptions]
            options.push({
              label: initialValues.serviceRef,
              value: initialValues.serviceRef
            })
            setSelectOptions(options)
          }
        }
      }
    }
  }, [selectOptions])

  useEffect(() => {
    if (!isNil(services)) {
      setSelectOptions(
        services.map(service => {
          return { label: service.name, value: service.identifier }
        })
      )
    }
  }, [services])

  useEffect(() => {
    if (!loading) {
      const serviceList: ServiceYaml[] = []
      if (serviceResponse?.data?.content?.length) {
        serviceResponse.data.content.forEach(service => {
          serviceList.push({
            description: service.service?.description,
            identifier: service.service?.identifier || '',
            name: service.service?.name || '',
            tags: service.service?.tags
          })
        })
      }
      if (initialValues.service) {
        const identifier = initialValues.service.identifier
        const isExist = serviceList.filter(service => service.identifier === identifier).length > 0
        if (initialValues.service && identifier && !isExist) {
          serviceList.push({
            description: initialValues.service?.description,
            identifier: initialValues.service?.identifier || '',
            name: initialValues.service?.name || '',
            tags: initialValues.service?.tags
          })
        }
      }
      setService(serviceList)
    }
  }, [loading, serviceResponse, serviceResponse?.data?.content?.length])

  useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error?.message) {
    showError(getRBACErrorMessage(error), undefined, 'cd.svc.list.error')
  }

  const onServiceChange = (
    fieldValue: SelectOption,
    formikValue: any,
    setFormikValue: (field: string, value: any) => void
  ): void => {
    if (formikValue.service?.identifier && fieldValue.value !== formikValue.service.identifier) {
      setService(services?.filter(service => service.identifier !== formikValue.service?.identifier))
      setFormikValue('service', undefined)
    }
  }

  const editService = (values: FormikValues): void => {
    if (initialValues.isNewServiceEntity) {
      refetchServiceData({
        pathParams: {
          serviceIdentifier: values.serviceRef
        },
        queryParams
      })
    }
    if (values.service?.identifier) {
      setState({
        isEdit: true,
        isService: true,
        data: values.service
      })
    } else {
      setState({
        isEdit: true,
        isService: false,
        data: services?.find(service => service.identifier === values.serviceRef)
      })
    }
    showModal()
  }

  const isNewServiceEntityDialog = (): boolean => {
    return !!initialValues.isNewServiceEntity && state.isEdit
  }
  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: isNewServiceEntityDialog() ? css.editServiceDialog : '',
    style: isNewServiceEntityDialog() ? { width: 1114 } : {}
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={onClose}
        title={state.isEdit ? getString('editService') : getString('newService')}
        {...DIALOG_PROPS}
      >
        {isNewServiceEntityDialog() ? (
          <ServiceEntityEditModal
            serviceResponse={selectedServiceResponse?.data?.service as ServiceResponseDTO}
            onCloseModal={hideModal}
            isLoading={serviceDataLoading}
          />
        ) : (
          <NewEditServiceModal
            data={{
              name: defaultTo(state.data?.name, ''),
              identifier: defaultTo(state.data?.identifier, ''),
              orgIdentifier,
              projectIdentifier,
              ...state.data
            }}
            isEdit={state.isEdit}
            isService={state.isService}
            onCreateOrUpdate={value => {
              updateServicesList(value)
              onClose.call(null)
            }}
            closeModal={onClose}
          />
        )}
      </Dialog>
    ),
    [state, selectedServiceResponse]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isService: false })
    hideModal()
  }, [hideModal])

  return (
    <>
      <Formik<DeployServiceData>
        formName="deployServiceStepForm"
        onSubmit={noop}
        validate={values => {
          if (!isEmpty(values.service)) {
            onUpdate?.({ ...omit(values, 'serviceRef') })
          } else {
            onUpdate?.({ ...omit(values, 'service'), serviceRef: values.serviceRef })
          }
        }}
        initialValues={{
          ...initialValues,
          ...{ serviceRef }
        }}
        validationSchema={Yup.object().shape({
          serviceRef: getServiceRefSchema(getString)
        })}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
          formikRef.current = formik as FormikProps<unknown> | null
          const { values, setFieldValue } = formik
          return (
            <Layout.Horizontal
              className={css.formRow}
              spacing="medium"
              flex={{ alignItems: flexStart, justifyContent: flexStart }}
            >
              <FormInput.MultiTypeInput
                tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                label={serviceLabel ? serviceLabel : getString('cd.pipelineSteps.serviceTab.specifyYourService')}
                name="serviceRef"
                useValue
                disabled={readonly || (type === MultiTypeInputType.FIXED && loading)}
                placeholder={loading ? getString('loading') : getString('cd.pipelineSteps.serviceTab.selectService')}
                multiTypeInputProps={{
                  onTypeChange: setType,
                  width: 300,
                  expressions,
                  onChange: val => onServiceChange(val as SelectOption, values, setFieldValue),
                  selectProps: {
                    disabled: loading,
                    addClearBtn: true && !readonly,
                    items: selectOptions || []
                  },
                  allowableTypes
                }}
                selectItems={selectOptions || []}
              />
              {isEditService(values) && !loading ? (
                <RbacButton
                  size={ButtonSize.SMALL}
                  text={getString('editService')}
                  variation={ButtonVariation.LINK}
                  id="edit-service"
                  disabled={readonly}
                  permission={{
                    permission: PermissionIdentifier.EDIT_SERVICE,
                    resource: {
                      resourceType: ResourceType.SERVICE,
                      resourceIdentifier: services ? (services[0]?.identifier as string) : ''
                    },
                    options: {
                      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
                    }
                  }}
                  onClick={() => editService(values)}
                />
              ) : (
                <RbacButton
                  size={ButtonSize.SMALL}
                  text={getString('cd.pipelineSteps.serviceTab.plusNewService')}
                  variation={ButtonVariation.LINK}
                  id="add-new-service"
                  disabled={readonly}
                  permission={{
                    permission: PermissionIdentifier.EDIT_SERVICE,
                    resource: {
                      resourceType: ResourceType.SERVICE
                    }
                  }}
                  onClick={() => {
                    setState({
                      isEdit: false,
                      isService: false
                    })
                    showModal()
                  }}
                />
              )}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}
export default DeployServiceWidget
