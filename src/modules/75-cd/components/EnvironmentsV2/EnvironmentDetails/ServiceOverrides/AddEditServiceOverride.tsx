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
  Tab
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ManifestConfigWrapper,
  NGServiceConfig,
  NGServiceOverrideConfig,
  NGVariable,
  ServiceOverrideResponseDTO,
  ServiceResponse,
  useUpsertServiceOverride
} from 'services/cd-ng'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { EnvironmentPathProps, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { AllNGVariables } from '@pipeline/utils/types'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import ServiceVariableOverride from './ServiceVariableOverride'
import ServiceManifestOverride from './ServiceManifestOverride/ServiceManifestOverride'
import { getValidationSchema, ServiceOverrideTab } from './ServiceOverridesUtils'
import type { AddEditServiceOverrideFormProps, VariableState } from './ServiceOverridesInterface'
import css from './ServiceOverrides.module.scss'

export interface AddEditServiceOverrideProps {
  selectedVariable: VariableState | null
  services: ServiceResponse[]
  serviceOverrides?: ServiceOverrideResponseDTO[] | null
  closeModal: (updateServiceOverride?: boolean) => void
  defaultTab: string
  isReadonly: boolean
}

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
  selectedVariable,
  services,
  closeModal,
  serviceOverrides,
  defaultTab,
  isReadonly
}: AddEditServiceOverrideProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    PipelinePathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const formikRef = useRef<FormikProps<AddEditServiceOverrideFormProps>>()
  const isServiceManifestEnabled = useFeatureFlag(FeatureFlag.NG_SERVICE_MANIFEST_OVERRIDE)

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [isModified, setIsModified] = useState<boolean>(false)
  const [serviceVariables, setServiceVariables] = useState<NGVariable[]>([])
  const [selectedTab, setSelectedTab] = useState(defaultTo(defaultTab, ServiceOverrideTab.VARIABLE))

  const selectedServiceOverride = serviceOverrides?.find(
    svcOverride =>
      svcOverride.serviceRef === defaultTo(selectedVariable?.serviceRef, formikRef.current?.values.serviceRef)
  )
  const getVariableOptions = (): SelectOption[] => {
    if (!isEmpty(selectedVariable?.serviceRef)) {
      if (isEmpty(selectedVariable?.variable?.name)) {
        if (!isEmpty(selectedServiceOverride)) {
          const parsedServiceOverride = yamlParse<NGServiceOverrideConfig>(
            defaultTo(selectedServiceOverride?.yaml, '')
          ).serviceOverrides
          const serviceVars = defaultTo(parsedServiceOverride?.variables, [])
          return serviceVars?.map(variable => ({
            label: defaultTo(variable.name, ''),
            value: defaultTo(variable.name, '')
          }))
        }
      }
      return [
        {
          label: defaultTo(selectedVariable?.variable?.name, ''),
          value: defaultTo(selectedVariable?.variable?.name, '')
        }
      ]
    }
    return []
  }
  const [variablesOptions, setVariablesOptions] = useState<SelectOption[]>(getVariableOptions())

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
    const serviceSelected = services.find(serviceObj => serviceObj.service?.identifier === item.value)
    // istanbul ignore else
    if (serviceSelected) {
      const parsedServiceYaml = defaultTo(
        yamlParse(defaultTo(serviceSelected?.service?.yaml, '{}')),
        ''
      ) as NGServiceConfig
      const serviceVars = defaultTo(parsedServiceYaml?.service?.serviceDefinition?.spec?.variables, [])
      setServiceVariables(serviceVars)
      setVariablesOptions(
        defaultTo(
          serviceVars?.map(variable => ({
            label: defaultTo(variable.name, ''),
            value: defaultTo(variable.name, '')
          })),
          []
        )
      )
    }
  }

  const handleVariableChange = (item: SelectOption): void => {
    const variableSelected = serviceVariables?.find(serviceVariable => serviceVariable.name === item.value)
    if (variableSelected) {
      // istanbul ignore else
      if (variableSelected?.name === formikRef.current?.values?.variableOverride?.name) return
      formikRef.current?.setFieldValue('variableOverride', {
        name: variableSelected?.name,
        value: (variableSelected as AllNGVariables)?.value,
        type: variableSelected?.type
      })
    } else {
      formikRef.current?.setFieldValue('variableOverride', {
        name: item.value,
        value: item.value,
        type: 'String'
      })
      setServiceVariables([
        ...serviceVariables,
        {
          name: item.label,
          value: item.value,
          type: 'String'
        } as NGVariable
      ])
      setVariablesOptions([...variablesOptions, { label: item.label, value: item.value }])
    }
  }

  const handleModeSwitch = useCallback(
    /* istanbul ignore next */ (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
        const yamlVisual = (parse(yaml) as NGServiceOverrideConfig).serviceOverrides

        // istanbul ignore else
        if (yamlVisual) {
          formikRef.current?.setValues({
            ...yamlVisual,
            variables: undefined,
            variableOverride: yamlVisual.variables?.[defaultTo(yamlVisual.variables?.length, 1) - 1]
          })
        }
      } else {
        // istanbul ignore else
        if (!formikRef.current?.values?.serviceRef) {
          showError('Please select a service first')
          return
        }
      }

      setSelectedView(view)
    },
    [showError, yamlHandler]
  )

  const formVariableOverrideObject = (
    variableOverride?: NGVariable,
    serviceOverride?: ServiceOverrideResponseDTO,
    isSubmit?: boolean
  ): Array<NGVariable | undefined> => {
    const serviceOverrideData = defaultTo(serviceOverride, selectedServiceOverride)
    const parsedYaml = parse(defaultTo(serviceOverrideData?.yaml, '{}')) as NGServiceOverrideConfig
    const otherVariables = defaultTo(
      parsedYaml.serviceOverrides?.variables
        ?.map(override => ({ name: get(override, 'name'), type: get(override, 'type'), value: get(override, 'value') }))
        ?.filter(override => {
          return override.name !== variableOverride?.name
        }),
      []
    )
    if (isSubmit) {
      if (!isEmpty(variableOverride?.name)) {
        return [...otherVariables, variableOverride]
      }
      return [...otherVariables]
    }
    return [...otherVariables, variableOverride]
  }
  const getManifestOverrideObject = (): Array<ManifestConfigWrapper> => {
    if (!isEmpty(selectedServiceOverride)) {
      const parsedServiceOverride = yamlParse<NGServiceOverrideConfig>(
        defaultTo(selectedServiceOverride?.yaml, '')
      ).serviceOverrides
      return defaultTo(parsedServiceOverride?.manifests, []) as ManifestConfigWrapper[]
    }
    return []
  }
  const getManifestOverrideValues = (): Array<ManifestConfigWrapper> => {
    const formikManifestOverrideData = formikRef.current?.values.manifests
    if (formikManifestOverrideData?.length) {
      return formikManifestOverrideData
    }
    return getManifestOverrideObject()
  }

  const onSubmit = async (values: AddEditServiceOverrideFormProps): Promise<void> => {
    try {
      const response = await upsertServiceOverride({
        environmentIdentifier,
        serviceIdentifier: values.serviceRef,
        orgIdentifier,
        projectIdentifier,
        yaml: yamlStringify({
          serviceOverrides: {
            environmentRef: environmentIdentifier,
            serviceRef: values.serviceRef,
            variables:
              values.variables ||
              formVariableOverrideObject(
                values.variableOverride,
                serviceOverrides?.find(svcOverride => svcOverride.serviceRef === values.serviceRef),
                true
              ),
            manifests: !isEmpty(formikRef.current?.values.manifests) ? formikRef.current?.values.manifests : undefined
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
        variables: formVariableOverrideObject(formikRef.current?.values.variableOverride),
        manifests: getManifestOverrideValues()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef.current])

  const handleYamlChange = useCallback((): void => {
    const parsedYaml = parse(defaultTo(yamlHandler?.getLatestYaml(), '{}'))
    const anyVariableEmpty = parsedYaml.serviceOverrides.variables?.find(
      (serviceVariable: any) => isEmpty(serviceVariable.name) || isEmpty(serviceVariable.value)
    )
    if (isEqual(existingJSON, parsedYaml) || anyVariableEmpty) {
      setIsModified(false)
    } else {
      setIsModified(true)
    }
  }, [existingJSON, yamlHandler])

  const handleTabChange = (nextTab: ServiceOverrideTab): void => {
    setSelectedTab(nextTab)
  }

  /**********************************************Service Manifest CRUD Operations ************************************************/
  const handleManifestOverrideSubmit = useCallback(
    (manifestObj: ManifestConfigWrapper, manifestIndex: number): void => {
      const manifestDefaultValue = [...(formikRef.current?.values?.manifests as ManifestConfigWrapper[])]
      if (manifestDefaultValue?.length) {
        manifestDefaultValue.splice(manifestIndex, 1, manifestObj)
      } else {
        manifestDefaultValue.push(manifestObj)
      }
      formikRef.current?.setFieldValue('manifests', manifestDefaultValue)
    },
    []
  )

  const removeManifestConfig = useCallback((index: number): void => {
    const manifestDefaultValue = [...(formikRef.current?.values?.manifests as ManifestConfigWrapper[])]
    manifestDefaultValue.splice(index, 1)
    formikRef.current?.setFieldValue('manifests', manifestDefaultValue)
  }, [])
  /**********************************************Service Manifest CRUD Operations ************************************************/

  return (
    <Formik<AddEditServiceOverrideFormProps>
      formName="addEditServiceOverrideForm"
      initialValues={{
        serviceRef: selectedVariable?.serviceRef,
        environmentRef: environmentIdentifier,
        variableOverride: {
          name: selectedVariable?.variable.name,
          type: selectedVariable?.variable.type,
          value: selectedVariable?.variable.value as string
        },
        manifests: getManifestOverrideObject()
      }}
      onSubmit={
        /* istanbul ignore next */ values => {
          onSubmit?.({
            ...values
          })
        }
      }
      validationSchema={getValidationSchema(selectedTab, getString)}
    >
      {formikProps => {
        formikRef.current = formikProps
        return (
          <div
            className={cx({
              [css.serviceOverrideDialog]: isEmpty(selectedVariable?.serviceRef)
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
                  disabled={!isEmpty(selectedVariable?.serviceRef)}
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
                            variablesOptions={variablesOptions}
                            handleVariableChange={handleVariableChange}
                          />
                        }
                      />
                      {isServiceManifestEnabled && (
                        <Tab
                          id={ServiceOverrideTab.MANIFEST}
                          title={getString('manifestsText')}
                          panel={
                            <ServiceManifestOverride
                              manifestOverrides={
                                defaultTo(formikProps.values?.manifests, []) as ManifestConfigWrapper[]
                              }
                              handleManifestOverrideSubmit={handleManifestOverrideSubmit}
                              removeManifestConfig={removeManifestConfig}
                              isReadonly={isReadonly}
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
            <Layout.Horizontal spacing="medium" padding={{ top: 'medium' }}>
              <Button
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
                disabled={(selectedView === SelectedView.YAML && !isModified) || upsertServiceOverrideLoading}
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
