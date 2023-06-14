import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FormInput,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text,
  AllowedTypes,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout,
  ButtonVariation,
  Button
} from '@harness/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'

import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import type { IItemRendererProps } from '@blueprintjs/select'
import { connect, FormikContextType } from 'formik'

import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
// import { useToaster } from '@common/components'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGetAzureWebAppDeploymentSlotsV2, useGetAzureWebAppNamesV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import {
  getEnvId,
  getInfraId,
  getInfraIdRuntime,
  getEnvIdRuntime,
  getAllowableTypes,
  isRuntimeEnvId,
  isRuntimeInfraId,
  isMultiEnv
} from '../AzureSlotDeployment/utils'

import type { AzureWebAppSwapSlotProps } from './SwapSlot.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AcceptableValue = boolean | string | number | SelectOption | string[]
export interface AzureSlotDeploymentDynamic {
  webAppNamePath?: string
  webAppSwapSlotPath?: string
  stageIdentifier?: string
  isRuntime?: boolean
}
export type AzureSwapSlotDeploymentDynamicProps = AzureWebAppSwapSlotProps & {
  formik?: FormikContextType<any>
} & AzureSlotDeploymentDynamic
const AzureSwapSlotDeploymentDynamic = (props: AzureSwapSlotDeploymentDynamicProps): JSX.Element => {
  /* istanbul ignore next */
  const {
    readonly,
    selectedStage,
    formik,
    webAppNamePath = 'spec.webApp',
    webAppSwapSlotPath = 'spec.targetSlot',
    stageIdentifier = '',
    isRuntime = false,
    inputSetData
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  //   const { AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS } = useFeatureFlags()
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>([])
  const [dynamicSwapSlots, setDynamicSwapSlots] = useState<SelectOption[]>([])
  const [webAppName, setWebAppName] = useState('')
  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    title: 'Web App Name',
    isCloseButtonShown: true,
    onClose: () => {
      hideModal()
    },

    style: {
      width: 600,
      minHeight: 240,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  }

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  React.useEffect(() => {
    if (isRuntime) {
      setFieldValue(webAppNamePath, '')
      setFieldValue(webAppSwapSlotPath, '')
      setDynamicWebNames([])
      setDynamicSwapSlots([])
    }
  }, [getEnvIdRuntime(stageIdentifier, formik?.values), getInfraIdRuntime(stageIdentifier, formik?.values), isRuntime])

  const getFieldValue = (name: string) => {
    return get(formik?.values, name)
  }

  const setFieldValue = (name: string, value: string) => {
    return formik?.setFieldValue(name, value)
  }

  const {
    data: webAppNameData,
    loading: loadingWebApp,
    refetch: refetchWebAppNames,
    error: errorWebApp
  } = useGetAzureWebAppNamesV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: getEnvId(selectedStage) || getEnvIdRuntime(stageIdentifier, formik?.values),
      infraDefinitionId: getInfraId(selectedStage) || getInfraIdRuntime(stageIdentifier, formik?.values)
    },
    lazy: true
  })
  const {
    data: webAppSwapSlotsData,
    loading: loadingWebSlots,
    refetch: refetchWebAppSlots,
    error: errorWebAppSwapSlot
  } = useGetAzureWebAppDeploymentSlotsV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: getEnvId(selectedStage) || getEnvIdRuntime(stageIdentifier, formik?.values),
      infraDefinitionId: getInfraId(selectedStage) || getInfraIdRuntime(stageIdentifier, formik?.values)
    },
    lazy: true,
    webAppName
  })

  React.useEffect(() => {
    if (webAppNameData) {
      setDynamicSwapSlots([])
      setDynamicWebNames(
        webAppNameData?.data?.webAppNames?.map((name: string): SelectOption => {
          return {
            value: name,
            label: name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppNameData])

  React.useEffect(() => {
    if (webAppSwapSlotsData) {
      setDynamicSwapSlots(
        webAppSwapSlotsData?.data?.deploymentSlots?.map((slot: any): SelectOption => {
          return {
            value: slot?.name,
            label: slot?.name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppSwapSlotsData])
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        {
          <Layout.Vertical spacing="xxlarge" width={'67%'} padding="medium">
            <FormInput.MultiTypeInput
              selectItems={dynamicWebNames}
              multiTypeInputProps={{
                defaultValue: webAppName,
                expressions,
                allowableTypes: [MultiTypeInputType.FIXED],
                selectProps: {
                  defaultSelectedItem: {
                    label: webAppName,
                    value: webAppName
                  } as SelectOption,
                  items: dynamicWebNames,
                  addClearBtn: true,
                  itemRenderer: itemRenderer,
                  allowCreatingNewItems: true,
                  addTooltip: true,
                  noResults: (
                    <Text padding={'small'}>
                      {loadingWebApp
                        ? getString('loading')
                        : get(errorWebApp, 'data.message', null) || getString('pipeline.ACR.subscriptionError')}
                    </Text>
                  )
                },

                onChange: e => {
                  setWebAppName((e as SelectOption)?.value as string)
                  setFieldValue(webAppSwapSlotPath, '')
                  refetchWebAppSlots()
                },
                onFocus: () => {
                  refetchWebAppNames()
                }
              }}
              label={'Web App Name'}
              name={''}
            />
            <div>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('confirm')}
                onClick={() => {
                  if (webAppName) {
                    refetchWebAppSlots()
                  }
                  hideModal()
                }}
              />
              &nbsp; &nbsp;
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('cancel')}
                onClick={() => {
                  setWebAppName('')
                  hideModal()
                }}
              />
            </div>
          </Layout.Vertical>
        }
      </Dialog>
    ),
    [modalProps, webAppName, dynamicWebNames, webAppSwapSlotPath, loadingWebApp]
  )

  const envOrInfraRuntime = isRuntimeEnvId(selectedStage) || isRuntimeInfraId(selectedStage)

  const isMultiEnvs = React.useMemo(() => {
    return isMultiEnv(selectedStage)
  }, [selectedStage])

  return !envOrInfraRuntime && !isMultiEnvs ? (
    <Layout.Vertical width={'67%'}>
      {!isRuntime || getMultiTypeFromValue(get(inputSetData?.template, `${webAppSwapSlotPath}`)) ? (
        <FormInput.MultiTypeInput
          // style={{ width: '67%' }}
          selectItems={dynamicSwapSlots}
          useValue
          multiTypeInputProps={{
            multitypeInputValue:
              getFieldValue(webAppNamePath) === RUNTIME_INPUT_VALUE ? MultiTypeInputType.RUNTIME : undefined,
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,

            selectProps: {
              defaultSelectedItem: {
                label: getFieldValue(webAppSwapSlotPath),
                value: getFieldValue(webAppSwapSlotPath)
              } as SelectOption,
              items: dynamicSwapSlots,
              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true,

              noResults: (
                <Text padding={'small'}>
                  {loadingWebSlots
                    ? getString('loading')
                    : get(errorWebAppSwapSlot, 'data.message', null) || getString('pipeline.ACR.subscriptionError')}
                </Text>
              )
            },

            onFocus: () => {
              if (
                (!webAppName || !getFieldValue(webAppSwapSlotPath)) &&
                getMultiTypeFromValue(getFieldValue(webAppSwapSlotPath)) === MultiTypeInputType.FIXED
              ) {
                showModal()
              }
              refetchWebAppSlots()
            }
          }}
          label={'Target Slot'}
          name={webAppSwapSlotPath}
        />
      ) : null}
    </Layout.Vertical>
  ) : (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={''}
          placeholder={'Specify web app name'}
          label={'Web App Name'}
          multiTextInputProps={{
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            multitypeInputValue: MultiTypeInputType.EXPRESSION,
            defaultValue: webAppName
          }}
          disabled={readonly}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppSwapSlotPath}
          placeholder={'Specify deployment slot'}
          label={'Target Slot'}
          multiTextInputProps={{
            expressions,
            multitypeInputValue: MultiTypeInputType.EXPRESSION,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppSwapSlotPath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppSwapSlotPath)}
            type="String"
            variableName={webAppSwapSlotPath}
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppSwapSlotPath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>
    </>
  )
}

export const AzureSwapSlotDeploymentDynamicField = connect(AzureSwapSlotDeploymentDynamic)
