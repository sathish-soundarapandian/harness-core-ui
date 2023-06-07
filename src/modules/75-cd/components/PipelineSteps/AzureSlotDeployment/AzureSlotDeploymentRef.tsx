/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import * as Yup from 'yup'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text
} from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'

import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { useQueryParams } from '@common/hooks'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getAzureWebAppDeploymentSlotsV2Promise, getAzureWebAppNamesV2Promise } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AcceptableValue = boolean | string | number | SelectOption | string[]

export const AzureSlotDeploymentRef = (
  props: AzureSlotDeploymentProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  /* istanbul ignore next */
  const {
    allowableTypes,
    isNewStep = true,
    readonly,
    initialValues,
    onUpdate,
    onChange,
    stepViewType,
    selectedStage
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS } = useFeatureFlags()
  const query = useQueryParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionId = (query as any).sectionId || ''
  const loadingPlaceholderText = getString('pipeline.artifactsSelection.loadingDigest')
  const [loading, setLoading] = useState<boolean>(false)
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>(
    loading ? [{ label: getString('loading'), value: '' }] : []
  )
  const [dynamicSlots, setDynamicSlots] = useState<SelectOption[]>([])

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  const isMultiEnv = React.useMemo(() => {
    return selectedStage?.stage?.spec?.environment?.environmentRef
  }, [selectedStage?.stage?.spec?.environment?.environmentRef])

  const isEnvAndInfra = React.useMemo(() => {
    return (
      selectedStage?.stage?.spec?.environment?.environmentRef &&
      selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
    )
  }, [
    selectedStage?.stage?.spec?.environment?.environmentRef,
    selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
  ])

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`AzureSlotDeployment-${sectionId}`}
      validate={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onChange?.(payload)
      }}
      onSubmit={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onUpdate?.(payload)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          deploymentSlot: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Deployment Slot'
            })
          ),
          webApp: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Web App'
            })
          )
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        if (get(formik, 'values.spec.webApp') && formik.errors?.spec?.webApp) {
          formik.setFieldError('spec.webApp', undefined)
        }
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                disabled={readonly}
              />
            </div>
            <div className={stepCss.divider} />
            {AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS &&
            selectedStage?.stage?.spec?.environment?.environmentRef &&
            selectedStage?.stage?.spec?.environment?.environmentRef !== RUNTIME_INPUT_VALUE &&
            selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier !==
              RUNTIME_INPUT_VALUE &&
            selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier ? (
              <>
                <FormInput.MultiTypeInput
                  // selectItems={getItems(loading, getString('loading'), dynamicWebNames)}
                  style={{ width: '67%' }}
                  selectItems={dynamicWebNames}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      defaultSelectedItem: {
                        label: formik?.values?.spec?.webApp,
                        value: formik?.values?.spec?.webApp
                      } as SelectOption,
                      items: dynamicWebNames,
                      addClearBtn: true,
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true,
                      addTooltip: true,
                      noResults: (
                        <Text padding={'small'}>
                          {loading ? getString('loading') : getString('pipeline.ACR.subscriptionError')}
                        </Text>
                      )
                    },
                    onChange: e => {
                      formik.setFieldError('spec.webApp', undefined)
                      if (e === RUNTIME_INPUT_VALUE) {
                        formik.setFieldValue('spec.webApp', RUNTIME_INPUT_VALUE)
                        formik.setFieldValue('spec.deploymentSlot', RUNTIME_INPUT_VALUE)
                        return
                      } else {
                        formik.setFieldValue('spec.webApp', (e as SelectOption)?.value)
                        if (get(formik, 'values.spec.deploymentSlot') !== RUNTIME_INPUT_VALUE) {
                          formik.setFieldValue('spec.deploymentSlot', '')
                        }
                      }
                    },
                    onFocus: () => {
                      setLoading(true)
                      setDynamicSlots([])
                      getAzureWebAppNamesV2Promise({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          envId: selectedStage?.stage?.spec?.environment?.environmentRef,
                          infraDefinitionId:
                            selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
                        }
                      })
                        .then(res => {
                          if (res?.data) {
                            setDynamicWebNames(
                              res?.data?.webAppNames?.map((name: string): SelectOption => {
                                return {
                                  value: name,
                                  label: name
                                } as SelectOption
                              }) as SelectOption[]
                            )
                          }
                        })
                        .finally(() => {
                          setLoading(false)
                        })
                    }
                  }}
                  label={'Web App Name'}
                  name="spec.webApp"
                />
                <FormInput.MultiTypeInput
                  style={{ width: '67%' }}
                  selectItems={dynamicSlots}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      defaultSelectedItem: {
                        label: formik?.values?.spec?.deploymentSlot,
                        value: formik?.values?.spec?.deploymentSlot
                      } as SelectOption,
                      items: dynamicSlots,
                      addClearBtn: true,
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true,
                      addTooltip: true
                    },

                    onFocus: () => {
                      getAzureWebAppDeploymentSlotsV2Promise({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          envId: selectedStage?.stage?.spec?.environment?.environmentRef,
                          infraDefinitionId:
                            selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
                        },
                        webAppName: formik?.values?.spec?.webApp
                      }).then(res => {
                        if (res?.data) {
                          setDynamicSlots(
                            res?.data?.deploymentSlots?.map((slot: any): SelectOption => {
                              return {
                                value: slot?.name,
                                label: slot?.name
                              } as SelectOption
                            }) as SelectOption[]
                          )
                        }
                      })
                    }
                  }}
                  label={'Deployment Slot'}
                  name="spec.deploymentSlot"
                />
              </>
            ) : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    name="spec.webApp"
                    placeholder={'Specify web app name'}
                    label={'Web App Name'}
                    multiTextInputProps={{ expressions, allowableTypes }}
                    disabled={readonly}
                  />
                  {getMultiTypeFromValue(get(formik, 'values.spec.webApp')) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={get(formik, 'values.spec.webApp') as string}
                      type="String"
                      variableName="spec.webApp"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik?.setFieldValue('spec.webApp', value)
                        }
                      }
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    name="spec.deploymentSlot"
                    placeholder={'Specify deployment slot'}
                    label={'Deployment Slot'}
                    multiTextInputProps={{ expressions, allowableTypes }}
                    disabled={readonly}
                  />
                  {getMultiTypeFromValue(get(formik, 'values.spec.deploymentSlot')) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={get(formik, 'values.spec.deploymentSlot') as string}
                      type="String"
                      variableName="spec.deploymentSlot"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik?.setFieldValue('spec.deploymentSlot', value)
                        }
                      }
                      isReadonly={readonly}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )
      }}
    </Formik>
  )
}
