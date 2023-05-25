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
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'

import { get, memoize } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useQueryParams, useMutateAsGet } from '@common/hooks'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  useGetAzureWebAppNamesV2,
  useGetAzureWebAppDeploymentSlotsV2,
  GetAzureWebAppDeploymentSlotsV2,
  getAzureWebAppDeploymentSlotsV2Promise,
  getAzureWebAppNamesV2Promise
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

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

  const query = useQueryParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionId = (query as any).sectionId || ''
  const loadingPlaceholderText = getString('pipeline.artifactsSelection.loadingDigest')
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>([])
  const [dynamicSlots, setDynamicSlots] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  React.useEffect(() => {
    console.log('ref props', props)
  }, [props])
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

  // const {
  //   data: slotsListData,
  //   loading: slotsLoading,
  //   refetch: refetchSlotsList
  // } = useMutateAsGet(useGetAzureWebAppDeploymentSlotsV2, {
  //   queryParams: {
  //     accountIdentifier: accountId,
  //     projectIdentifier,
  //     orgIdentifier,
  //     envId: selectedStage?.stage?.spec?.environment?.environmentRef,
  //     infraDefinitionId: selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
  //   },
  //   requestOptions: {
  //         headers: {
  //           'content-type': 'application/json'
  //         }
  //       },
  //   body: {
  //     webAppName: 'doc-example'
  //   }
  // })

  // const { data, loading, refetch, error } = useMutateAsGet(useGetLastSuccessfulBuildForDocker, {
  //   queryParams: {
  //     imagePath: formik?.values?.imagePath,
  //     connectorRef: connectorRefValue,
  //     accountIdentifier: accountId,
  //     orgIdentifier,
  //     projectIdentifier
  //   },
  //   requestOptions: {
  //     headers: {
  //       'content-type': 'application/json'
  //     }
  //   },
  //   lazy: true,
  //   body: {
  //     tag: formik?.values?.tag?.value
  //   }
  // })

  const data: any[] = []
  const getItems = (isFetching: boolean, label: string, items: SelectOption[]): SelectOption[] => {
    console.log('isfetching', isFetching)
    if (isFetching) {
      return [{ label: `${label}...`, value: `${label}...` }]
    }
    return items
  }

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
          webApp: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Web App'
            })
          ),
          deploymentSlot: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Deployment Slot'
            })
          )
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
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
            <FormInput.MultiTypeInput
              selectItems={getItems(loading, 'Dynamic test web app names', dynamicWebNames)}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  defaultSelectedItem: {
                    label: formik?.values?.spec?.webApp,
                    value: formik?.values?.spec?.webApp
                  } as SelectOption,
                  // noResults: <div>error</div>,
                  items: dynamicWebNames,
                  addClearBtn: true,
                  itemRenderer: itemRenderer,
                  allowCreatingNewItems: true,
                  addTooltip: true,
                  loadingItems: loading
                },
                onChange: e => {
                  formik.setFieldValue('spec.webApp', e?.value)
                  formik.setFieldValue('spec.deploymentSlot', '')
                },
                onFocus: () => {
                  setLoading(true)
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
              label={'Dynamic test web app names'}
              name="spec.webApp"
              // className={css.tagInputButton}
            />
            <FormInput.MultiTypeInput
              selectItems={getItems(loading, 'Dynamic test slot', dynamicSlots)}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  defaultSelectedItem: {
                    label: formik?.values?.spec?.deploymentSlot,
                    value: formik?.values?.spec?.deploymentSlot
                  } as SelectOption,
                  noResults: <div>error</div>,
                  items: dynamicSlots,
                  addClearBtn: true,
                  itemRenderer: itemRenderer,
                  allowCreatingNewItems: true,
                  addTooltip: true
                },
                onChange: () => {
                  // console.log('formik', formik)
                },
                onFocus: () => {
                  console.log('formik', formik)
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
                    console.log('res', res)
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
              label={'Dynamic test Deployment Slot'}
              name="spec.deploymentSlot"
              // className={css.tagInputButton}
            />
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
        )
      }}
    </Formik>
  )
}
