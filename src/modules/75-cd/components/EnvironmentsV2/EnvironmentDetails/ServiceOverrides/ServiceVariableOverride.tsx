/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Dialog,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout
} from '@harness/uicore'
import { Form } from 'formik'
import { useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import { defaultTo, isEmpty } from 'lodash-es'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { NGServiceConfig, ServiceResponse } from 'services/cd-ng'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { getVariableTypeOptions, VariableType } from './ServiceOverridesUtils'
import type { VariableOverride } from './ServiceOverridesInterface'
import ServiceVariablesOverridesList from './ServiceVariablesOverrides/ServiceVariablesOverridesList'
import css from './ServiceOverrides.module.scss'

interface ServiceVariableOverrideProps {
  selectedService: string
  serviceList: ServiceResponse[]
  variableOverrides: VariableOverride[]
  isReadonly: boolean
  handleVariableSubmit: (val: VariableOverride, variableIndex: number) => void
  onServiceVarDelete: (index: number) => void
}

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  canEscapeKeyClose: false,
  canOutsideClickClose: false
}

export interface VariableOptionsProps {
  label: string
  value: string
  type?: 'String' | 'Number' | 'Secret'
}
function ServiceVariableOverride({
  serviceList,
  selectedService,
  variableOverrides,
  handleVariableSubmit,
  isReadonly,
  onServiceVarDelete
}: ServiceVariableOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const [variableIndex, setEditIndex] = useState(0)

  const getVariableOptions = (): VariableOptionsProps[] => {
    if (!isEmpty(selectedService)) {
      const serviceSelected = serviceList.find(serviceObj => serviceObj.service?.identifier === selectedService)
      if (serviceSelected) {
        const parsedServiceYaml = yamlParse<NGServiceConfig>(defaultTo(serviceSelected?.service?.yaml, '')).service
        const serviceVars = defaultTo(parsedServiceYaml?.serviceDefinition?.spec?.variables, [])
        return serviceVars?.map(variable => ({
          label: defaultTo(variable.name, ''),
          value: defaultTo(variable.name, ''),
          type: defaultTo(variable.type, undefined)
        }))
      }
    }
    return []
  }
  const variablesOptions = getVariableOptions()

  const variableListItems = useMemo(() => {
    const serviceOverideVars = variableOverrides.map(varOverride => varOverride.name)
    const serviceServiceVars = variablesOptions.map((option: { value: string }) => option.value)
    const finalList = new Set([...serviceOverideVars, ...serviceServiceVars] as string[])

    return Array.from(finalList).map(list => ({
      label: defaultTo(list, ''),
      value: defaultTo(list, '')
    }))
  }, [variableOverrides, variablesOptions])

  const createNewVariableOverride = (): void => {
    setEditIndex(variableOverrides.length)
    showModal()
  }

  const handleSubmit = (variableObj: VariableOverride): void => {
    hideModal()
    const variableOldIndex = variableOverrides.findIndex(override => override.name === variableObj.name)
    handleVariableSubmit(variableObj, variableOldIndex !== -1 ? variableOldIndex : variableIndex)
  }

  const onServiceVarEdit = useCallback(
    (index: number): void => {
      setEditIndex(index)
      showModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getInitialValues = (): VariableOverride => {
    const defaultOverrideValues = variableOverrides[variableIndex]
    return defaultTo(defaultOverrideValues, {
      name: '',
      type: VariableType.String,
      value: ''
    })
  }

  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      hideModal()
    }

    return (
      <Dialog title={getString('common.addVariable')} onClose={onClose} {...DIALOG_PROPS}>
        <Formik
          initialValues={getInitialValues()}
          formName="serviceVariableOverride"
          onSubmit={formData => handleSubmit(formData)}
        >
          {formik => {
            return (
              <Form>
                <FormInput.Select
                  name="name"
                  selectProps={{
                    allowCreatingNewItems: true
                  }}
                  items={variableListItems}
                  label={getString('variableNameLabel')}
                  placeholder={getString('common.selectName', { name: getString('variableLabel') })}
                  onChange={value => {
                    const overrideType = variablesOptions.find(
                      (svcOverride: VariableOptionsProps) => svcOverride.value === value?.value
                    )?.type
                    overrideType && formik.setFieldValue('type', overrideType)
                  }}
                />
                <FormInput.Select
                  name="type"
                  items={getVariableTypeOptions(getString)}
                  label={getString('typeLabel')}
                  placeholder={getString('common.selectName', { name: getString('service') })}
                  onChange={() => {
                    formik.setFieldValue('value', '')
                  }}
                />
                {formik.values?.type === VariableType.Secret ? (
                  <MultiTypeSecretInput name="value" label={getString('cd.overrideValue')} isMultiType />
                ) : (
                  <FormInput.MultiTextInput
                    name="value"
                    className="variableInput"
                    label={getString('cd.overrideValue')}
                    multiTextInputProps={{
                      defaultValueToReset: '',
                      textProps: {
                        type: formik.values?.type === VariableType.Number ? 'number' : 'text'
                      },
                      multitypeInputValue: getMultiTypeFromValue(formik.values?.value)
                    }}
                  />
                )}
                <Layout.Horizontal spacing="medium" margin={{ top: 'huge' }}>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={onClose}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [variableIndex, variableListItems])

  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} spacing="medium">
      <ServiceVariablesOverridesList
        variableOverrides={variableOverrides}
        isReadonly={isReadonly}
        onServiceVarEdit={onServiceVarEdit}
        onServiceVarDelete={onServiceVarDelete}
      />

      <RbacButton
        icon={'plus'}
        text={`${getString('common.newName', { name: getString('variableLabel') })} ${getString('common.override')}`}
        size={ButtonSize.SMALL}
        variation={ButtonVariation.LINK}
        className={css.addOverrideBtn}
        permission={{
          resource: {
            resourceType: ResourceType.ENVIRONMENT
          },
          permission: PermissionIdentifier.EDIT_ENVIRONMENT
        }}
        onClick={createNewVariableOverride}
      />
    </Layout.Vertical>
  )
}

export default ServiceVariableOverride
