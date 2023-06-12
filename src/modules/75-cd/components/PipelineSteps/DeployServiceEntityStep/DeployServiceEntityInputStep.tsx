/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  AllowedTypes,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  useToaster
} from '@harness/uicore'
import { cloneDeep, defaultTo, get, isBoolean, isEmpty, isEqual, isNil, merge, pick, set } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { v4 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { EnvironmentYamlV2, ServiceDefinition, ServiceYamlV2 } from 'services/cd-ng'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { useDeepCompareEffect } from '@common/hooks'
import { isMultiTypeExpression, isValueExpression, isValueFixed, isValueRuntimeInput } from '@common/utils/utils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import type { DeployServiceEntityData, DeployServiceEntityCustomProps } from './DeployServiceEntityUtils'
import { useGetServicesData } from './useGetServicesData'
import { useGetEnvironmentsData } from '../DeployEnvironmentEntityStep/DeployEnvironment/useGetEnvironmentsData'
import {
  createEnvTemplate,
  createEnvValues
} from '../DeployEnvironmentEntityStep/DeployEnvironmentEntityInputStepUtils'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
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
  pathToEnvironments: string
  envGroupIdentifier?: string
  isMultiEnvironment?: boolean
  deployToAllEnvironments?: boolean
  areFiltersAdded?: boolean
  environmentIdentifiers?: string[]
}

export function DeployServiceEntityInputStep({
  initialValues,
  isMultiEnvironment,
  pathToEnvironments,
  envGroupIdentifier,
  deployToAllEnvironments,
  inputSetData,
  allowableTypes,
  deploymentType,
  stepViewType,
  gitOpsEnabled,
  deploymentMetadata,
  customDeploymentData,
  environmentIdentifiers
}: DeployServiceEntityInputStepProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { showWarning } = useToaster()
  const { expressions } = useVariablesExpression()
  const { updateStageFormTemplate, getStageFormTemplate } = useStageFormContext()
  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith('template.templateInputs')
  const formik = useFormikContext<DeployServiceEntityData | DeployEnvironmentEntityConfig>()

  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentData || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  const serviceValue = get(initialValues, `service.serviceRef`)
  const servicesValue: ServiceYamlV2[] = get(initialValues, `services.values`, [])
  const serviceTemplate = inputSetData?.template?.service?.serviceRef
  const servicesTemplate = inputSetData?.template?.services?.values
  const deployParallelTemplate = inputSetData?.template?.services?.metadata?.parallel
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()

  // This is required only for single service
  const [serviceInputType, setServiceInputType] = useState<MultiTypeInputType>(getMultiTypeFromValue(serviceValue))

  const serviceIdentifiers: string[] = useMemo(() => {
    if (serviceValue && !isValueRuntimeInput(serviceValue)) {
      return [serviceValue]
    }

    if (Array.isArray(servicesValue)) {
      return servicesValue.map(svc => svc.serviceRef)
    }

    return []
  }, [serviceValue, servicesValue])

  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)
  const {
    servicesData,
    servicesList,
    loadingServicesData,
    loadingServicesList,
    updatingData,
    nonExistingServiceIdentifiers
  } = useGetServicesData({
    gitOpsEnabled,
    deploymentMetadata,
    deploymentType: deploymentType as ServiceDefinition['type'],
    serviceIdentifiers,
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {}),
    lazyService: isMultiTypeExpression(serviceInputType)
  })

  // pathPrefix contains the outer formik path but does not include the path to environments
  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  // fullPath contains the outer formik path and the path to environments
  const fullPath = pathPrefix + pathToEnvironments

  // const environmentValue = get(initialValues, `environment.environmentRef`)
  // const environmentValues: EnvironmentYamlV2[] = get(initialValues, defaultTo(pathToEnvironments, ''))
  const mainEntityPath = isMultiEnvironment ? pathToEnvironments?.split('.')[0] : pathToEnvironments
  const pathForDeployToAll = `${mainEntityPath}.deployToAll`

  // // environmentsSelectedType is to handle deployToAll/runtime envs
  // // 'all' is for deployToAll, 'runtime' when envs is marked runtime
  // const [environmentsSelectedType, setEnvironmentsSelectedType] = useState<
  //   'all' | 'runtime' | 'other' | 'expression' | undefined
  // >(
  //   get(formik.values, pathForDeployToAll) === true
  //     ? 'all'
  //     : !isMultiEnvironment && isValueExpression(get(formik.values, 'environment.environmentRef'))
  //     ? 'expression'
  //     : undefined
  // )

  const {
    environmentsList,
    environmentsData,
    loadingEnvironmentsList,
    loadingEnvironmentsData,
    // This is required only when updating the entities list
    updatingEnvironmentsData,
    nonExistingEnvironmentIdentifiers
  } = useGetEnvironmentsData({ envIdentifiers: environmentIdentifiers || [], envGroupIdentifier, serviceIdentifiers })

  console.log('environmentIdentifiers', { environmentIdentifiers, serviceIdentifiers })

  // ! This effect should only run when environments are selected and their data has completely loaded
  useDeepCompareEffect(() => {
    // If selected environments data has not loaded.
    // The 2nd condition is to prevent update until environments data load for all environments
    if (!environmentsData.length || environmentIdentifiers?.length !== environmentsData.length) {
      return
    }

    // updated template based on selected environments
    const existingTemplate = getStageFormTemplate<EnvironmentYamlV2[]>(fullPath)
    const newEnvironmentsTemplate: EnvironmentYamlV2[] = createEnvTemplate(
      existingTemplate as EnvironmentYamlV2[],
      environmentIdentifiers,
      cloneDeep(environmentsData),
      gitOpsEnabled ? 'gitOpsClusters' : 'infrastructureDefinitions',
      serviceIdentifiers
    )

    // updated values based on selected environments
    const existingEnvironmentValues = get(formik.values, pathToEnvironments)
    // const newEnvironmentsValues = createEnvValues(
    //   isMultiEnvironment ? existingEnvironmentValues : [existingEnvironmentValues],
    //   environmentIdentifiers,
    //   cloneDeep(environmentsData),
    //   deployToAllEnvironments || false,
    //   gitOpsEnabled ? 'gitOpsClusters' : 'infrastructureDefinitions',
    //   serviceIdentifiers,
    //   isMultiEnvironment || false,
    //   stepViewType
    // )

    // const areEnvironmentsRuntimeUnderEnvGroup = !isBoolean(deployToAllEnvironments) && envGroupIdentifier
    // if (isMultiEnvironment) {
    //   const newFormikValues = { ...formik.values }
    //   if (areFiltersAdded) {
    //     set(
    //       newFormikValues,
    //       pathToEnvironments,
    //       newEnvironmentsValues.map(envValue => pick(envValue, 'environmentRef'))
    //     )
    //   } else {
    //     updateStageFormTemplate(newEnvironmentsTemplate, fullPath)

    //     // update form values
    //     set(newFormikValues, pathToEnvironments, newEnvironmentsValues)
    //   }

    //   if (areEnvironmentsRuntimeUnderEnvGroup) {
    //     set(newFormikValues, pathForDeployToAll, false)
    //   }
    //   formik.setFieldValue(mainEntityPath, get(newFormikValues, mainEntityPath))
    // } else {
    //   updateStageFormTemplate(newEnvironmentsTemplate[0], fullPath)
    //   formik.setFieldValue(mainEntityPath, newEnvironmentsValues[0])
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsData, environmentIdentifiers, envGroupIdentifier])

  const isMultiSvcTemplate =
    getMultiTypeFromValue(servicesTemplate as unknown as string) === MultiTypeInputType.RUNTIME ||
    (Array.isArray(servicesTemplate) &&
      servicesTemplate.some(svc => getMultiTypeFromValue(svc.serviceRef) === MultiTypeInputType.RUNTIME))

  // This contains the full path to the service being referenced. Used specifically to update the template
  const fullPathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  // This is the path prefix for updating inner formik values.
  // The inner formik receives the outer formik values object reduced to an object which has a key as one of the below prefixes
  const localPathPrefix = isMultiSvcTemplate ? 'services.' : 'service.'

  useDeepCompareEffect(() => {
    if (nonExistingServiceIdentifiers.length) {
      showWarning(
        getString('cd.identifiersDoNotExist', {
          entity: getString('service'),
          nonExistingIdentifiers: nonExistingServiceIdentifiers.join(', ')
        })
      )
    }
  }, [nonExistingServiceIdentifiers])

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
      if (isValueRuntimeInput(get(formik.values, `${localPathPrefix}values`))) {
        formik.setFieldValue(uniquePath.current, RUNTIME_INPUT_VALUE)
      } else {
        formik.setFieldValue(
          uniquePath.current,
          serviceIdentifiers.map(svcId => ({
            label: defaultTo(servicesList.find(s => s.identifier === svcId)?.name, svcId),
            value: svcId
          }))
        )
      }
    }
  }, [servicesList])

  useEffect(() => {
    const clonedFormikValue = cloneDeep(formik.values) as any
    if (getMultiTypeFromValue(deployParallelTemplate) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${localPathPrefix}metadata.parallel`,
        get(formik, `values.${localPathPrefix}metadata.parallel`) || false
      )

    formik.setValues({ ...clonedFormikValue })
  }, [])

  useDeepCompareEffect(() => {
    // This is specific handling for service as expression in templatized views
    if (serviceIdentifiers.length === 1 && isValueExpression(serviceValue)) {
      updateStageFormTemplate(undefined, `${fullPathPrefix}serviceInputs`)
      formik.setFieldValue(`${localPathPrefix}serviceInputs`, undefined)

      return
    }

    // if no value is selected, clear the inputs and template
    if (serviceIdentifiers.length === 0) {
      if (isValueRuntimeInput(servicesValue as unknown as string)) {
        return
      } else if (isMultiSvcTemplate) {
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
        serviceInputs: servicesData.find(svcTpl => getScopedValueFromDTO(svcTpl.service) === svcId)?.serviceInputs
      }
    })

    if (!servicesData.length) {
      return
    }
    // updated values based on selected services
    const newServicesValues: ServiceYamlV2[] = serviceIdentifiers.map(svcId => {
      const svcTemplate = servicesData.find(svcTpl => getScopedValueFromDTO(svcTpl.service) === svcId)?.serviceInputs
      const svcFormikValues = get(formik.values, `${localPathPrefix}values`)
      let serviceInputs =
        isMultiSvcTemplate && Array.isArray(svcFormikValues)
          ? svcFormikValues?.find((svc: ServiceYamlV2) => svc.serviceRef === svcId)?.serviceInputs
          : get(formik.values, `${localPathPrefix}serviceInputs`)

      if (!serviceInputs || isValueRuntimeInput(serviceInputs)) {
        serviceInputs = svcTemplate ? clearRuntimeInput(svcTemplate) : undefined
      } else {
        serviceInputs = !isEmpty(svcTemplate) ? merge(clearRuntimeInput(svcTemplate), serviceInputs) : svcTemplate
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
        `${fullPathPrefix}serviceInputs`
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

  function handleServicesChange(values: string | SelectOption[]): void {
    if (isValueRuntimeInput(values)) {
      updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}values`)
      formik.setFieldValue(`${localPathPrefix}values`, RUNTIME_INPUT_VALUE)
    } else {
      const newValues = Array.isArray(values)
        ? values.map(val => {
            let serviceInputs: any = RUNTIME_INPUT_VALUE
            const existingServiceInputs = servicesValue.find((ser: any) => ser.serviceRef === (val.value as string))
            if (existingServiceInputs) {
              serviceInputs = existingServiceInputs.serviceInputs
            }

            return {
              serviceRef: val.value as string,
              serviceInputs: serviceInputs
            }
          })
        : undefined

      formik.setFieldValue(`${localPathPrefix}values`, newValues)
    }
  }

  const loading = loadingServicesList || loadingServicesData || updatingData

  const commonProps = {
    name: isMultiSvcTemplate ? uniquePath.current : `${localPathPrefix}serviceRef`,
    tooltipProps: { dataTooltipId: 'specifyYourService' },
    label: isMultiSvcTemplate
      ? getString('cd.pipelineSteps.serviceTab.specifyYourServices')
      : getString('cd.pipelineSteps.serviceTab.specifyYourService'),
    disabled: inputSetData?.readonly || (isMultiSvcTemplate ? loading : false)
  }

  const allowableTypesWithoutExecution = (allowableTypes as MultiTypeInputType[])?.filter(
    item => item !== MultiTypeInputType.EXECUTION_TIME
  ) as AllowedTypes

  const allowableTypesWithoutExpressionExecution = (allowableTypes as MultiTypeInputType[])?.filter(
    item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
  ) as AllowedTypes

  return (
    <>
      <Layout.Horizontal style={{ flexDirection: 'column' }}>
        <div className={css.inputFieldLayout}>
          {getMultiTypeFromValue(serviceTemplate) === MultiTypeInputType.RUNTIME ? (
            CDS_OrgAccountLevelServiceEnvEnvGroup ? (
              <MultiTypeServiceField
                {...commonProps}
                deploymentType={deploymentType as ServiceDeploymentType}
                gitOpsEnabled={gitOpsEnabled}
                deploymentMetadata={deploymentMetadata}
                placeholder={getString('cd.pipelineSteps.serviceTab.selectService')}
                setRefValue={true}
                isNewConnectorLabelVisible={false}
                width={300}
                multiTypeProps={{
                  expressions,
                  allowableTypes: allowableTypesWithoutExecution,
                  defaultValueToReset: '',
                  onTypeChange: setServiceInputType
                }}
              />
            ) : (
              <ExperimentalInput
                {...commonProps}
                placeholder={getString('cd.pipelineSteps.serviceTab.selectService')}
                selectItems={selectOptions}
                useValue
                multiTypeInputProps={{
                  expressions,
                  allowableTypes: allowableTypesWithoutExecution,
                  selectProps: {
                    addClearBtn: !inputSetData?.readonly,
                    items: selectOptions,
                    onTypeChange: setServiceInputType
                  }
                }}
                className={css.inputWidth}
                formik={formik}
              />
            )
          ) : null}
        </div>
        {isMultiSvcTemplate ? (
          <>
            {CDS_OrgAccountLevelServiceEnvEnvGroup ? (
              <MultiTypeServiceField
                {...commonProps}
                deploymentType={deploymentType as ServiceDeploymentType}
                gitOpsEnabled={gitOpsEnabled}
                deploymentMetadata={deploymentMetadata}
                placeholder={getString('services')}
                isMultiSelect={true}
                onMultiSelectChange={handleServicesChange}
                // This is required to update values when the type has changed
                onChange={item => handleServicesChange(item as SelectOption[])}
                width={300}
                isNewConnectorLabelVisible={false}
                multiTypeProps={{
                  expressions,
                  allowableTypes: allowableTypesWithoutExpressionExecution
                }}
                multitypeInputValue={
                  typeof servicesValue === 'string' ? getMultiTypeFromValue(servicesValue) : MultiTypeInputType.FIXED
                }
              />
            ) : (
              <FormMultiTypeMultiSelectDropDown
                {...commonProps}
                dropdownProps={{
                  items: selectOptions,
                  placeholder: getString('services'),
                  disabled: loading || inputSetData?.readonly
                }}
                onChange={handleServicesChange}
                multiTypeProps={{
                  width: 300,
                  height: 32,
                  expressions,
                  allowableTypes: allowableTypesWithoutExpressionExecution
                }}
              />
            )}
            <div className={css.inputFieldLayout}>
              {getMultiTypeFromValue(deployParallelTemplate) === MultiTypeInputType.RUNTIME ? (
                <FormMultiTypeCheckboxField
                  label={getString('cd.pipelineSteps.serviceTab.multiServicesParallelDeployLabel')}
                  name={`${localPathPrefix}metadata.parallel`}
                  disabled={inputSetData?.readonly}
                  checkboxStyle={{ flexGrow: 'unset' }}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes: allowableTypesWithoutExpressionExecution,
                    width: 300
                  }}
                />
              ) : null}
            </div>
          </>
        ) : null}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
