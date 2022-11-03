/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  AllowedTypes,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, merge } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { v4 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ServiceDefinition, ServiceYamlV2 } from 'services/cd-ng'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { useDeepCompareEffect } from '@common/hooks'
import { isValueRuntimeInput } from '@common/utils/utils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import type { DeployServiceEntityData, DeployServiceEntityCustomProps } from './DeployServiceEntityUtils'
import { useGetServicesData } from './useGetServicesData'
import { isExecutionTimeFieldDisabled } from '../K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import css from './DeployServiceEntityStep.module.scss'

export interface DeployServiceEntityInputStepProps extends DeployServiceEntityCustomProps {
  initialValues: DeployServiceEntityData
  readonly: boolean
  inputSetData?: {
    template?: DeployServiceEntityData
    path?: string
    readonly?: boolean
  }
  allowableTypes: AllowedTypes
  stepViewType: StepViewType
}

export function DeployServiceEntityInputStep({
  initialValues,
  inputSetData,
  allowableTypes,
  deploymentType,
  gitOpsEnabled,
  customDeploymentData,
  stepViewType
}: DeployServiceEntityInputStepProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { updateStageFormTemplate } = useStageFormContext()
  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith('template.templateInputs')
  const formik = useFormikContext()

  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentData || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  const serviceValue = get(initialValues, `service.serviceRef`)
  const servicesValue: ServiceYamlV2[] = get(initialValues, `services.values`, [])
  const serviceTemplate = inputSetData?.template?.service?.serviceRef
  const servicesTemplate = inputSetData?.template?.services?.values
  const serviceIdentifiers: string[] = useMemo(() => {
    if (serviceValue) {
      return [serviceValue]
    }

    if (Array.isArray(servicesValue)) {
      return servicesValue.map(svc => svc.serviceRef)
    }

    return []
  }, [serviceValue, servicesValue])

  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)
  const { servicesData, servicesList, loadingServicesData, loadingServicesList, updatingData } = useGetServicesData({
    gitOpsEnabled,
    deploymentType: deploymentType as ServiceDefinition['type'],
    serviceIdentifiers,
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {})
  })
  const isMultiSvcTemplate =
    getMultiTypeFromValue(servicesTemplate as unknown as string) === MultiTypeInputType.RUNTIME ||
    (Array.isArray(servicesTemplate) &&
      servicesTemplate.some(svc => getMultiTypeFromValue(svc.serviceRef) === MultiTypeInputType.RUNTIME))

  // This contains the full path to the service being referenced. Used specifically to update the template
  const fullPathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  // This is the path prefix for updating inner formik values.
  // The inner formik receives the outer formik values object reduced to an object which has a key as one of the below prefixes
  const localPathPrefix = isMultiSvcTemplate ? 'services.' : 'service.'

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(servicesList)) {
      return servicesList.map(service => ({ label: service.name, value: service.identifier }))
    }

    return []
  }, [servicesList])

  useDeepCompareEffect(() => {
    // if this is a multi service template, then set up a dummy field,
    // so that services can be updated in this dummy field
    if (isMultiSvcTemplate) {
      formik.setFieldValue(
        uniquePath.current,
        serviceIdentifiers.map(svcId => ({
          label: defaultTo(servicesList.find(s => s.identifier === svcId)?.name, svcId),
          value: svcId
        }))
      )
    }
  }, [servicesList])

  useDeepCompareEffect(() => {
    // if no value is selected, clear the inputs and template
    if (serviceIdentifiers.length === 0) {
      if (isMultiSvcTemplate) {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}values`)
        formik.setFieldValue(`${localPathPrefix}values`, [])
      } else {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}serviceInputs`)
        formik.setFieldValue(`${localPathPrefix}serviceInputs`, RUNTIME_INPUT_VALUE)
      }
      return
    }

    // updated template data based on selected services
    const newServicesTemplate: ServiceYamlV2[] = serviceIdentifiers.map(svcId => {
      return {
        serviceRef: RUNTIME_INPUT_VALUE,
        serviceInputs: servicesData.find(svcTpl => svcTpl.service.identifier === svcId)?.serviceInputs
      }
    })

    // updated values based on selected services
    const newServicesValues: ServiceYamlV2[] = serviceIdentifiers.map(svcId => {
      const svcTemplate = servicesData.find(svcTpl => svcTpl.service.identifier === svcId)?.serviceInputs
      let serviceInputs = isMultiSvcTemplate
        ? get(formik.values, `${localPathPrefix}values`)?.find((svc: ServiceYamlV2) => svc.serviceRef === svcId)
            ?.serviceInputs
        : get(formik.values, `${localPathPrefix}serviceInputs`)

      if (!serviceInputs || isValueRuntimeInput(serviceInputs)) {
        serviceInputs = svcTemplate ? clearRuntimeInput(svcTemplate) : undefined
      } else {
        serviceInputs = merge(svcTemplate ? clearRuntimeInput(svcTemplate) : undefined, serviceInputs)
      }

      return {
        serviceRef: svcId,
        serviceInputs
      }
    })

    if (isMultiSvcTemplate) {
      updateStageFormTemplate(newServicesTemplate, `${fullPathPrefix}values`)
      formik.setFieldValue(`${localPathPrefix}values`, newServicesValues)
    } else {
      updateStageFormTemplate(
        defaultTo(
          newServicesTemplate[0].serviceInputs,
          isStageTemplateInputSetForm && getMultiTypeFromValue(serviceValue) === MultiTypeInputType.RUNTIME
            ? RUNTIME_INPUT_VALUE
            : undefined
        ),
        `${localPathPrefix}serviceInputs`
      )
      formik.setFieldValue(
        `${localPathPrefix}serviceInputs`,
        defaultTo(
          newServicesValues[0].serviceInputs,
          isStageTemplateInputSetForm && getMultiTypeFromValue(serviceValue) === MultiTypeInputType.RUNTIME
            ? RUNTIME_INPUT_VALUE
            : undefined
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesData, serviceIdentifiers])

  const onServiceRefChange = (): void => {
    formik.setFieldValue(`${localPathPrefix}serviceInputs`, RUNTIME_INPUT_VALUE)
  }

  function handleServicesChange(values: SelectOption[]): void {
    const newValues = values.map(val => ({
      serviceRef: val.value as string,
      serviceInputs: RUNTIME_INPUT_VALUE
    }))

    formik.setFieldValue(`${localPathPrefix}values`, newValues)
  }

  const loading = loadingServicesList || loadingServicesData || updatingData

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        <div className={css.inputFieldLayout}>
          {getMultiTypeFromValue(serviceTemplate) === MultiTypeInputType.RUNTIME ? (
            <ExperimentalInput
              tooltipProps={{ dataTooltipId: 'specifyYourService' }}
              label={getString('cd.pipelineSteps.serviceTab.specifyYourService')}
              name={`${localPathPrefix}serviceRef`}
              placeholder={getString('cd.pipelineSteps.serviceTab.selectService')}
              selectItems={selectOptions}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes: allowableTypes,
                selectProps: {
                  addClearBtn: !inputSetData?.readonly,
                  items: selectOptions
                },
                onChange: onServiceRefChange
              }}
              disabled={inputSetData?.readonly}
              className={css.inputWidth}
              formik={formik}
            />
          ) : null}
          {getMultiTypeFromValue(get(formik?.values, `${localPathPrefix}serviceRef`)) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              className={css.configureOptions}
              style={{ alignSelf: 'center' }}
              value={get(formik?.values, `${localPathPrefix}serviceRef`)}
              type="String"
              variableName="skipResourceVersioning"
              isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
              showRequiredField={false}
              showDefaultField={true}
              showAdvanced={true}
              onChange={value => {
                formik.setFieldValue(`${localPathPrefix}serviceRef`, value)
              }}
            />
          )}
        </div>
        {isMultiSvcTemplate ? (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyYourService' }}
            label={getString('cd.pipelineSteps.serviceTab.specifyYourServices')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: getString('services'),
              disabled: loading || inputSetData?.readonly
            }}
            onChange={handleServicesChange}
            multiTypeProps={{
              width: 300,
              expressions,
              allowableTypes
            }}
          />
        ) : null}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
