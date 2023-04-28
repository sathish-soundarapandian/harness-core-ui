/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  useToggleOpen,
  ConfirmationDialog,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Intent } from '@blueprintjs/core'
import produce from 'immer'
import type { ServiceDefinition, ServiceYamlV2, TemplateLinkConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useStageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isMultiTypeExpression, isMultiTypeRuntime, isValueExpression, isValueRuntimeInput } from '@common/utils/utils'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import {
  DeployServiceEntityData,
  DeployServiceEntityCustomProps,
  FormState,
  getValidationSchema,
  getAllFixedServices,
  getAllFixedServicesFromValues
} from './DeployServiceEntityUtils'
import { useGetServicesData } from './useGetServicesData'
import { setupMode } from '../PipelineStepsUtil'
import BaseDeployServiceEntity from './BaseDeployServiceEntity'

export interface DeployServiceEntityWidgetProps extends DeployServiceEntityCustomProps {
  initialValues: DeployServiceEntityData
  readonly: boolean
  allowableTypes: AllowedTypes
  customStepProps?: DeployServiceEntityCustomProps
  serviceLabel?: string
  onUpdate?(data: DeployServiceEntityData): void
}

function getInitialValues(data: DeployServiceEntityData): FormState {
  if (data.service && data.service.serviceRef) {
    return {
      service: data.service.serviceRef,
      serviceInputs:
        getMultiTypeFromValue(data.service.serviceRef) === MultiTypeInputType.FIXED
          ? { [data.service.serviceRef]: data.service.serviceInputs }
          : isValueExpression(data.service.serviceRef)
          ? { service: { expression: data.service.serviceInputs } }
          : {}
    }
  } else if (data.services) {
    if (Array.isArray(data.services.values)) {
      return {
        services: data.services.values.map(svc => ({
          value: defaultTo(svc.serviceRef, ''),
          label: defaultTo(svc.serviceRef, '')
        })),
        serviceInputs: data.services.values.reduce(
          (p, c) => ({ ...p, [defaultTo(c.serviceRef, '')]: c.serviceInputs }),
          {}
        ),
        parallel: !!get(data, 'services.metadata.parallel', true)
      }
    }

    return {
      services: data.services.values,
      serviceInputs: {},
      parallel: !!get(data, 'services.metadata.parallel', true)
    }
  }

  return { parallel: !!get(data, 'services.metadata.parallel', true) }
}

export default function DeployServiceEntityWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceLabel,
  deploymentType,
  gitOpsEnabled,
  deploymentMetadata,
  stageIdentifier,
  setupModeType
}: DeployServiceEntityWidgetProps): React.ReactElement {
  const { getString } = useStrings()

  const { subscribeForm, unSubscribeForm } = useStageErrorContext<FormState>()
  const formikRef = React.useRef<FormikProps<FormState> | null>(null)
  const {
    isOpen: isSwitchToMultiSvcDialogOpen,
    open: openSwitchToMultiSvcDialog,
    close: closeSwitchToMultiSvcDialog
  } = useToggleOpen()
  const {
    isOpen: isSwitchToMultiSvcClearDialogOpen,
    open: openSwitchToMultiSvcClearDialog,
    close: closeSwitchToMultiSvcClearDialog
  } = useToggleOpen()
  const {
    isOpen: isSwitchToSingleSvcDialogOpen,
    open: openSwitchToSingleSvcDialog,
    close: closeSwitchToSingleSvcDialog
  } = useToggleOpen()
  const [allServices, setAllServices] = useState(
    setupModeType === setupMode.DIFFERENT ? getAllFixedServices(initialValues) : ['']
  )
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const { templateRef: deploymentTemplateIdentifier, versionLabel } =
    (get(stage, 'stage.spec.customDeploymentRef') as TemplateLinkConfig) || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  const [serviceInputType, setServiceInputType] = React.useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues?.service?.serviceRef)
  )
  const { servicesList } = useGetServicesData({
    gitOpsEnabled,
    deploymentMetadata,
    serviceIdentifiers: allServices,
    deploymentType: deploymentType as ServiceDefinition['type'],
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {}),
    lazyService: isMultiTypeExpression(serviceInputType)
  })

  useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateValuesInFormikAndPropagate(values: FormState): void {
    /* istanbul ignore else */
    if (formikRef.current) {
      formikRef.current.setTouched({ service: true, services: true })
      formikRef.current.setValues(values)
    }
  }

  function handleUpdate(values: FormState): void {
    if (setupModeType === setupMode.PROPAGATE) {
      return
    }
    /* istanbul ignore else */
    if (!isNil(values.services)) {
      onUpdate?.({
        services: {
          values: Array.isArray(values.services)
            ? values.services.map(
                (opt): ServiceYamlV2 => ({
                  serviceRef: opt.value as string,
                  serviceInputs: get(values.serviceInputs, opt.value)
                })
              )
            : values.services,
          metadata: {
            parallel: !!values.parallel
          }
        }
      })
    } else if (!isNil(values.service)) {
      const typeOfService = getMultiTypeFromValue(values.service)
      let serviceInputs = undefined

      if (typeOfService === MultiTypeInputType.FIXED) {
        serviceInputs = get(values.serviceInputs, values.service)
      } else if (isMultiTypeRuntime(typeOfService)) {
        serviceInputs = RUNTIME_INPUT_VALUE
      } else if (isMultiTypeExpression(typeOfService)) {
        serviceInputs = get(values.serviceInputs, 'service.expression')
      }

      onUpdate?.({
        service: {
          serviceRef: values.service,
          serviceInputs
        }
      })
    }

    setAllServices(getAllFixedServicesFromValues(values))
  }

  function handleSwitchToMultiSvcConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const singleSvcId = formikRef.current.values.service
      const singleSvc = servicesList.find(svc => svc.identifier === singleSvcId)
      const newValues = produce(formikRef.current.values, draft => {
        draft.services = singleSvc
          ? [{ label: singleSvc.name, value: singleSvc.identifier }]
          : isValueRuntimeInput(singleSvcId)
          ? (RUNTIME_INPUT_VALUE as any)
          : []
        delete draft.service
      })

      setServiceInputType(getMultiTypeFromValue(singleSvcId))
      updateValuesInFormikAndPropagate(newValues)
    }

    closeSwitchToMultiSvcDialog()
  }

  function handleSwitchToMultiSvcClearConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const newValues = produce(formikRef.current.values, draft => {
        draft.parallel = true
        draft.services = []
        draft.serviceInputs = {}
        delete draft.service
      })

      setServiceInputType(MultiTypeInputType.FIXED)
      updateValuesInFormikAndPropagate(newValues)
    }

    closeSwitchToMultiSvcClearDialog()
  }

  function handleSwitchToSingleSvcConfirmation(confirmed: boolean): void {
    /* istanbul ignore else */
    if (formikRef.current && confirmed) {
      const newValues = produce(formikRef.current.values, draft => {
        draft.service = ''
        delete draft.services
      })
      updateValuesInFormikAndPropagate(newValues)
    }

    closeSwitchToSingleSvcDialog()
  }

  function getMultiSvcToggleHandler(values: FormState) {
    return (checked: boolean): void => {
      if (checked) {
        // open confirmation dialog only if a service is populated
        if (values.service) {
          if (isValueExpression(values.service)) {
            openSwitchToMultiSvcClearDialog()
          } else {
            openSwitchToMultiSvcDialog()
          }
        } else {
          handleSwitchToMultiSvcConfirmation(true)
        }
      } else {
        // open confirmation dialog only if atleast one service is populated
        if (isEmpty(values.services)) {
          handleSwitchToSingleSvcConfirmation(true)
        } else {
          openSwitchToSingleSvcDialog()
        }
      }
    }
  }

  return (
    <>
      <Formik<FormState>
        formName="deployServiceStepForm"
        onSubmit={noop}
        validate={handleUpdate}
        initialValues={getInitialValues(initialValues)}
        validationSchema={setupModeType === setupMode.DIFFERENT && getValidationSchema(getString)}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
          formikRef.current = formik

          return (
            <BaseDeployServiceEntity
              initialValues={initialValues}
              readonly={readonly}
              allowableTypes={allowableTypes}
              onUpdate={onUpdate}
              stageIdentifier={stageIdentifier}
              setupModeType={setupModeType}
              serviceLabel={serviceLabel}
              getMultiSvcToggleHandler={getMultiSvcToggleHandler}
            />
          )
        }}
      </Formik>
      <ConfirmationDialog
        isOpen={isSwitchToMultiSvcDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.multiServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.multiServicesConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToMultiSvcConfirmation}
        intent={Intent.WARNING}
      />
      <ConfirmationDialog
        isOpen={isSwitchToMultiSvcClearDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.multiServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.multiServicesClearConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToMultiSvcClearConfirmation}
        intent={Intent.WARNING}
      />
      <ConfirmationDialog
        isOpen={isSwitchToSingleSvcDialogOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.singleServicesTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.singleServicesConfirmationText')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleSwitchToSingleSvcConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
