/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import type { InputSetViewValidateFieldsConfig, SecurityStepData, SecurityStepSpec } from './types'
import type { SecurityFieldProps } from './SecurityField'

type getStringProp = UseStringsReturn['getString']

export const dividerBottomMargin = 'var(--spacing-6)'

export const ORCHESTRATION_SCAN_MODE = {
  value: 'orchestration',
  label: 'Orchestration'
}
export const EXTRACTION_SCAN_MODE = {
  value: 'extraction',
  label: 'Extraction'
}
export const INGESTION_SCAN_MODE = {
  value: 'ingestion',
  label: 'Ingestion'
}
export const REPOSITORY_TARGET_TYPE = {
  value: 'repository',
  label: 'Repository'
}
export const CONTAINER_TARGET_TYPE = {
  value: 'container',
  label: 'Container Image'
}
export const INSTANCE_TARGET_TYPE = {
  value: 'instance',
  label: 'Instance'
}
export const LOCAL_IMAGE_CONTAINER_TYPE = {
  value: 'local_image',
  label: 'Local Image'
}
export const DOCKER_V2_CONTAINER_TYPE = {
  value: 'docker_v2',
  label: 'Docker v2'
}
export const JFROG_ARTIFACTORY_CONTAINER_TYPE = {
  value: 'jfrog_artifactory',
  label: 'Jfrog Artifactory'
}
export const AWS_ECR_CONTAINER_TYPE = {
  value: 'aws_ecr',
  label: 'AWS ECR'
}

export const API_KEY_AUTH_TYPE = {
  value: 'apiKey',
  label: 'API Key'
}
export const USER_PASSWORD_AUTH_TYPE = {
  value: 'usernamePassword',
  label: 'Username & Password'
}

export const API_VERSION_5_0_2 = {
  value: '5.0.2',
  label: '5.0.2'
}
export const API_VERSION_4_1_0 = {
  value: '4.1.0',
  label: '4.1.0'
}

export const API_VERSION_4_2_0 = {
  value: '4.2.0',
  label: '4.2.0'
}

export const ZAP_STANDARD_CONFIG = {
  value: 'standard',
  label: 'Standard'
}
export const ZAP_ATTACK_CONFIG = {
  value: 'attack',
  label: 'Attack'
}
export const ZAP_QUICK_CONFIG = {
  value: 'quick',
  label: 'Quick'
}
export const ZAP_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const instanceProtocolSelectItems = [
  {
    value: 'https',
    label: 'https'
  },
  {
    value: 'http',
    label: 'http'
  }
]

export const logLevelOptions = (getString: getStringProp) => [
  {
    label: getString('sto.stepField.optionLabels.logLevel.debug'),
    value: 'debug'
  },
  {
    label: getString('sto.Info'),
    value: 'info'
  },
  {
    label: getString('common.warning'),
    value: 'warning'
  },
  {
    label: getString('error'),
    value: 'error'
  }
]

export const severityOptions = (getString: getStringProp) => [
  {
    label: getString('sto.Critical'),
    value: 'critical'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.high'),
    value: 'high'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.medium'),
    value: 'medium'
  },
  {
    label: getString('connectors.cdng.verificationSensitivityLabel.low'),
    value: 'low'
  },
  {
    label: getString('none'),
    value: 'none'
  }
]

const specPrivileged = 'spec.privileged'
const specSettings = 'spec.settings'
const specRunAsUser = 'spec.runAsUser'

export const authFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.access_token',
          type: TransformValuesTypes.Text
        }
      ]
    : []

export const commonFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) => {
  const transformValuesFieldsConfigValues = [
    {
      name: 'identifier',
      type: TransformValuesTypes.Text
    },
    {
      name: 'name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'description',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.mode',
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.config',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.variant',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.level',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.serializer',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.fail_on_severity',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.include_raw',
      type: TransformValuesTypes.Text
    },
    {
      name: specSettings,
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.limitMemory',
      type: TransformValuesTypes.LimitMemory
    },
    {
      name: 'spec.limitCPU',
      type: TransformValuesTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: TransformValuesTypes.Text
    },
    {
      name: specPrivileged,
      type: TransformValuesTypes.Boolean
    },
    {
      name: specRunAsUser,
      type: TransformValuesTypes.Boolean
    },
    {
      name: 'spec.imagePullPolicy',
      type: TransformValuesTypes.ImagePullPolicy
    }
  ]

  if (
    data.spec.target.type === 'container' &&
    data.spec.image?.type === 'aws_ecr' &&
    data.spec.mode === 'orchestration'
  ) {
    transformValuesFieldsConfigValues.push({
      name: 'spec.image.region',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.target.type === 'container' && data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push(
      {
        name: 'spec.image.type',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.name',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.domain',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.access_id',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.access_token',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.tag',
        type: TransformValuesTypes.Text
      }
    )
  }

  if (data.spec.mode === 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.ingestion.file',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode !== 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.advanced.args.cli',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.target.workspace',
      type: TransformValuesTypes.Text
    })
  }

  return transformValuesFieldsConfigValues
}

export const authFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.auth.access_token',
    type: ValidationFieldTypes.Text,
    label: 'common.getStarted.accessTokenLabel',
    isRequired: data.spec.mode !== 'ingestion'
  }
]

export const ingestionFieldValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.ingestion.file',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.ingestion.file',
    isRequired: data.spec.mode === 'ingestion'
  }
]

export const imageFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.image.type',
    type: ValidationFieldTypes.Text,
    label: 'typeLabel',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.name',
    type: ValidationFieldTypes.Text,
    label: 'imageNameLabel',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  },
  {
    name: 'spec.image.domain',
    type: ValidationFieldTypes.Text,
    label: 'secrets.winRmAuthFormFields.domain'
  },
  {
    name: 'spec.image.access_token',
    type: ValidationFieldTypes.Text,
    label: 'common.getStarted.accessTokenLabel'
  },
  {
    name: 'spec.image.region',
    type: ValidationFieldTypes.Text,
    label: 'regionLabel',
    isRequired: data.spec.image?.type === 'aws_ecr'
  },
  {
    name: 'spec.image.access_id',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authAccessId'
  },
  {
    name: 'spec.image.tag',
    type: ValidationFieldTypes.Text,
    label: 'tagLabel',
    isRequired: data.spec.target?.type === 'container' && data.spec.mode === 'orchestration'
  }
]

export const commonFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.mode',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.mode',
    isRequired: true
  },
  {
    name: 'spec.config',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.config',
    isRequired: true
  },
  {
    name: 'spec.target.name',
    type: ValidationFieldTypes.Text,
    label: 'name',
    isRequired: true
  },
  {
    name: 'spec.target.type',
    type: ValidationFieldTypes.Text,
    label: 'typeLabel',
    isRequired: true
  },
  {
    name: 'spec.target.variant',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.variant',
    isRequired: true
  },
  {
    name: 'spec.target.workspace',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.workspace'
  },
  {
    name: 'spec.advanced.log.level',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.logLevel'
  },
  {
    name: 'spec.advanced.log.serializer',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.serializer'
  },
  {
    name: 'spec.advanced.args.cli',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.cli'
  },
  {
    name: 'spec.advanced.fail_on_severity',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.failOnSeverity'
  },
  {
    name: 'spec.advanced.include_raw',
    type: ValidationFieldTypes.Boolean,
    label: 'sto.stepField.advanced.includeRaw'
  },
  {
    name: specSettings,
    type: ValidationFieldTypes.Map
  },
  {
    name: specRunAsUser,
    type: ValidationFieldTypes.Numeric
  },
  {
    name: specPrivileged,
    type: ValidationFieldTypes.Boolean,
    label: 'pipeline.buildInfra.privileged'
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigEitView = [
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigInputSet: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export function getInputSetFieldName(prefix: string, field: string): string {
  return `${prefix}${field}`
}

export const inputSetScanFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        ...(shouldRenderRunTimeInputView(template?.spec.mode) && {
          [getInputSetFieldName(prefix, 'spec.mode')]: {
            label: 'sto.stepField.mode'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.config) && {
          [getInputSetFieldName(prefix, 'spec.config')]: {
            label: 'sto.stepField.config'
          }
        })
      }
    : {}

export const inputSetTargetFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Target fields
        ...(shouldRenderRunTimeInputView(template?.spec.target.name) && {
          [getInputSetFieldName(prefix, 'spec.target.name')]: {
            label: 'name'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target.type) && {
          [getInputSetFieldName(prefix, 'spec.target.type')]: {
            label: 'typeLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target.variant) && {
          [getInputSetFieldName(prefix, 'spec.target.variant')]: {
            label: 'sto.stepField.target.variant'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target.workspace) && {
          [getInputSetFieldName(prefix, 'spec.target.workspace')]: {
            label: 'pipelineSteps.workspace'
          }
        })
      }
    : {}

export const inputSetIngestionFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Ingestion fields
        ...(shouldRenderRunTimeInputView(template?.spec.ingestion?.file) && {
          [getInputSetFieldName(prefix, 'spec.ingestion.file')]: {
            label: 'sto.stepField.ingestion.file'
          }
        })
      }
    : {}

export const inputSetImageFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Image fields
        ...(shouldRenderRunTimeInputView(template?.spec.image?.name) && {
          [getInputSetFieldName(prefix, 'spec.image.name')]: {
            label: 'imageNameLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.domain) && {
          [getInputSetFieldName(prefix, 'spec.image.domain')]: {
            label: 'secrets.winRmAuthFormFields.domain'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.access_token) && {
          [getInputSetFieldName(prefix, 'spec.image.access_token')]: {
            label: 'common.getStarted.accessTokenLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.access_id) && {
          [getInputSetFieldName(prefix, 'spec.image.access_id')]: {
            label: 'sto.stepField.authAccessId'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.region) && {
          [getInputSetFieldName(prefix, 'spec.image.region')]: {
            label: 'regionLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.type) && {
          [getInputSetFieldName(prefix, 'spec.image.type')]: {
            label: 'typeLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.tag) && {
          [getInputSetFieldName(prefix, 'spec.image.tag')]: {
            label: 'tagLabel'
          }
        })
      }
    : {}

export const inputSetInstanceFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Instance fields
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.domain) && {
          [getInputSetFieldName(prefix, 'spec.instance.domain')]: {
            label: 'secrets.winRmAuthFormFields.domain'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.protocol) && {
          [getInputSetFieldName(prefix, 'spec.instance.protocol')]: {
            label: 'ce.common.protocol'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.port) && {
          [getInputSetFieldName(prefix, 'spec.instance.port')]: {
            label: 'common.smtp.port'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.path) && {
          [getInputSetFieldName(prefix, 'spec.instance.path')]: {
            label: 'common.path'
          }
        })
      }
    : {}

export const inputSetToolFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Tool fields
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.include) && {
          [getInputSetFieldName(prefix, 'spec.tool.include')]: {
            label: 'sto.stepField.toolInclude'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.java?.libraries) && {
          [getInputSetFieldName(prefix, 'spec.tool.java.libraries')]: {
            label: 'sto.stepField.tool.javaLibraries'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.java?.binaries) && {
          [getInputSetFieldName(prefix, 'spec.tool.java.binaries')]: {
            label: 'sto.stepField.tool.javaBinaries'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.context) && {
          [getInputSetFieldName(prefix, 'spec.tool.context')]: {
            label: 'sto.stepField.tool.context'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.port) && {
          [getInputSetFieldName(prefix, 'spec.tool.port')]: {
            label: 'common.smtp.port'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.image_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.image_name')]: {
            label: 'imageNameLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_name')]: {
            label: 'projectCard.projectName'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_version) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_version')]: {
            label: 'sto.stepField.tool.projectVersion'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.team_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.team_name')]: {
            label: 'sto.stepField.tool.teamName'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.product_token) && {
          [getInputSetFieldName(prefix, 'spec.tool.product_token')]: {
            label: 'sto.stepField.tool.productToken'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.product_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.product_name')]: {
            label: 'name'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_token) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_token')]: {
            label: 'sto.stepField.tool.projectToken'
          }
        })
      }
    : {}

export const inputSetAuthFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Auth fields
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.access_token) && {
          [getInputSetFieldName(prefix, 'spec.auth.access_token')]: {
            label: 'common.getStarted.accessTokenLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.domain) && {
          [getInputSetFieldName(prefix, 'spec.auth.domain')]: {
            label: 'secrets.winRmAuthFormFields.domain'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.access_id) && {
          [getInputSetFieldName(prefix, 'spec.auth.access_id')]: {
            label: 'sto.stepField.authAccessId'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.type) && {
          [getInputSetFieldName(prefix, 'spec.auth.type')]: {
            label: 'typeLabel'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.version) && {
          [getInputSetFieldName(prefix, 'spec.auth.version')]: {
            label: 'sto.stepField.authVersion'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.ssl) && {
          [getInputSetFieldName(prefix, 'spec.auth.ssl')]: {
            label: 'sto.stepField.authSsl',
            fieldType: 'checkbox'
          }
        })
      }
    : {}

export const inputSetAdvancedFields = (
  getString: getStringProp,
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Advanced fields
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.log?.level) && {
          [getInputSetFieldName(prefix, 'spec.advanced.log.level')]: {
            label: 'sto.stepField.advanced.logLevel',
            fieldType: 'dropdown',
            selectItems: logLevelOptions(getString)
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.log?.serializer) && {
          [getInputSetFieldName(prefix, 'spec.advanced.log.serializer')]: {
            label: 'ce.common.protocol'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.args?.cli) && {
          [getInputSetFieldName(prefix, 'spec.advanced.args.cli')]: {
            label: 'sto.stepField.advanced.cli'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.fail_on_severity) && {
          [getInputSetFieldName(prefix, 'spec.advanced.fail_on_severity')]: {
            label: 'sto.stepField.advanced.failOnSeverity',
            selectItems: severityOptions(getString),
            fieldType: 'dropdown'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.include_raw) && {
          [getInputSetFieldName(prefix, 'spec.advanced.include_raw')]: {
            label: 'sto.stepField.advanced.includeRaw'
          }
        })
      }
    : {}
