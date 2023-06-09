/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { defaultTo, get, pick } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type { DeploymentStageConfig, ServiceSpec, ServiceYamlV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { getStepTypeByDeploymentType } from '@pipeline/utils/stageHelpers'

import type { StageInputSetFormProps } from '../StageInputSetForm'
import type { DeployServiceEntityData } from './ServicesInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export default function MultiServiceInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes,
  viewTypeMetadata
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'>): React.ReactElement | null {
  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()

  if (!deploymentStageTemplate?.services) return null

  const deploymentStageInputSet = get(formik?.values, path, {})

  const showServicesSelectionInputField =
    getMultiTypeFromValue(deploymentStageTemplate.services.values as unknown as string) ===
      MultiTypeInputType.RUNTIME ||
    (Array.isArray(deploymentStageTemplate.services.values) &&
      deploymentStageTemplate.services.values.some(
        svc => getMultiTypeFromValue(svc.serviceRef) === MultiTypeInputType.RUNTIME
      ))

  return (
    <div id={`Stage.${path}.${stageIdentifier}.Services`} className={cx(css.accordionSummary)}>
      <div className={css.inputheader}>{getString('services')}</div>

      <div className={css.nestedAccordions}>
        {showServicesSelectionInputField ? (
          <StepWidget<DeployServiceEntityData>
            factory={factory}
            initialValues={pick(deploymentStageInputSet, ['services'])}
            template={pick(deploymentStageTemplate, ['services'])}
            type={StepType.DeployServiceEntity}
            stepViewType={viewType}
            path={`${path}.services`}
            allowableTypes={allowableTypes}
            readonly={readonly}
            customStepProps={{
              stageIdentifier,
              deploymentType: deploymentStage?.deploymentType,
              gitOpsEnabled: deploymentStage?.gitOpsEnabled,
              deploymentMetadata: deploymentStage?.deploymentMetadata,
              allValues: pick(deploymentStage, ['services']),
              customDeploymentData: deploymentStage?.customDeploymentRef
            }}
            onUpdate={data => formik?.setFieldValue(`${path}.services`, get(data, 'services'))}
            viewTypeMetadata={viewTypeMetadata}
          />
        ) : null}

        {Array.isArray(deploymentStageTemplate.services.values) ? (
          <>
            {deploymentStageTemplate.services.values.map((serviceTemplate, i) => {
              const deploymentType = serviceTemplate.serviceInputs?.serviceDefinition?.type
              const service: ServiceYamlV2 = get(deploymentStageInputSet, `services.values[${i}]`, {})

              if (deploymentType) {
                return (
                  <React.Fragment key={`${service.serviceRef}_${i}`}>
                    <Text
                      font={{ size: 'normal', weight: 'bold' }}
                      margin={{ top: 'medium', bottom: 'medium' }}
                      color={Color.GREY_800}
                      lineClamp={1}
                    >
                      {getString('common.servicePrefix', { name: service.serviceRef })}
                    </Text>
                    <StepWidget<ServiceSpec>
                      factory={factory}
                      initialValues={get(service, `serviceInputs.serviceDefinition.spec`, {})}
                      allowableTypes={allowableTypes}
                      template={defaultTo(serviceTemplate?.serviceInputs?.serviceDefinition?.spec, {})}
                      type={getStepTypeByDeploymentType(deploymentType)}
                      stepViewType={viewType}
                      path={`${path}.services.values[${i}].serviceInputs.serviceDefinition.spec`}
                      readonly={readonly}
                      customStepProps={{
                        stageIdentifier,
                        serviceIdentifier: defaultTo(service.serviceRef, ''),
                        allValues: service.serviceInputs?.serviceDefinition?.spec
                      }}
                      viewTypeMetadata={viewTypeMetadata}
                    />
                  </React.Fragment>
                )
              }

              return null
            })}
          </>
        ) : null}
      </div>
    </div>
  )
}
