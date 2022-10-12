/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { defaultTo, get, isEmpty, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import cx from 'classnames'
import {
  Button,
  Formik,
  Layout,
  FormInput,
  ButtonVariation,
  SelectOption,
  Text,
  Container,
  VisualYamlToggle,
  VisualYamlSelectedView as SelectedView,
  useToaster,
  Tabs,
  Tab,
  MultiTypeInputType,
  AllowedTypesWithRunTime
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  ManifestConfigWrapper,
  NGServiceOverrideConfig,
  ServiceOverrideResponseDTO,
  ServiceResponse,
  useUpsertServiceOverride
} from 'services/cd-ng'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { EnvironmentPathProps, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { AzureWebAppSelectionTypes } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceConfiguration/AzureWebAppServiceConfig.types'
import ApplicationConfigSelection from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceConfiguration/AzureWebAppServiceConfigSelection'
import ServiceVariableOverride from './ServiceVariableOverride'
import ServiceManifestOverride from './ServiceManifestOverride/ServiceManifestOverride'
import { ServiceOverrideTab } from './ServiceOverridesUtils'
import type { AddEditServiceOverrideFormProps, VariableOverride } from './ServiceOverridesInterface'
import ServiceConfigFileOverride from './ServiceConfigFileOverride/ServiceConfigFileOverride'
import css from './ServiceOverrides.module.scss'

export interface AddEditServiceOverrideProps {
  selectedService: string | null
  services: ServiceResponse[]
  serviceOverrides?: ServiceOverrideResponseDTO[] | null
  closeModal: (updateServiceOverride?: boolean) => void
  defaultTab: string
  isReadonly: boolean
  expressions: string[]
}
type OverrideTypes =
  | VariableOverride
  | ManifestConfigWrapper
  | ConfigFileWrapper
  | ApplicationSettingsConfiguration
  | ConnectionStringsConfiguration

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `serviceOverrides.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 350,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export default function AddEditServiceOverride({
  selectedService,
  services,
  closeModal,
  serviceOverrides,
  defaultTab,
  isReadonly,
  expressions
}: AddEditServiceOverrideProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    PipelinePathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const formikRef = useRef<FormikProps<AddEditServiceOverrideFormProps>>()
  const allowableTypes: AllowedTypesWithRunTime[] = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ]

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [isModified, setIsModified] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState(defaultTo(defaultTab, ServiceOverrideTab.VARIABLE))

  const selectedServiceOverride = serviceOverrides?.find(
    svcOverride => svcOverride.serviceRef === defaultTo(selectedService, formikRef.current?.values.serviceRef)
  )

  const getServiceType = (serviceRef: string | null): string | undefined => {
    const service = services?.find(ser => ser?.service?.identifier === serviceRef)?.service
    const parsedService = service?.yaml && parse(service?.yaml)

    return parsedService?.service?.serviceDefinition?.type
  }

  const [serviceType, setServiceType] = useState<string | undefined>(getServiceType(selectedService))

  const servicesOptions = useMemo(() => {
    return services.map(item => ({
      label: defaultTo(item.service?.name, ''),
      value: defaultTo(item.service?.identifier, '')
    }))
  }, [services])

  const { mutate: upsertServiceOverride, loading: upsertServiceOverrideLoading } = useUpsertServiceOverride({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleServiceChange = (item: SelectOption): void => {
    const serviceOverride = serviceOverrides?.find(svcOverride => svcOverride.serviceRef === item.value)

    setServiceType(getServiceType(item?.value as string))
    setSelectedTab(defaultTo(defaultTab, ServiceOverrideTab.VARIABLE))

    const selectedSvcVariable = !isEmpty(serviceOverride) ? getOverrideObject('variables', serviceOverride) : []
    formikRef.current?.setFieldValue('variables', selectedSvcVariable)
    const selectedSvcManifest = !isEmpty(serviceOverride) ? getOverrideObject('manifests', serviceOverride) : []
    formikRef.current?.setFieldValue('manifests', selectedSvcManifest)
    const selectedSvcConfigFiles = !isEmpty(serviceOverride) ? getOverrideObject('configFiles', serviceOverride) : []
    formikRef.current?.setFieldValue('configFiles', selectedSvcConfigFiles)
    const selectedSvcApplicationSettings = !isEmpty(serviceOverride)
      ? getOverrideObject('applicationSettings', serviceOverride)
      : undefined
    formikRef.current?.setFieldValue('applicationSettings', selectedSvcApplicationSettings)
    const selectedSvcConnectionStrings = !isEmpty(serviceOverride)
      ? getOverrideObject('connectionStrings', serviceOverride)
      : undefined
    formikRef.current?.setFieldValue('connectionStrings', selectedSvcConnectionStrings)
  }

  const handleModeSwitch = useCallback(
    /* istanbul ignore next */ (view: SelectedView) => {
      if (view === SelectedView.YAML && !formikRef.current?.values?.serviceRef) {
        showError('Please select a service first')
        return
      }
      setSelectedView(view)
    },
    [showError]
  )

  /**********************************************Service Override CRUD Operations ************************************************/
  const getOverrideObject = (
    type: string,
    svcOverride?: ServiceOverrideResponseDTO
  ): Array<any> | ApplicationSettingsConfiguration | ConnectionStringsConfiguration | undefined => {
    const serviceOverrideData = defaultTo(svcOverride, selectedServiceOverride)
    if (!isEmpty(serviceOverrideData)) {
      const parsedServiceOverride = yamlParse<NGServiceOverrideConfig>(
        defaultTo(serviceOverrideData?.yaml, '')
      ).serviceOverrides
      return defaultTo(
        get(parsedServiceOverride, `${type}`),
        type === 'applicationSettings' || type === 'connectionStrings' ? undefined : []
      )
    }
    return type === 'applicationSettings' || type === 'connectionStrings' ? undefined : []
  }

  const getOverrideValues = (
    type: string
  ): Array<OverrideTypes> | ApplicationSettingsConfiguration | ConnectionStringsConfiguration | undefined => {
    const formikOverrideData = get(formikRef.current?.values, `${type}`)
    if (
      (Array.isArray(formikOverrideData) && formikOverrideData?.length) ||
      (!Array.isArray(formikOverrideData) && formikOverrideData)
    ) {
      return formikOverrideData
    }
    return getOverrideObject(type)
  }

  const getOverrideFormdata = (
    values: AddEditServiceOverrideFormProps,
    type: string
  ): Array<OverrideTypes> | undefined => {
    if (selectedView === SelectedView.YAML) {
      return get(values, `${type}`)
    }
    return !isEmpty(get(formikRef.current?.values, `${type}`)) ? get(formikRef.current?.values, `${type}`) : undefined
  }

  const handleOverrideSubmit = useCallback((overrideObj: OverrideTypes, index: number, type: string): void => {
    switch (type) {
      case 'applicationSettings':
      case 'connectionStrings':
        formikRef.current?.setFieldValue(`${type}`, overrideObj)
        break
      default: {
        const overrideDefaultValue = [...get(formikRef.current?.values, `${type}`)]
        if (overrideDefaultValue?.length) {
          overrideDefaultValue.splice(index, 1, overrideObj)
        } else {
          overrideDefaultValue.push(overrideObj)
        }
        formikRef.current?.setFieldValue(`${type}`, overrideDefaultValue)
        break
      }
    }
  }, [])

  const onServiceOverrideDelete = useCallback((index: number, type: string): void => {
    switch (type) {
      case 'applicationSettings':
      case 'connectionStrings':
        formikRef.current?.setFieldValue(`${type}`, null)
        break
      default:
        {
          const overrideDefaultValue = [...get(formikRef.current?.values, `${type}`)]
          overrideDefaultValue.splice(index, 1)
          formikRef.current?.setFieldValue(`${type}`, overrideDefaultValue)
        }
        break
    }
  }, [])
  /**********************************************Service Override CRUD Operations ************************************************/

  const onSubmit = async (values: AddEditServiceOverrideFormProps): Promise<void> => {
    try {
      const response = await upsertServiceOverride({
        environmentIdentifier,
        serviceIdentifier: values.serviceRef as string,
        orgIdentifier,
        projectIdentifier,
        yaml: yamlStringify({
          serviceOverrides: {
            environmentRef: environmentIdentifier,
            serviceRef: values.serviceRef,
            variables: getOverrideFormdata(values, 'variables'),
            manifests: getOverrideFormdata(values, 'manifests'),
            configFiles: getOverrideFormdata(values, 'configFiles'),
            applicationSettings: getOverrideFormdata(values, 'applicationSettings'),
            connectionStrings: getOverrideFormdata(values, 'connectionStrings')
          }
        } as NGServiceOverrideConfig)
      })

      if (response.status === 'SUCCESS') {
        closeModal(true)
      } else {
        throw response
      }
    } catch (e) {
      showError(getRBACErrorMessage(e))
    }
  }

  const existingJSON = useMemo(() => {
    return {
      serviceOverrides: {
        environmentRef: environmentIdentifier,
        serviceRef: formikRef.current?.values.serviceRef,
        variables: getOverrideValues('variables'),
        manifests: getOverrideValues('manifests'),
        configFiles: getOverrideValues('configFiles'),
        applicationSettings: getOverrideValues('applicationSettings'),
        connectionStrings: getOverrideValues('connectionStrings')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef.current])

  const handleYamlChange = useCallback((): void => {
    const parsedYaml = parse(defaultTo(yamlHandler?.getLatestYaml(), '{}'))
    if (isEqual(existingJSON, parsedYaml)) {
      setIsModified(false)
    } else {
      setIsModified(true)
    }
  }, [existingJSON, yamlHandler])

  const handleTabChange = (nextTab: ServiceOverrideTab): void => {
    setSelectedTab(nextTab)
  }

  const isSubmitBtnDisabled = (): boolean => {
    if (upsertServiceOverrideLoading) {
      return true
    }
    if (selectedView === SelectedView.YAML) {
      return !isModified
    } else {
      if (formikRef.current) {
        if (selectedTab === ServiceOverrideTab.VARIABLE) {
          return !(Array.isArray(formikRef.current?.values.variables) && formikRef.current.values.variables.length > 0)
        } else if (selectedTab === ServiceOverrideTab.MANIFEST) {
          return !(Array.isArray(formikRef.current?.values.manifests) && formikRef.current.values.manifests.length > 0)
        } else if (selectedTab === ServiceOverrideTab.CONFIG) {
          return !(
            Array.isArray(formikRef.current?.values.configFiles) && formikRef.current.values.configFiles.length > 0
          )
        } else if (selectedTab === ServiceOverrideTab.APPLICATIONSETTING) {
          return !formikRef.current?.values?.applicationSettings
        } else if (selectedTab === ServiceOverrideTab.CONNECTIONSTRING) {
          return !formikRef.current?.values?.connectionStrings
        }
      }
      return false
    }
  }

  return (
    <Formik<AddEditServiceOverrideFormProps>
      formName="addEditServiceOverrideForm"
      initialValues={{
        serviceRef: selectedService,
        environmentRef: environmentIdentifier,
        variables: getOverrideObject('variables') as VariableOverride[],
        manifests: getOverrideObject('manifests') as ManifestConfigWrapper[],
        configFiles: getOverrideObject('configFiles') as ConfigFileWrapper[],
        applicationSettings: getOverrideObject('applicationSettings') as ApplicationSettingsConfiguration,
        connectionStrings: getOverrideObject('connectionStrings') as ConnectionStringsConfiguration
      }}
      onSubmit={
        /* istanbul ignore next */ values => {
          onSubmit?.({
            ...values
          })
        }
      }
    >
      {formikProps => {
        formikRef.current = formikProps
        return (
          <div
            className={cx({
              [css.serviceOverrideDialog]: isEmpty(selectedService)
            })}
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'medium' }}>
              <VisualYamlToggle
                selectedView={selectedView}
                onChange={nextMode => {
                  handleModeSwitch(nextMode)
                }}
              />
            </Layout.Horizontal>
            {selectedView === SelectedView.VISUAL ? (
              <Container>
                <FormInput.Select
                  name="serviceRef"
                  items={servicesOptions}
                  label={getString('service')}
                  placeholder={getString('common.selectName', { name: getString('service') })}
                  onChange={item => handleServiceChange(item)}
                  disabled={!isEmpty(selectedService)}
                />
                {!isEmpty(formikProps.values?.serviceRef) && (
                  <>
                    <Text>{getString('cd.overrideType')}</Text>
                    <Tabs id="serviceOverrideTab" selectedTabId={selectedTab} onChange={handleTabChange}>
                      <Tab
                        id={ServiceOverrideTab.VARIABLE}
                        title={getString('variableLabel')}
                        panel={
                          <ServiceVariableOverride
                            variableOverrides={defaultTo(formikProps.values?.variables, [])}
                            selectedService={formikProps.values?.serviceRef as string}
                            serviceList={services}
                            handleVariableSubmit={(variableObj, index) =>
                              handleOverrideSubmit(variableObj, index, 'variables')
                            }
                            onServiceVarDelete={index => onServiceOverrideDelete(index, 'variables')}
                            isReadonly={isReadonly}
                          />
                        }
                      />
                      {serviceType !== 'AzureWebApp' && (
                        <Tab
                          id={ServiceOverrideTab.MANIFEST}
                          title={getString('manifestsText')}
                          panel={
                            <ServiceManifestOverride
                              manifestOverrides={
                                defaultTo(formikProps.values?.manifests, []) as ManifestConfigWrapper[]
                              }
                              handleManifestOverrideSubmit={(manifestObj, index) =>
                                handleOverrideSubmit(manifestObj, index, 'manifests')
                              }
                              removeManifestConfig={index => onServiceOverrideDelete(index, 'manifests')}
                              isReadonly={isReadonly}
                              expressions={expressions}
                              allowableTypes={allowableTypes}
                            />
                          }
                        />
                      )}

                      <Tab
                        id={ServiceOverrideTab.CONFIG}
                        title={getString('cd.configFileStoreTitle')}
                        panel={
                          <ServiceConfigFileOverride
                            fileOverrides={defaultTo(formikProps.values?.configFiles, [])}
                            selectedService={formikProps.values?.serviceRef as string}
                            serviceList={services}
                            allowableTypes={allowableTypes}
                            handleConfigFileOverrideSubmit={(filesObj, index) =>
                              handleOverrideSubmit(filesObj, index, 'configFiles')
                            }
                            handleServiceFileDelete={index => onServiceOverrideDelete(index, 'configFiles')}
                            isReadonly={isReadonly}
                            expressions={expressions}
                          />
                        }
                      />
                      {serviceType === 'AzureWebApp' && (
                        <Tab
                          id={ServiceOverrideTab.APPLICATIONSETTING}
                          title={getString('pipeline.appServiceConfig.applicationSettings.name')}
                          panel={
                            <ApplicationConfigSelection
                              environmentAllowableTypes={allowableTypes}
                              readonly={isReadonly}
                              showApplicationSettings={true}
                              data={formikProps.values?.applicationSettings}
                              selectionType={AzureWebAppSelectionTypes.SERVICE_OVERRIDE_WIDGET}
                              handleSubmitConfig={(
                                config: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
                              ) => handleOverrideSubmit(config, 0, 'applicationSettings')}
                              handleDeleteConfig={index => onServiceOverrideDelete(index, 'applicationSettings')}
                            />
                          }
                        />
                      )}
                      {serviceType === 'AzureWebApp' && (
                        <Tab
                          id={ServiceOverrideTab.CONNECTIONSTRING}
                          title={getString('pipeline.appServiceConfig.connectionStrings.name')}
                          panel={
                            <ApplicationConfigSelection
                              environmentAllowableTypes={allowableTypes}
                              readonly={isReadonly}
                              showConnectionStrings={true}
                              data={formikProps.values?.connectionStrings}
                              selectionType={AzureWebAppSelectionTypes.SERVICE_OVERRIDE_WIDGET}
                              handleSubmitConfig={(
                                config: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
                              ) => handleOverrideSubmit(config, 0, 'connectionStrings')}
                              handleDeleteConfig={index => onServiceOverrideDelete(index, 'connectionStrings')}
                            />
                          }
                        />
                      )}
                    </Tabs>
                  </>
                )}
              </Container>
            ) : (
              <YAMLBuilder
                {...yamlBuilderReadOnlyModeProps}
                existingJSON={existingJSON}
                bind={setYamlHandler}
                showSnippetSection={false}
                onChange={handleYamlChange}
              />
            )}
            <Layout.Horizontal spacing="medium" padding={{ top: 'xxlarge' }}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                onClick={
                  /* istanbul ignore next */ () => {
                    if (selectedView === SelectedView.YAML) {
                      const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                      onSubmit(parse(latestYaml)?.serviceOverrides)
                    } else {
                      formikProps.submitForm()
                    }
                  }
                }
                data-testid="addVariableSave"
                disabled={isSubmitBtnDisabled()}
                permission={
                  formikRef.current.values.serviceRef
                    ? {
                        resource: {
                          resourceType: ResourceType.SERVICE,
                          resourceIdentifier: formikRef.current.values.serviceRef as string
                        },
                        permission: PermissionIdentifier.EDIT_SERVICE
                      }
                    : undefined
                }
              />
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => closeModal()}
                data-testid="addVariableCancel"
                disabled={upsertServiceOverrideLoading}
              />
            </Layout.Horizontal>
          </div>
        )
      }}
    </Formik>
  )
}
