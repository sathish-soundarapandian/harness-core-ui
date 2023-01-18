/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, AllowedTypes, Container, SelectOption } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { get, isEmpty } from 'lodash-es'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { CIStepOptionalConfig } from '@ci/components/PipelineSteps/CIStep/CIStepOptionalConfig'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import StepCommonFields from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { SecurityStepData, SecurityStepSpec } from './types'
import SecurityField from './SecurityField'
import {
  AWS_ECR_CONTAINER_TYPE,
  dividerBottomMargin,
  DOCKER_V2_CONTAINER_TYPE,
  JFROG_ARTIFACTORY_CONTAINER_TYPE,
  LOCAL_IMAGE_CONTAINER_TYPE,
  logLevelOptions,
  severityOptions
} from './constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface SelectItems extends SelectOption {
  disabled?: boolean
}

type SecurityFieldsProps<T> = {
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  formik: FormikProps<T>
}

interface ISecurityScanFields extends SecurityFieldsProps<SecurityStepData<SecurityStepSpec>> {
  scanModeSelectItems: SelectItems[]
  scanConfigReadonly?: boolean
}

interface ISecurityTargetFields extends SecurityFieldsProps<SecurityStepData<SecurityStepSpec>> {
  targetTypeSelectItems: SelectItems[]
}

export function SecurityScanFields(props: ISecurityScanFields) {
  const { allowableTypes, formik, stepViewType, scanModeSelectItems, scanConfigReadonly } = props

  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<ISecurityScanFields>}
        enableFields={{
          'spec.mode': {
            label: 'sto.stepField.mode',
            fieldType: 'dropdown',
            inputProps: {
              disabled: scanModeSelectItems.length === 1
            },
            selectItems: scanModeSelectItems
          },
          'spec.config': {
            label: 'sto.stepField.config',
            inputProps: { disabled: scanConfigReadonly }
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}

export function SecurityTargetFields(props: ISecurityTargetFields) {
  const { allowableTypes, formik, stepViewType, targetTypeSelectItems } = props

  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<ISecurityTargetFields>}
        enableFields={{
          'spec.target.type': {
            fieldType: 'dropdown',
            label: 'sto.stepField.target.type',
            selectItems: targetTypeSelectItems,
            inputProps: { disabled: targetTypeSelectItems.length === 1 }
          },
          'spec.target.name': {
            label: 'sto.stepField.target.name'
          },
          'spec.target.variant': {
            label: 'sto.stepField.target.variant'
          },
          'spec.target.workspace': {
            optional: true,
            label: 'sto.stepField.target.workspace',
            hide: formik.values.spec.target.type === 'container' || formik.values.spec.mode === 'ingestion'
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}

export function SecurityIngestionFields(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props
  if (formik.values.spec.mode !== 'ingestion') return null
  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>>}
        enableFields={{
          'spec.ingestion.file': {
            label: 'sto.stepField.ingestion.file'
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}

export function SecurityAdvancedFields(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props
  const { getString } = useStrings()

  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>>}
        enableFields={{
          'spec.advanced.log.level': {
            optional: true,
            fieldType: 'dropdown',
            label: 'sto.stepField.advanced.logLevel',
            selectItems: logLevelOptions(getString)
          },
          'spec.advanced.args.cli': {
            optional: true,
            label: 'sto.stepField.advanced.cli',
            hide: formik.values.spec.mode !== 'orchestration'
          },
          'spec.advanced.fail_on_severity': {
            optional: true,
            fieldType: 'dropdown',
            label: 'sto.stepField.advanced.failOnSeverity',
            selectItems: severityOptions(getString)
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}

interface ISecurityAuthFields extends SecurityFieldsProps<SecurityStepData<SecurityStepSpec>> {
  initialAuthDomain?: string
  showFields?: {
    ssl?: boolean
    domain?: boolean
  }
}

export function SecurityAuthFields(props: ISecurityAuthFields) {
  const { allowableTypes, formik, stepViewType, initialAuthDomain, showFields } = props
  if (formik.values.spec.mode === 'ingestion') return null
  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>>}
        enableFields={{
          'spec.auth.access_token': {
            label: 'sto.stepField.authToken'
          },
          'spec.auth.domain': {
            label: 'sto.stepField.authDomain',
            hide: !showFields?.domain
          },
          'spec.auth.ssl': {
            label: 'sto.stepField.authSsl',
            fieldType: 'checkbox',
            hide:
              !showFields?.ssl ||
              (!isEmpty(formik.values.spec.auth?.domain) && formik.values.spec.auth?.domain === initialAuthDomain)
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}

export function SecurityImageFields(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props
  const hideNonLocalImageFields = !(
    formik.values.spec.target.type === 'container' &&
    formik.values.spec.image?.type !== 'local_image' &&
    formik.values.spec.mode === 'orchestration'
  )

  return (
    <SecurityField
      stepViewType={stepViewType}
      allowableTypes={allowableTypes}
      formik={formik as unknown as FormikProps<SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>>}
      enableFields={{
        'spec.image.type': {
          label: 'sto.stepField.image.type',
          hide: !(formik.values.spec.target.type === 'container' && formik.values.spec.mode === 'orchestration'),
          fieldType: 'dropdown',
          selectItems: [
            LOCAL_IMAGE_CONTAINER_TYPE,
            DOCKER_V2_CONTAINER_TYPE,
            JFROG_ARTIFACTORY_CONTAINER_TYPE,
            AWS_ECR_CONTAINER_TYPE
          ]
        },
        'spec.image.name': {
          label: 'imageNameLabel',
          hide: !(formik.values.spec.target.type === 'container' && formik.values.spec.mode === 'orchestration')
        },
        'spec.image.domain': {
          label: 'sto.stepField.image.domain',
          optional: true,
          hide: !(formik.values.spec.target.type === 'container' && formik.values.spec.mode === 'orchestration')
        },
        'spec.image.access_id': {
          label: 'sto.stepField.image.accessId',
          optional: true,
          hide: hideNonLocalImageFields
        },
        'spec.image.access_token': {
          label: 'sto.stepField.image.token',
          hide: hideNonLocalImageFields,
          optional: true
        },
        'spec.image.region': {
          label: 'sto.stepField.image.region',
          optional: true,
          hide: formik.values.spec.image?.type !== 'aws_ecr'
        }
      }}
    />
  )
}

type AdditionalFieldsProps = {
  currentStage: StageElementWrapper<BuildStageElementConfig> | undefined
  readonly?: boolean
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  formik: FormikProps<SecurityStepData<SecurityStepSpec>>
}

export const AdditionalFields = (props: AdditionalFieldsProps) => {
  const { currentStage, readonly, stepViewType, allowableTypes, formik } = props
  const { getString } = useStrings()
  const buildInfrastructureType =
    (get(currentStage, 'stage.spec.infrastructure.type') as CIBuildInfrastructureType) ||
    (get(currentStage, 'stage.spec.runtime.type') as CIBuildInfrastructureType)

  return (
    <>
      <SecurityAdvancedFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

      <CIStepOptionalConfig
        stepViewType={stepViewType}
        enableFields={{
          'spec.settings': {}
        }}
        allowableTypes={allowableTypes}
      />
      <Accordion className={css.accordion}>
        <Accordion.Panel
          id="additional-config"
          summary={getString('pipeline.additionalConfiguration')}
          details={
            <Container margin={{ top: 'medium' }}>
              <CIStepOptionalConfig
                stepViewType={stepViewType}
                enableFields={{
                  'spec.privileged': {
                    shouldHide: [
                      CIBuildInfrastructureType.Cloud,
                      CIBuildInfrastructureType.VM,
                      CIBuildInfrastructureType.KubernetesHosted,
                      CIBuildInfrastructureType.Docker
                    ].includes(buildInfrastructureType)
                  }
                }}
                allowableTypes={allowableTypes}
              />
              <StepCommonFields
                enableFields={['spec.imagePullPolicy']}
                disabled={readonly}
                allowableTypes={allowableTypes}
                buildInfrastructureType={buildInfrastructureType}
              />
            </Container>
          }
        />
      </Accordion>
    </>
  )
}

export function SecurityInstanceFields(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props
  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>>}
        enableFields={{
          'spec.instance.domain': {
            label: 'sto.stepField.instance.domain'
          },
          'spec.instance.protocol': {
            label: 'sto.stepField.instance.protocol'
          },
          'spec.instance.port': {
            label: 'sto.stepField.instance.port',
            optional: true
          },
          'spec.instance.path': {
            label: 'sto.stepField.instance.path',
            optional: true
          }
        }}
      />
      <Divider style={{ marginBottom: dividerBottomMargin }} />
    </>
  )
}
