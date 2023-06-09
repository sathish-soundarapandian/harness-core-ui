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
  Layout,
  MultiTypeInputType,
  FormikForm,
  AllowedTypes,
  Toggle,
  useToggleOpen,
  ConfirmationDialog,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  ModalDialog,
  useToaster
} from '@harness/uicore'
import type { ModalDialogProps } from '@harness/uicore/dist/components/ModalDialog/ModalDialog'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Intent } from '@blueprintjs/core'
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
import { isMultiTypeExpression, isMultiTypeRuntime, isValueExpression, isValueRuntimeInput } from '@common/utils/utils'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { useDeepCompareEffect } from '@common/hooks'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
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

const DIALOG_PROPS: Omit<ModalDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.editServiceDialog,
  lazy: true,
  height: 840,
  width: 1114
}

function getInitialValues(data: DeployServiceEntityData): FormState {
  const parallelValue = defaultTo(
    get(data, 'services.metadata.parallel', true),
    !!get(data, 'services.metadata.parallel', true)
  )
  if (data.service && data.service.serviceRef) {
    return {
      service: data.service.serviceRef,
      serviceInputs:
        getMultiTypeFromValue(data.service.serviceRef) === MultiTypeInputType.FIXED
          ? { [data.service.serviceRef]: data.service.serviceInputs }
          : isValueExpression(data.service.serviceRef)
          ? { service: { expression: data.service.serviceInputs } }
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

        parallel: parallelValue
      }
    }

    return {
      services: data.services.values,
      serviceInputs: {},
      parallel: parallelValue
    }
  }

  return { parallel: parallelValue }
}

export default function DeployServiceEntityWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceLabel,
  deploymentType,
  gitOpsEnabled,
  deploymentMetadata,
  stageIdentifier,
  setupModeType
}: DeployServiceEntityWidgetProps): React.ReactElement {
  const [isFetchingMergeServiceInputs, setIsFetchingMergeServiceInputs] = React.useState<boolean>(false)

  const { getString } = useStrings()
  const { showWarning } = useToaster()

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
    isOpen: isSwitchToMultiSvcClearDialogOpen,
    open: openSwitchToMultiSvcClearDialog,
    close: closeSwitchToMultiSvcClearDialog
  } = useToggleOpen()
  const {
    isOpen: isSwitchToSingleSvcDialogOpen,
    open: openSwitchToSingleSvcDialog,
    close: closeSwitchToSingleSvcDialog
  } = useToggleOpen()
  const [allServices, setAllServices] = useState(
    setupModeType === setupMode.DIFFERENT ? getAllFixedServices(initialValues) : ['']
  )
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()
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
    nonExistingServiceIdentifiers
  } = useGetServicesData({
    gitOpsEnabled,
    deploymentMetadata,
    serviceIdentifiers: allServices,
    deploymentType: deploymentType as ServiceDefinition['type'],
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {}),
    lazyService: isMultiTypeExpression(serviceInputType)
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

  useDeepCompareEffect(() => {
    if (nonExistingServiceIdentifiers.length) {
      showWarning(
        getString('cd.identifiersDoNotExist', {
          entity: getString('service'),
          nonExistingIdentifiers: nonExistingServiceIdentifiers.join(', ')
        })
      )
    }
  }, [nonExistingServiceIdentifiers])

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(servicesList)) {
      return servicesList.map(service => ({ label: service.name, value: service.identifier }))
    }

    return []
  }, [servicesList])

  const loading = loadingServicesList || loadingServicesData || isFetchingMergeServiceInputs

  const updateServiceInputsForServices = React.useCallback(
    (serviceOrServices: Pick<FormState, 'service' | 'services'>): void => {
      /* istanbul ignore else */
      if (formikRef.current && servicesData.length > 0) {
        const { setValues, values } = formikRef.current
        if (serviceOrServices.service) {
          const service = servicesData.find(svc => getScopedValueFromDTO(svc.service) === serviceOrServices.service)
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
              const service = servicesData.find(svc => getScopedValueFromDTO(svc.service) === c.value)

              if (service) {
                p.services.push({ label: service.service.name, value: c.value })
                // if service input is not found, add it, else use the existing one
                const serviceInputs = get(values.serviceInputs, [c.value], service?.serviceInputs)

                p.serviceInputs[c.value as string] = serviceInputs
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

    const scopedServiceRef = getScopedValueFromDTO({
      projectIdentifier,
      orgIdentifier,
      identifier: newServiceInfo.identifier
    })
    if (formikRef.current) {
      const { values, setValues } = formikRef.current
      if (values.services) {
        setValues(
          produce(values, draft => {
            if (Array.isArray(draft.services)) {
              draft.services.push({ label: newServiceInfo.name, value: scopedServiceRef })
            }
          })
        )
      } else {
        setValues(
          produce(values, draft => {
            draft.service = scopedServiceRef
          })
        )
      }
    }
  }

  async function onServiceEntityUpdate(updatedService: ServiceYaml): Promise<void> {
    if (formikRef.current) {
      const { values, setValues } = formikRef.current

      const scope = getScopeFromValue(values?.service as string)
      const body = {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
          projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined
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

      // Introduced this loading state so that ServiceEntitiesList's JSX is mounted
      // only after mergeServiceInputsPromise returns data
      setIsFetchingMergeServiceInputs(true)
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
      setIsFetchingMergeServiceInputs(false)
    }
  }

  function updateValuesInFormikAndPropagate(values: FormState): void {
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
            parallel: defaultTo(values.parallel, !!values.parallel)
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
      } else if (isMultiTypeExpression(typeOfService)) {
        serviceInputs = get(values.serviceInputs, 'service.expression')
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
        draft.services = singleSvc
          ? [{ label: singleSvc.name, value: singleSvc.identifier }]
          : isValueRuntimeInput(singleSvcId)
          ? (RUNTIME_INPUT_VALUE as any)
          : []
        delete draft.service
      })

      setServiceInputType(getMultiTypeFromValue(singleSvcId))
      updateValuesInFormikAndPropagate(newValues)
    }

    closeSwitchToMultiSvcDialog()
  }

  function handleSwitchToMultiSvcClearConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const newValues = produce(formikRef.current.values, draft => {
        draft.parallel = true
        draft.services = []
        draft.serviceInputs = {}
        delete draft.service
      })

      setServiceInputType(MultiTypeInputType.FIXED)
      updateValuesInFormikAndPropagate(newValues)
    }

    closeSwitchToMultiSvcClearDialog()
  }

  function handleSwitchToSingleSvcConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const newValues = produce(formikRef.current.values, draft => {
        draft.service = ''
        delete draft.services
      })
      updateValuesInFormikAndPropagate(newValues)
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
      updateValuesInFormikAndPropagate(newValues)
    }
  }

  function getMultiSvcToggleHandler(values: FormState) {
    return (checked: boolean): void => {
      if (checked) {
        // open confirmation dialog only if a service is populated
        if (values.service) {
          if (isValueExpression(values.service)) {
            openSwitchToMultiSvcClearDialog()
          } else {
            openSwitchToMultiSvcDialog()
          }
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
            Array.isArray(values.services) && !isEmpty(values.services)
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
                            {!CDS_OrgAccountLevelServiceEnvEnvGroup ? (
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
                                  allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
                                }}
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
                                deploymentMetadata={deploymentMetadata}
                                disabled={readonly || (isFixed && loading)}
                                placeholder={placeHolderForServices}
                                openAddNewModal={openAddNewModal}
                                isMultiSelect={true}
                                isNewConnectorLabelVisible
                                onMultiSelectChange={handleMultiSelectChange}
                                width={300}
                                multiTypeProps={{
                                  expressions,
                                  allowableTypes: getAllowableTypesWithoutExpression(allowableTypes),
                                  onTypeChange: setServiceInputType
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <div className={css.inputFieldLayout}>
                            {CDS_OrgAccountLevelServiceEnvEnvGroup ? (
                              <MultiTypeServiceField
                                name="service"
                                label={defaultTo(
                                  serviceLabel,
                                  getString('cd.pipelineSteps.serviceTab.specifyYourService')
                                )}
                                deploymentType={deploymentType as ServiceDeploymentType}
                                gitOpsEnabled={gitOpsEnabled}
                                deploymentMetadata={deploymentMetadata}
                                placeholder={placeHolderForService}
                                setRefValue={true}
                                disabled={readonly || (isFixed && loading)}
                                openAddNewModal={openAddNewModal}
                                isNewConnectorLabelVisible
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
                      <Toggle
                        className={css.serviceActionWrapper}
                        checked={isMultiSvc}
                        onToggle={getMultiSvcToggleHandler(values)}
                        label={getString('cd.pipelineSteps.serviceTab.multiServicesText')}
                        tooltipId={'multiServiceToggle'}
                      />
                    </Layout.Horizontal>

                    {isMultiSvc ? (
                      <FormMultiTypeCheckboxField
                        label={getString('cd.pipelineSteps.serviceTab.multiServicesParallelDeployLabel')}
                        name="parallel"
                        multiTypeTextbox={{
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                          width: 300
                        }}
                        style={{ width: '300px' }}
                      />
                    ) : null}
                  </>
                )}

                {isFixed || setupModeType === setupMode.PROPAGATE ? (
                  <ServiceEntitiesList
                    loading={loading || updatingData}
                    servicesData={allServices.length > 0 ? servicesData : []}
                    gitOpsEnabled={gitOpsEnabled}
                    deploymentMetadata={deploymentMetadata}
                    readonly={readonly}
                    onRemoveServiceFormList={removeSvcfromList}
                    selectedDeploymentType={deploymentType as ServiceDeploymentType}
                    stageIdentifier={stageIdentifier}
                    allowableTypes={allowableTypes}
                    onServiceEntityUpdate={onServiceEntityUpdate}
                    isPropogateFromStage={setupModeType === setupMode.PROPAGATE}
                  />
                ) : null}
              </FormikForm>
            </>
          )
        }}
      </Formik>
      <ModalDialog
        isOpen={isAddNewModalOpen}
        onClose={closeAddNewModal}
        title={getString('newService')}
        {...DIALOG_PROPS}
      >
        <ServiceEntityEditModal
          selectedDeploymentType={deploymentType as ServiceDeploymentType}
          gitOpsEnabled={gitOpsEnabled}
          deploymentMetadata={deploymentMetadata}
          onCloseModal={closeAddNewModal}
          onServiceCreate={onServiceEntityCreate}
          isServiceCreateModalView={true}
        />
      </ModalDialog>
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
        isOpen={isSwitchToMultiSvcClearDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.multiServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.multiServicesClearConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToMultiSvcClearConfirmation}
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
