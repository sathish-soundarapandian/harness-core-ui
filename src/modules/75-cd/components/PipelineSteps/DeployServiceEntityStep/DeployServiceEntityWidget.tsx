/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
  FormikForm,
  AllowedTypes,
  Toggle,
  useToggleOpen,
  ConfirmationDialog,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { IDialogProps, Intent } from '@blueprintjs/core'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import {
  JsonNode,
  mergeServiceInputsPromise,
  ServiceDefinition,
  ServiceYaml,
  ServiceYamlV2,
  TemplateLinkConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import RbacButton from '@rbac/components/Button/Button'
import ServiceEntityEditModal from '@cd/components/Services/ServiceEntityEditModal/ServiceEntityEditModal'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { queryClient } from 'services/queryClient'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { useDeepCompareEffect } from '@common/hooks'
import {
  DeployServiceEntityData,
  DeployServiceEntityCustomProps,
  FormState,
  getValidationSchema,
  getAllFixedServices,
  ServicesWithInputs,
  getAllFixedServicesFromValues
} from './DeployServiceEntityUtils'
import { ServiceEntitiesList } from './ServiceEntitiesList/ServiceEntitiesList'
import { useGetServicesData } from './useGetServicesData'
import { setupMode } from '../PipelineStepsUtil'
import css from './DeployServiceEntityStep.module.scss'

export interface DeployServiceEntityWidgetProps extends DeployServiceEntityCustomProps {
  initialValues: DeployServiceEntityData
  readonly: boolean
  allowableTypes: AllowedTypes
  customStepProps?: DeployServiceEntityCustomProps
  serviceLabel?: string
  onUpdate?(data: DeployServiceEntityData): void
}

const DIALOG_PROPS: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.editServiceDialog,
  lazy: true,
  style: { width: 1114 }
}

function getInitialValues(data: DeployServiceEntityData): FormState {
  if (data.service && data.service.serviceRef) {
    return {
      service: data.service.serviceRef,
      serviceInputs:
        getMultiTypeFromValue(data.service.serviceRef) === MultiTypeInputType.FIXED
          ? { [data.service.serviceRef]: data.service.serviceInputs }
          : {}
    }
  } else if (data.services) {
    if (Array.isArray(data.services.values)) {
      return {
        services: data.services.values.map(svc => ({
          value: defaultTo(svc.serviceRef, ''),
          label: defaultTo(svc.serviceRef, '')
        })),
        serviceInputs: data.services.values.reduce(
          (p, c) => ({ ...p, [defaultTo(c.serviceRef, '')]: c.serviceInputs }),
          {}
        ),
        parallel: !!get(data, 'services.metadata.parallel', true)
      }
    }

    return {
      services: data.services.values,
      serviceInputs: {},
      parallel: !!get(data, 'services.metadata.parallel', true)
    }
  }

  return { parallel: !!get(data, 'services.metadata.parallel', true) }
}

export default function DeployServiceEntityWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceLabel,
  deploymentType,
  gitOpsEnabled,
  stageIdentifier,
  setupModeType
}: DeployServiceEntityWidgetProps): React.ReactElement {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()
  const { refetchPipelineVariable } = usePipelineVariables()

  const { subscribeForm, unSubscribeForm } = useStageErrorContext<FormState>()
  const formikRef = React.useRef<FormikProps<FormState> | null>(null)
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()
  const {
    isOpen: isSwitchToMultiSvcDialogOpen,
    open: openSwitchToMultiSvcDialog,
    close: closeSwitchToMultiSvcDialog
  } = useToggleOpen()
  const {
    isOpen: isSwitchToSingleSvcDialogOpen,
    open: openSwitchToSingleSvcDialog,
    close: closeSwitchToSingleSvcDialog
  } = useToggleOpen()
  const [allServices, setAllServices] = useState(
    setupModeType === setupMode.DIFFERENT ? getAllFixedServices(initialValues) : ['']
  )
  const { MULTI_SERVICE_INFRA, GLOBAL_SERVICE_ENV } = useFeatureFlags()
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { templateRef: deploymentTemplateIdentifier, versionLabel } =
    (get(stage, 'stage.spec.customDeploymentRef') as TemplateLinkConfig) || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  const [serviceInputType, setServiceInputType] = React.useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues?.service?.serviceRef)
  )
  const {
    servicesData,
    servicesList,
    loadingServicesData,
    loadingServicesList,
    updatingData,
    prependServiceToServiceList,
    updateServiceInputsData
  } = useGetServicesData({
    gitOpsEnabled,
    serviceIdentifiers: allServices,
    deploymentType: deploymentType as ServiceDefinition['type'],
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {})
  })
  useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDeepCompareEffect(() => {
    if (setupModeType === setupMode.PROPAGATE) {
      setAllServices(getAllFixedServices(initialValues))
    }
  }, [initialValues, setupModeType])

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(servicesList)) {
      return servicesList.map(service => ({ label: service.name, value: service.identifier }))
    }

    return []
  }, [servicesList])

  const loading = loadingServicesList || loadingServicesData

  const updateServiceInputsForServices = React.useCallback(
    (serviceOrServices: Pick<FormState, 'service' | 'services'>): void => {
      /* istanbul ignore else */
      if (formikRef.current && servicesData.length > 0) {
        const { setValues, values } = formikRef.current
        if (serviceOrServices.service) {
          const service = servicesData.find(svc => svc.service.identifier === serviceOrServices.service)

          setValues({
            ...values,
            ...serviceOrServices,
            // if service input is not found, add it, else use the existing one
            serviceInputs: {
              [serviceOrServices.service]: get(
                values.serviceInputs,
                [serviceOrServices.service],
                service?.serviceInputs
              )
            }
          })
          /* istanbul ignore else */
        } else if (Array.isArray(serviceOrServices.services)) {
          const updatedServices = serviceOrServices.services.reduce<ServicesWithInputs>(
            (p, c) => {
              const service = servicesData.find(svc => svc.service.identifier === c.value)

              if (service) {
                p.services.push({ label: service.service.name, value: service.service.identifier })
                // if service input is not found, add it, else use the existing one
                const serviceInputs = get(values.serviceInputs, [service.service.identifier], service?.serviceInputs)

                p.serviceInputs[service.service.identifier] = serviceInputs
              } else {
                p.services.push(c)
              }

              return p
            },
            { services: [], serviceInputs: {}, parallel: values.parallel }
          )

          setValues(updatedServices)
        }
      }
    },
    [servicesData]
  )

  const handleSingleSelectChange = React.useCallback(
    (service: any) => {
      updateServiceInputsForServices({ service: service.value || service })
    },
    [updateServiceInputsForServices]
  )

  const handleMultiSelectChange = React.useCallback(
    (services: SelectOption[]) => {
      updateServiceInputsForServices({ services })
    },
    [updateServiceInputsForServices]
  )

  useEffect(() => {
    /* istanbul ignore else */
    if (!loading && formikRef.current) {
      // update services in formik
      updateServiceInputsForServices(formikRef.current.values)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, servicesList, servicesData])

  function onServiceEntityCreate(newServiceInfo: ServiceYaml): void {
    closeAddNewModal()

    // prepend the new service in the list
    prependServiceToServiceList(newServiceInfo)

    // add the new service to selection
    /* istanbul ignore else */
    if (formikRef.current) {
      const { values, setValues } = formikRef.current
      if (values.services) {
        setValues(
          produce(values, draft => {
            if (Array.isArray(draft.services)) {
              draft.services.push({ label: newServiceInfo.name, value: newServiceInfo.identifier })
            }
          })
        )
      } else {
        setValues(
          produce(values, draft => {
            draft.service = newServiceInfo.identifier
          })
        )
      }
    }
  }

  async function onServiceEntityUpdate(updatedService: ServiceYaml): Promise<void> {
    if (formikRef.current) {
      queryClient.invalidateQueries(['getServicesYamlAndRuntimeInputs'])
      const { values, setValues } = formikRef.current
      const body = {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        serviceIdentifier: updatedService.identifier,
        pathParams: { serviceIdentifier: updatedService.identifier },
        body: yamlStringify(
          sanitize(
            { serviceInputs: { ...get(values, `serviceInputs.${updatedService.identifier}`) } },
            { removeEmptyObject: false, removeEmptyString: false }
          )
        )
      }
      refetchPipelineVariable?.()
      const response = await mergeServiceInputsPromise(body)
      const mergedServiceInputsResponse = response?.data
      setValues({
        ...values,
        serviceInputs: {
          [updatedService.identifier]: yamlParse<JsonNode>(
            defaultTo(mergedServiceInputsResponse?.mergedServiceInputsYaml, '')
          )?.serviceInputs
        }
      })
      updateServiceInputsData(updatedService.identifier, mergedServiceInputsResponse)
    }
  }

  function updateValuesInFomikAndPropogate(values: FormState): void {
    /* istanbul ignore else */
    if (formikRef.current) {
      formikRef.current.setTouched({ service: true, services: true })
      formikRef.current.setValues(values)
    }
  }

  function handleUpdate(values: FormState): void {
    if (setupModeType === setupMode.PROPAGATE) {
      return
    }
    /* istanbul ignore else */
    if (!isNil(values.services)) {
      onUpdate?.({
        services: {
          values: Array.isArray(values.services)
            ? values.services.map(
                (opt): ServiceYamlV2 => ({
                  serviceRef: opt.value as string,
                  serviceInputs: get(values.serviceInputs, opt.value)
                })
              )
            : values.services,
          metadata: {
            parallel: !!values.parallel
          }
        }
      })
    } else if (!isNil(values.service)) {
      const typeOfService = getMultiTypeFromValue(values.service)
      let serviceInputs = undefined

      if (typeOfService === MultiTypeInputType.FIXED) {
        serviceInputs = get(values.serviceInputs, values.service)
      } else if (isMultiTypeRuntime(typeOfService)) {
        serviceInputs = RUNTIME_INPUT_VALUE
      }

      onUpdate?.({
        service: {
          serviceRef: values.service,
          serviceInputs
        }
      })
    }

    setAllServices(getAllFixedServicesFromValues(values))
  }

  function handleSwitchToMultiSvcConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const singleSvcId = formikRef.current.values.service
      const singleSvc = servicesList.find(svc => svc.identifier === singleSvcId)
      const newValues = produce(formikRef.current.values, draft => {
        draft.services = singleSvc ? [{ label: singleSvc.name, value: singleSvc.identifier }] : []
        delete draft.service
      })
      updateValuesInFomikAndPropogate(newValues)
    }

    closeSwitchToMultiSvcDialog()
  }

  function handleSwitchToSingleSvcConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const newValues = produce(formikRef.current.values, draft => {
        draft.service = ''
        delete draft.services
      })
      updateValuesInFomikAndPropogate(newValues)
    }

    closeSwitchToSingleSvcDialog()
  }

  function removeSvcfromList(toDelete: string): void {
    /* istanbul ignore else */
    if (formikRef.current) {
      const newValues = produce(formikRef.current.values, draft => {
        if (draft.service) {
          draft.service = ''
          delete draft.services
        } else if (Array.isArray(draft.services)) {
          draft.services = draft.services.filter(svc => svc.value !== toDelete)
          delete draft.service
        }
      })
      updateValuesInFomikAndPropogate(newValues)
    }
  }

  function getMultiSvcToggleHandler(values: FormState) {
    return (checked: boolean): void => {
      if (checked) {
        // open confirmation dialog only if a service is populated
        if (values.service) {
          openSwitchToMultiSvcDialog()
        } else {
          handleSwitchToMultiSvcConfirmation(true)
        }
      } else {
        // open confirmation dialog only if atleast one service is populated
        if (isEmpty(values.services)) {
          handleSwitchToSingleSvcConfirmation(true)
        } else {
          openSwitchToSingleSvcDialog()
        }
      }
    }
  }

  return (
    <>
      <Formik<FormState>
        formName="deployServiceStepForm"
        onSubmit={noop}
        validate={handleUpdate}
        initialValues={getInitialValues(initialValues)}
        validationSchema={setupModeType === setupMode.DIFFERENT && getValidationSchema(getString)}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
          formikRef.current = formik
          const { values } = formik

          const isMultiSvc = !isNil(values.services)
          const isFixed = isMultiSvc ? Array.isArray(values.services) : serviceInputType === MultiTypeInputType.FIXED
          let placeHolderForServices =
            Array.isArray(values.services) && values.services
              ? getString('services')
              : getString('cd.pipelineSteps.serviceTab.selectServices')
          const placeHolderForService = loading
            ? getString('loading')
            : getString('cd.pipelineSteps.serviceTab.selectService')

          if (loading) {
            placeHolderForServices = getString('loading')
          }

          return (
            <>
              <FormikForm>
                {setupModeType === setupMode.DIFFERENT && (
                  <>
                    <Layout.Horizontal
                      className={css.formRow}
                      spacing="medium"
                      margin={{ bottom: 'medium' }}
                      flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
                    >
                      <Layout.Horizontal
                        spacing="medium"
                        flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                      >
                        {isMultiSvc ? (
                          <>
                            {!GLOBAL_SERVICE_ENV ? (
                              <FormMultiTypeMultiSelectDropDown
                                tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                                label={defaultTo(
                                  serviceLabel,
                                  getString('cd.pipelineSteps.serviceTab.specifyYourServices')
                                )}
                                name="services"
                                disabled={readonly || (isFixed && loading)}
                                onChange={handleMultiSelectChange}
                                dropdownProps={{
                                  items: selectOptions,
                                  placeholder: placeHolderForServices,
                                  disabled: loading || readonly
                                }}
                                multiTypeProps={{
                                  width: 300,
                                  expressions,
                                  allowableTypes
                                }}
                                enableConfigureOptions
                              />
                            ) : (
                              <MultiTypeServiceField
                                name="services"
                                label={defaultTo(
                                  serviceLabel,
                                  getString('cd.pipelineSteps.serviceTab.specifyYourServices')
                                )}
                                deploymentType={deploymentType as ServiceDeploymentType}
                                gitOpsEnabled={gitOpsEnabled}
                                disabled={readonly || (isFixed && loading)}
                                placeholder={placeHolderForServices}
                                openAddNewModal={openAddNewModal}
                                isMultiSelect={true}
                                onMultiSelectChange={handleMultiSelectChange}
                                width={300}
                                multiTypeProps={{
                                  expressions,
                                  allowableTypes,
                                  onTypeChange: setServiceInputType
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <div className={css.inputFieldLayout}>
                            {GLOBAL_SERVICE_ENV ? (
                              <MultiTypeServiceField
                                name="service"
                                label={defaultTo(
                                  serviceLabel,
                                  getString('cd.pipelineSteps.serviceTab.specifyYourService')
                                )}
                                deploymentType={deploymentType as ServiceDeploymentType}
                                gitOpsEnabled={gitOpsEnabled}
                                placeholder={placeHolderForService}
                                setRefValue={true}
                                disabled={readonly || (isFixed && loading)}
                                openAddNewModal={openAddNewModal}
                                onChange={handleSingleSelectChange}
                                width={300}
                                multiTypeProps={{
                                  expressions,
                                  allowableTypes,
                                  defaultValueToReset: '',
                                  onTypeChange: setServiceInputType
                                }}
                              />
                            ) : (
                              <FormInput.MultiTypeInput
                                tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                                label={defaultTo(
                                  serviceLabel,
                                  getString('cd.pipelineSteps.serviceTab.specifyYourService')
                                )}
                                name="service"
                                useValue
                                disabled={readonly || (isFixed && loading)}
                                placeholder={placeHolderForService}
                                multiTypeInputProps={{
                                  width: 300,
                                  expressions,
                                  selectProps: { items: selectOptions },
                                  allowableTypes,
                                  defaultValueToReset: '',
                                  onTypeChange: setServiceInputType,
                                  onChange: handleSingleSelectChange
                                }}
                                selectItems={selectOptions}
                              />
                            )}
                            {getMultiTypeFromValue(formik?.values.service) === MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                className={css.configureOptions}
                                style={{ alignSelf: 'center' }}
                                value={defaultTo(formik?.values.service, '')}
                                type="String"
                                variableName="service"
                                showRequiredField={false}
                                showDefaultField={true}
                                showAdvanced={true}
                                onChange={value => {
                                  formik.setFieldValue('service', value)
                                }}
                              />
                            )}
                          </div>
                        )}
                        {isFixed ? (
                          <RbacButton
                            size={ButtonSize.SMALL}
                            icon={'plus'}
                            text={getString('cd.addService')}
                            variation={ButtonVariation.LINK}
                            data-testid="add-new-service"
                            disabled={readonly}
                            className={css.serviceActionWrapper}
                            permission={{
                              permission: PermissionIdentifier.EDIT_SERVICE,
                              resource: {
                                resourceType: ResourceType.SERVICE
                              }
                            }}
                            onClick={openAddNewModal}
                          />
                        ) : null}
                      </Layout.Horizontal>
                      {MULTI_SERVICE_INFRA ? (
                        <Toggle
                          className={css.serviceActionWrapper}
                          checked={isMultiSvc}
                          onToggle={getMultiSvcToggleHandler(values)}
                          label={getString('cd.pipelineSteps.serviceTab.multiServicesText')}
                          tooltipId={'multiServiceToggle'}
                        />
                      ) : null}
                    </Layout.Horizontal>

                    {isMultiSvc ? (
                      <FormInput.CheckBox
                        label={getString('cd.pipelineSteps.serviceTab.multiServicesParallelDeployLabel')}
                        name="parallel"
                      />
                    ) : null}
                  </>
                )}

                {isFixed || setupModeType === setupMode.PROPAGATE ? (
                  <ServiceEntitiesList
                    loading={loading || updatingData}
                    servicesData={allServices.length > 0 ? servicesData : []}
                    gitOpsEnabled={gitOpsEnabled}
                    readonly={readonly}
                    onRemoveServiceFormList={removeSvcfromList}
                    selectedDeploymentType={deploymentType as ServiceDeploymentType}
                    stageIdentifier={stageIdentifier}
                    allowableTypes={allowableTypes}
                    onServiceEntityUpdate={onServiceEntityUpdate}
                    isMultiSvc={isMultiSvc}
                    isPropogateFromStage={setupModeType === setupMode.PROPAGATE}
                  />
                ) : null}
              </FormikForm>
            </>
          )
        }}
      </Formik>
      <Dialog isOpen={isAddNewModalOpen} onClose={closeAddNewModal} title={getString('newService')} {...DIALOG_PROPS}>
        <ServiceEntityEditModal
          selectedDeploymentType={deploymentType as ServiceDeploymentType}
          gitOpsEnabled={gitOpsEnabled}
          onCloseModal={closeAddNewModal}
          onServiceCreate={onServiceEntityCreate}
          isServiceCreateModalView={true}
        />
      </Dialog>
      <ConfirmationDialog
        isOpen={isSwitchToMultiSvcDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.multiServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.multiServicesConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToMultiSvcConfirmation}
        intent={Intent.WARNING}
      />
      <ConfirmationDialog
        isOpen={isSwitchToSingleSvcDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.singleServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.singleServicesConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToSingleSvcConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
