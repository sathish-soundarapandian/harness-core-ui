/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { FormikForm, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useGetAzureWebAppNamesV2, useGetAzureWebAppDeploymentSlotsV2 } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { AzureSlotDeploymentData, AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const isRuntime = (value: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

export function AzureSlotDeploymentInputSetRef<T extends AzureSlotDeploymentData = AzureSlotDeploymentData>(
  props: AzureSlotDeploymentProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, allowableTypes, stepViewType, selectedStage } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [currentWebAppName, setCurrentWebAppName] = React.useState<string>('s')
  const [appNames, setAppNames] = React.useState<string[]>([])
  const [slots, setSlots] = React.useState<string[]>([])

  const {
    data: appNamesListData,
    loading,
    refetch: refetchAppNamesList
  } = useGetAzureWebAppNamesV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: selectedStage?.stage?.spec?.environment?.environmentRef,
      infraDefinitionId: selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
    }
  })

  const {
    data: slotsListData,
    loading: slotsLoading,
    refetch: refetchSlotsList
  } = useGetAzureWebAppDeploymentSlotsV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: selectedStage?.stage?.spec?.environment?.environmentRef,
      infraDefinitionId: selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
    },
    webAppName: 'doc-example'
  })

  React.useEffect(() => {
    console.log('app names', appNamesListData)
  }, [appNamesListData])

  React.useEffect(() => {
    console.log('props', props)
  }, [props])

  React.useEffect(() => {
    console.log('slots', slotsLoading)
  }, [slotsListData])

  return (
    <FormikForm>
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
    </FormikForm>
  )
}

const AzureSlotDeploymentInputSet = connect(AzureSlotDeploymentInputSetRef)
export default AzureSlotDeploymentInputSet
