/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isEmpty, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  FormikForm,
  MultiTypeInputType,
  getMultiTypeFromValue,
  SelectOption,
  FormInput,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'

import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { getAzureWebAppDeploymentSlotsV2Promise, getAzureWebAppNamesV2Promise } from 'services/cd-ng'

import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/StepUtil'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { AzureSlotDeploymentData, AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import { pathExistsSync } from 'fs-extra'

const isRuntime = (value: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

export function AzureSlotDeploymentInputSetRef<T extends AzureSlotDeploymentData = AzureSlotDeploymentData>(
  props: AzureSlotDeploymentProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, allowableTypes, stepViewType, selectedStage, formik, stageIdentifier, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [loading, setLoading] = useState<boolean>(false)
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>(
    loading ? [{ label: getString('loading'), value: '' }] : []
  )

  React.useEffect(() => {
    console.log('props', props)
    console.log('stage', getStageFromPipeline(stageIdentifier, formik?.values))
    console.log(
      'expression ',
      selectedStage?.stage?.spec?.environment?.environmentRef !== RUNTIME_INPUT_VALUE
        ? selectedStage?.stage?.spec?.environment?.environmentRef
        : stage?.stage?.spec?.environment?.environmentRef
    )
    console.log('expression 2', selectedStage?.stage?.spec?.environment?.environmentRef !== RUNTIME_INPUT_VALUE)
  }, [props])

  const stage = React.useMemo(() => {
    return getStageFromPipeline(stageIdentifier, formik?.values) as StageElementWrapperConfig
  }, [props])

  const [dynamicSlots, setDynamicSlots] = useState<SelectOption[]>([])
  const { AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS } = useFeatureFlags()

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )
  return (
    <FormikForm>
      {AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS && formik ? (
        <>
          <FormInput.MultiTypeInput
            // selectItems={getItems(loading, getString('loading'), dynamicWebNames)}
            style={{ width: '50%' }}
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
                addTooltip: true
              },
              onChange: e => {
                formik.setFieldError(`${path}.spec.webApp`, undefined)
                if (e === RUNTIME_INPUT_VALUE) {
                  formik.setFieldValue(`${path}.spec.webApp`, RUNTIME_INPUT_VALUE)
                  formik.setFieldValue(`${path}.spec.deploymentSlot`, RUNTIME_INPUT_VALUE)
                  return
                } else {
                  console.log('on change', e)
                  formik.setFieldValue(`${path}.spec.webApp`, (e as SelectOption)?.value)
                  if (get(formik, `values.${path}.spec.deploymentSlot`) !== RUNTIME_INPUT_VALUE) {
                    formik.setFieldValue(`${path}.spec.deploymentSlot`, '')
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
                    envId:
                      selectedStage?.stage?.spec?.environment?.environmentRef !== RUNTIME_INPUT_VALUE
                        ? selectedStage?.stage?.spec?.environment?.environmentRef
                        : stage?.stage?.spec?.environment?.environmentRef,
                    infraDefinitionId:
                      selectedStage?.stage?.spec?.environment?.infrastructureDefinitions !== RUNTIME_INPUT_VALUE
                        ? selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
                        : stage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
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
            name={`${path}.spec.webApp`}
          />
          <FormInput.MultiTypeInput
            // selectItems={getItems(loading, getString('loading'), dynamicSlots)}
            selectItems={dynamicSlots}
            style={{ width: '50%' }}
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

              // onChange: () => {
              //   // console.log('formik', formik)
              // },
              onFocus: () => {
                getAzureWebAppDeploymentSlotsV2Promise({
                  queryParams: {
                    accountIdentifier: accountId,
                    projectIdentifier,
                    orgIdentifier,
                    envId:
                      selectedStage?.stage?.spec?.environment?.environmentRef !== RUNTIME_INPUT_VALUE
                        ? selectedStage?.stage?.spec?.environment?.environmentRef
                        : stage?.stage?.spec?.environment?.environmentRef,
                    infraDefinitionId:
                      selectedStage?.stage?.spec?.environment?.infrastructureDefinitions !== RUNTIME_INPUT_VALUE
                        ? selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
                        : stage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
                  },
                  webAppName: get(formik, `values.${path}.spec.webApp`)
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
            name={`${path}.spec.deploymentSlot`}
            // className={css.tagInputButton}
          />
        </>
      ) : (
        <>
          {isRuntime(inputSetData?.template?.spec?.webApp as string) && (
            <TextFieldInputSetView
              label={'Web App Name'}
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.webApp`}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              fieldPath={'spec.webApp'}
              template={inputSetData?.template}
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          )}
          {isRuntime(inputSetData?.template?.spec?.deploymentSlot as string) && (
            <TextFieldInputSetView
              label={'Deployment Slot'}
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.deploymentSlot`}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              fieldPath={'spec.deploymentSlot'}
              template={inputSetData?.template}
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          )}
        </>
      )}
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.timeout as string) && (
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            template={inputSetData?.template}
            fieldPath={'timeout'}
            className={cx(stepCss.formGroup, stepCss.md)}
          />
        )
      }
    </FormikForm>
  )
}

const AzureSlotDeploymentInputSet = connect(AzureSlotDeploymentInputSetRef)
export default AzureSlotDeploymentInputSet
