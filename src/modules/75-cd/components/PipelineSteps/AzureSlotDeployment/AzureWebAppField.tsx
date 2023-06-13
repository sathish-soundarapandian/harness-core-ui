import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FormInput,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text,
  AllowedTypes,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import cx from 'classnames'
import type { IItemRendererProps } from '@blueprintjs/select'
import { connect, FormikContextType } from 'formik'

import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
// import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGetAzureWebAppDeploymentSlotsV2, useGetAzureWebAppNamesV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import type { AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import {
  getEnvId,
  getInfraId,
  getInfraIdRuntime,
  getEnvIdRuntime,
  getAllowableTypes,
  isRuntimeEnvId,
  isRuntimeInfraId,
  isMultiEnv
} from './utils'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AcceptableValue = boolean | string | number | SelectOption | string[]
export interface AzureSlotDeploymentDynamic {
  webAppNamePath?: string
  webAppSlotPath?: string
  stageIdentifier?: string
  isRuntime?: boolean
}
export type AzureSlotDeploymentDynamicProps = AzureSlotDeploymentProps & {
  formik?: FormikContextType<any>
} & AzureSlotDeploymentDynamic
const AzureSlotDeploymentDynamic = (props: AzureSlotDeploymentDynamicProps): JSX.Element => {
  /* istanbul ignore next */
  const {
    readonly,
    selectedStage,
    formik,
    webAppNamePath = 'spec.webApp',
    webAppSlotPath = 'spec.deploymentSlot',
    stageIdentifier = '',
    isRuntime = false,
    inputSetData,
    allValues
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  //   const { AZURE_WEBAPP_LISTING_APP_NAMES_AND_SLOTS } = useFeatureFlags()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>([])
  const [dynamicSlots, setDynamicSlots] = useState<SelectOption[]>([])

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  React.useEffect(() => {
    if (isRuntime) {
      setFieldValue(webAppNamePath, '')
      setFieldValue(webAppSlotPath, '')
      setDynamicWebNames([])
      setDynamicSlots([])
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
    refetch: refetchWebAppNames
    // error
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
    data: webAppSlotsData,
    loading: loadingWebSlots,
    refetch: refetchWebAppSlots
    // error: webAppSlotsError
  } = useGetAzureWebAppDeploymentSlotsV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: getEnvId(selectedStage) || getEnvIdRuntime(stageIdentifier, formik?.values),
      infraDefinitionId: getInfraId(selectedStage) || getInfraIdRuntime(stageIdentifier, formik?.values)
    },
    lazy: true,
    webAppName: getFieldValue(webAppNamePath) || get(allValues, 'spec.webApp')
  })

  React.useEffect(() => {
    if (webAppNameData) {
      setDynamicSlots([])
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
    if (webAppSlotsData) {
      setDynamicSlots(
        webAppSlotsData?.data?.deploymentSlots?.map((slot: any): SelectOption => {
          return {
            value: slot?.name,
            label: slot?.name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppSlotsData])

  const envOrInfraRuntime = isRuntimeEnvId(selectedStage) || isRuntimeInfraId(selectedStage)

  const isMultiEnvs = React.useMemo(() => {
    return isMultiEnv(selectedStage)
  }, [selectedStage])

  return !envOrInfraRuntime && !isMultiEnvs ? (
    <>
      {!isRuntime ||
      getMultiTypeFromValue(get(inputSetData?.template, `spec.webApp`)) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          style={{ width: '67%' }}
          selectItems={dynamicWebNames}
          useValue
          multiTypeInputProps={{
            defaultValue: getFieldValue(webAppNamePath),
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            selectProps: {
              defaultSelectedItem: {
                label: getFieldValue(webAppNamePath),
                value: getFieldValue(webAppNamePath)
              } as SelectOption,
              items: dynamicWebNames,

              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true,
              noResults: (
                <Text padding={'small'}>
                  {loadingWebApp ? getString('loading') : getString('pipeline.ACR.subscriptionError')}
                </Text>
              )
            },

            onChange: e => {
              if (e === RUNTIME_INPUT_VALUE) {
                setFieldValue(webAppNamePath, RUNTIME_INPUT_VALUE)
                setFieldValue(webAppSlotPath, RUNTIME_INPUT_VALUE)
                return
              }
            },
            onFocus: () => {
              setDynamicSlots([])
              refetchWebAppNames()
            }
          }}
          label={'Web App Name'}
          name={webAppNamePath}
        />
      ) : null}
      {!isRuntime || getMultiTypeFromValue(get(inputSetData?.template, `${webAppSlotPath}`)) ? (
        <FormInput.MultiTypeInput
          style={{ width: '67%' }}
          selectItems={dynamicSlots}
          useValue
          multiTypeInputProps={{
            multitypeInputValue:
              getFieldValue(webAppNamePath) === RUNTIME_INPUT_VALUE ? MultiTypeInputType.RUNTIME : undefined,
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            selectProps: {
              defaultSelectedItem: {
                label: getFieldValue(webAppSlotPath),
                value: getFieldValue(webAppSlotPath)
              } as SelectOption,
              items: dynamicSlots,
              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true,

              noResults: (
                <Text padding={'small'}>
                  {loadingWebSlots ? getString('loading') : getString('pipeline.ACR.subscriptionError')}
                </Text>
              )
            },

            onFocus: () => {
              refetchWebAppSlots()
            }
          }}
          label={'Deployment Slot'}
          name={webAppSlotPath}
        />
      ) : null}
    </>
  ) : (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppNamePath}
          placeholder={'Specify web app name'}
          label={'Web App Name'}
          multiTextInputProps={{
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            multitypeInputValue: MultiTypeInputType.EXPRESSION
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppNamePath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppNamePath)}
            type="String"
            variableName="spec.webApp"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppNamePath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppSlotPath}
          placeholder={'Specify deployment slot'}
          label={'Deployment Slot'}
          multiTextInputProps={{
            expressions,
            multitypeInputValue: MultiTypeInputType.EXPRESSION,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppSlotPath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppSlotPath)}
            type="String"
            variableName={webAppSlotPath}
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppSlotPath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>
    </>
  )
}

export const AzureSlotDeploymentDynamicField = connect(AzureSlotDeploymentDynamic)
