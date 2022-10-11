/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isNull, isUndefined, omitBy, isEmpty, get, set, cloneDeep } from 'lodash-es'
import { string, object, ObjectSchema } from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { ConnectorResponse } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type {
  NGTriggerSourceV2,
  NGVariable,
  NGTriggerConfigV2,
  AcrSpec,
  AmazonS3RegistrySpec,
  NexusRegistrySpec,
  DockerRegistrySpec,
  ArtifactoryRegistrySpec,
  EcrSpec,
  GcrSpec,
  JenkinsRegistrySpec,
  TriggerEventDataCondition,
  ArtifactTriggerConfig
} from 'services/pipeline-ng'
import type { PanelInterface } from '@common/components/Wizard/Wizard'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import { NameIdSchema } from '@common/utils/Validation'
import type {
  TriggerConfigDTO,
  FlatOnEditValuesInterface
} from '@triggers/pages/triggers/interface/TriggersWizardInterface'
import type { AddConditionInterface } from '@triggers/pages/triggers/views/AddConditionsSection'
import type { ArtifactTriggerSpec } from '@triggers/components/steps/ArtifactTriggerConfigPanel/ArtifactsSelection/ArtifactInterface'
import type { TriggerType } from '../TriggerInterface'

export const TriggerTypes = {
  WEBHOOK: 'Webhook',
  NEW_ARTIFACT: 'NewArtifact',
  SCHEDULE: 'Scheduled',
  MANIFEST: 'Manifest',
  ARTIFACT: 'Artifact'
}

export const EventConditionTypes = {
  VERSION: 'version',
  BUILD: 'build'
}

const getArtifactTriggerTitle = ({
  triggerName,
  getString
}: {
  triggerName?: string
  getString: UseStringsReturn['getString']
}): string => {
  if (triggerName) {
    return `Trigger: ${triggerName}`
  }

  return getString('triggers.onNewArtifactTitle', {
    artifact: getString('pipeline.artifactTriggerConfigPanel.artifact')
  })
}

export const clearNullUndefined = /* istanbul ignore next */ (data: TriggerConfigDTO): TriggerConfigDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

const isUndefinedOrEmptyString = (str: string | undefined): boolean => isUndefined(str) || str?.trim() === ''

const isRowUnfilled = (payloadCondition: AddConditionInterface): boolean => {
  const truthyValuesLength = Object.values(payloadCondition).filter(val =>
    isUndefinedOrEmptyString(val?.trim?.())
  )?.length
  return truthyValuesLength > 0 && truthyValuesLength < 3
}

export const isRowFilled = (payloadCondition: AddConditionInterface): boolean => {
  const truthyValuesLength = Object.values(payloadCondition).filter(val => val?.trim?.())?.length
  return truthyValuesLength === 3
}

const isIdentifierIllegal = (identifier: string): boolean =>
  regexIdentifier.test(identifier) && illegalIdentifiers.includes(identifier)

const checkValidPipelineInput = ({ formikErrors }: { formikErrors: { [key: string]: any } }): boolean => {
  if (!isEmpty(formikErrors?.pipeline) || !isEmpty(formikErrors?.stages)) {
    return false
  }
  return true
}

const checkValidEventConditionsForNewArtifact = ({
  formikValues
}: {
  formikValues: { [key: string]: any }
}): boolean => {
  const eventConditions = formikValues['eventConditions']
  if (
    (formikValues['versionOperator'] && !formikValues['versionValue']) ||
    (!formikValues['versionOperator'] && formikValues['versionValue']?.trim()) ||
    (formikValues['buildOperator'] && !formikValues['buildValue']) ||
    (!formikValues['buildOperator'] && formikValues['buildValue']?.trim()) ||
    (eventConditions?.length &&
      eventConditions.some((eventCondition: AddConditionInterface) => isRowUnfilled(eventCondition)))
  ) {
    return false
  }
  return true
}

const checkValidSelectedArtifact = ({ formikValues }: { formikValues: { [key: string]: any } }): boolean => {
  return !isEmpty(formikValues?.source?.spec?.spec?.connectorRef)
}

const checkValidArtifactTriggerConfig = ({ formikValues }: { formikValues: { [key: string]: any } }): boolean => {
  return isIdentifierIllegal(formikValues?.identifier) ? false : checkValidSelectedArtifact({ formikValues })
}

const getArtifactTriggersPanels = ({
  getString
}: {
  getString: UseStringsReturn['getString']
}): PanelInterface[] | [] => {
  return [
    {
      id: 'Trigger Configuration',
      tabTitle: getString('configuration'),
      checkValidPanel: checkValidArtifactTriggerConfig,
      requiredFields: ['name', 'identifier'] // conditional required validations checkValidTriggerConfiguration
    },
    {
      id: 'Conditions',
      tabTitle: getString('conditions'),
      checkValidPanel: checkValidEventConditionsForNewArtifact
    },
    {
      id: 'Pipeline Input',
      tabTitle: getString('triggers.pipelineInputLabel'),
      checkValidPanel: checkValidPipelineInput
    }
  ]
}

export const getArtifactWizardMap = ({
  getString,
  triggerName
}: {
  triggerName?: string
  getString: UseStringsReturn['getString']
}): { wizardLabel: string; panels: PanelInterface[] } => ({
  wizardLabel: getArtifactTriggerTitle({
    getString,
    triggerName
  }),
  panels: getArtifactTriggersPanels({ getString })
})

export const getValidationSchema = (
  getString: (key: StringKeys, params?: any) => string
): ObjectSchema<Record<string, any> | undefined> => {
  return NameIdSchema({ nameRequiredErrorMsg: getString('triggers.validation.triggerName') }).shape({
    buildOperator: string().test('buildOperator', getString('triggers.validation.operator'), function (operator) {
      if (this.parent.buildValue?.trim()) {
        return !!operator
      }

      return true
    }),
    buildValue: string().test('buildValue', getString('triggers.validation.matchesValue'), function (matchesValue) {
      if (this.parent.buildOperator) {
        return !!matchesValue?.trim()
      }

      return true
    }),
    source: object().shape({
      spec: object().shape({
        spec: object().shape({
          connectorRef: string().test(
            'connectorRef',
            getString('triggers.validation.artifactSource'),
            function (connectorRef) {
              return !!connectorRef
            }
          )
        })
      })
    })
  })
}

const ciCodebaseBuild = {
  type: 'branch',
  spec: {
    branch: '<+trigger.branch>'
  }
}

export const getConnectorName = (connector?: ConnectorResponse): string => {
  let connectorName = ''

  if (connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier) {
    connectorName = `${connector?.connector?.type}: ${connector?.connector?.name}`
  } else if (connector?.connector?.orgIdentifier) {
    connectorName = `${connector?.connector?.type}[Org]: ${connector?.connector?.name}`
  } else {
    connectorName = `${connector?.connector?.type}[Account]: ${connector?.connector?.name}`
  }

  return connectorName
}

export const getConnectorValue = (connector?: ConnectorResponse): string => {
  let connectorValue = ''

  if (connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier) {
    connectorValue = connector?.connector?.identifier
  } else if (connector?.connector?.orgIdentifier) {
    connectorValue = `${Scope.ORG}.${connector?.connector?.identifier}`
  } else {
    connectorValue = `${Scope.ACCOUNT}.${connector?.connector?.identifier}`
  }

  return connectorValue
}

const TriggerDefaultFieldList = {
  chartVersion: '<+trigger.manifest.version>',
  build: '<+trigger.artifact.build>'
}

const getPipelineIntegrityMessage = (errorObject: { [key: string]: string }): string =>
  `${errorObject.fieldName}: ${errorObject.message}`

export const displayPipelineIntegrityResponse = (errors: {
  [key: string]: { [key: string]: string }
}): { [key: string]: string } => {
  // display backend error for validating pipeline with current pipeline
  const errs = {}
  const errorsEntries = Object.entries(errors)
  errorsEntries.forEach(entry => set(errs, entry[0], getPipelineIntegrityMessage(entry[1])))
  return errs
}

export const getOrderedPipelineVariableValues = ({
  originalPipelineVariables,
  currentPipelineVariables
}: {
  originalPipelineVariables?: NGVariable[]
  currentPipelineVariables: NGVariable[]
}): NGVariable[] => {
  const runtimeVariables = originalPipelineVariables?.filter(
    pipelineVariable => getMultiTypeFromValue(get(pipelineVariable, 'value')) === MultiTypeInputType.RUNTIME
  )

  if (
    runtimeVariables &&
    currentPipelineVariables.some(
      (variable: NGVariable, index: number) => variable.name !== runtimeVariables[index].name
    )
  ) {
    return runtimeVariables.map(
      variable =>
        currentPipelineVariables.find(currentVariable => currentVariable.name === variable.name) ||
        Object.assign(variable, { value: '' })
    )
  }
  return currentPipelineVariables
}

const clearUndefinedArtifactId = (newPipelineObj = {}): any => {
  // temporary fix, undefined artifact id gets injected somewhere and needs to be removed for submission
  const clearedNewPipeline: any = cloneDeep(newPipelineObj)
  const clearedNewPipelineObj = clearedNewPipeline.template
    ? clearedNewPipeline.template.templateInputs
    : clearedNewPipeline

  clearedNewPipelineObj?.stages?.forEach((stage: any) => {
    const isParallel = !!stage.parallel
    if (isParallel) {
      stage.parallel.forEach((parallelStage: any) => {
        const finalStage = parallelStage?.stage?.template
          ? parallelStage?.stage?.template?.templateInputs
          : parallelStage?.stage
        const parallelStageArtifacts = finalStage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts
        const [artifactKey, artifactValues] =
          (parallelStageArtifacts && Object.entries(parallelStageArtifacts)?.[0]) || []

        if (artifactValues && Object.keys(artifactValues)?.includes('identifier') && !artifactValues.identifier) {
          // remove undefined or null identifier
          delete parallelStageArtifacts[artifactKey].identifier
        }
      })
    } else {
      const finalStage = stage?.stage?.template ? stage?.stage?.template?.templateInputs : stage?.stage
      const stageArtifacts = finalStage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts
      const [artifactKey, artifactValues] = (stageArtifacts && Object.entries(stageArtifacts)?.[0]) || []

      if (artifactValues && Object.keys(artifactValues)?.includes('identifier') && !artifactValues.identifier) {
        // remove undefined or null identifier
        delete stageArtifacts[artifactKey].identifier
      }
    }
  })

  return clearedNewPipeline
}

export const getModifiedTemplateValues = (
  initialValuesForEdit: FlatOnEditValuesInterface
): FlatOnEditValuesInterface => {
  const returnInitialValuesForEdit = { ...initialValuesForEdit }
  if (
    returnInitialValuesForEdit?.pipeline?.template?.templateInputs?.properties?.ci?.codebase?.repoName === '' &&
    !!returnInitialValuesForEdit.pipeline.template.templateInputs.properties.ci.codebase.connectorRef
  ) {
    // for CI Codebase, remove repoName: "" onEdit since connector is repo url type
    delete returnInitialValuesForEdit.pipeline.template.templateInputs.properties.ci.codebase.repoName
  }
  return returnInitialValuesForEdit
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

enum TriggerGitEvent {
  PULL_REQUEST = 'PullRequest',
  ISSUE_COMMENT = 'IssueComment',
  PUSH = 'Push',
  MR_COMMENT = 'MRComment',
  PR_COMMENT = 'PRComment'
}

export const isHarnessExpression = (str = ''): boolean => str.startsWith('<+') && str.endsWith('>')

const replaceRunTimeVariables = ({
  artifactType,
  selectedArtifact
}: {
  artifactType: string
  selectedArtifact: any
}) => {
  if (artifactType && selectedArtifact?.spec?.tag) {
    selectedArtifact.spec.tag = TriggerDefaultFieldList.build
  }
}

const replaceStageArtifacts = ({ filteredStage, selectedArtifact }: { filteredStage: any; selectedArtifact: any }) => {
  const stageArtifacts = filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts
  const stageArtifactIdx =
    filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars?.findIndex(
      (item: any) => item.sidecar?.identifier === selectedArtifact?.identifier
    )

  if (stageArtifactIdx >= 0) {
    stageArtifacts['sidecars'][stageArtifactIdx].sidecar = selectedArtifact
  }
}

const replaceEventConditions = ({
  values,
  persistIncomplete,
  triggerYaml
}: {
  values: any
  persistIncomplete: boolean
  triggerYaml: any
}) => {
  const { versionOperator, versionValue, buildOperator, buildValue, eventConditions = [] } = values
  if (
    ((versionOperator && versionValue?.trim()) || (persistIncomplete && (versionOperator || versionValue?.trim()))) &&
    !eventConditions.some((eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.VERSION)
  ) {
    eventConditions.unshift({
      key: EventConditionTypes.VERSION,
      operator: versionOperator || '',
      value: versionValue || ''
    })
  } else if (
    ((buildOperator && buildValue?.trim()) || (persistIncomplete && (buildOperator || buildValue?.trim()))) &&
    !eventConditions.some((eventCondition: AddConditionInterface) => eventCondition.key === EventConditionTypes.BUILD)
  ) {
    eventConditions.unshift({
      key: EventConditionTypes.BUILD,
      operator: buildOperator || '',
      value: buildValue || ''
    })
  }

  if (triggerYaml.source?.spec) {
    const sourceSpecSpec = { ...triggerYaml.source?.spec.spec }
    sourceSpecSpec.eventConditions = persistIncomplete
      ? eventConditions
      : eventConditions.filter((eventCondition: AddConditionInterface) => isRowFilled(eventCondition))
    triggerYaml.source.spec.spec = sourceSpecSpec
  }
}

// @see https://github.com/lodash/lodash/issues/2240#issuecomment-995160298
export const flattenKeys = (obj: any = {}, initialPathPrefix = 'pipeline'): Record<string, any> => {
  if (!obj || typeof obj !== 'object') {
    return [{ [initialPathPrefix]: obj }]
  }

  const prefix = initialPathPrefix ? (Array.isArray(object) ? initialPathPrefix : `${initialPathPrefix}.`) : ''

  return Object.keys(obj)
    .flatMap(key => flattenKeys(obj[key], Array.isArray(obj) ? `${prefix}[${key}]` : `${prefix}${key}`))
    .reduce((acc, path) => ({ ...acc, ...path }), {})
}

export const getDefaultPipelineReferenceBranch = (triggerType = '', event = ''): string => {
  if (triggerType === TriggerTypes.WEBHOOK) {
    switch (event) {
      case TriggerGitEvent.ISSUE_COMMENT:
      case TriggerGitEvent.PULL_REQUEST:
      default:
        return ciCodebaseBuild.spec.branch
    }
  }

  return ''
}

export const getArtifactTriggerYaml = ({
  values: val,
  orgIdentifier,
  enabledStatus,
  projectIdentifier,
  pipelineIdentifier,
  persistIncomplete = false,
  gitAwareForTriggerEnabled: _gitAwareForTriggerEnabled
}: {
  values: any
  orgIdentifier: string
  enabledStatus: boolean
  projectIdentifier: string
  pipelineIdentifier: string
  persistIncomplete?: boolean
  gitAwareForTriggerEnabled: boolean | undefined
}): TriggerConfigDTO => {
  const {
    name,
    identifier,
    description,
    tags,
    pipeline: pipelineRuntimeInput,
    triggerType: formikValueTriggerType,
    event,
    selectedArtifact,
    stageId,
    pipelineBranchName = getDefaultPipelineReferenceBranch(formikValueTriggerType, event),
    inputSetRefs,
    source
  } = val

  const { spec: triggerSpec } = source ?? {}
  const { type: artifactType } = triggerSpec ?? {}

  replaceRunTimeVariables({ artifactType, selectedArtifact })
  let newPipeline = cloneDeep(pipelineRuntimeInput)
  const newPipelineObj = newPipeline.template ? newPipeline.template.templateInputs : newPipeline
  const filteredStage = newPipelineObj.stages?.find((item: any) => item.stage?.identifier === stageId)

  replaceStageArtifacts({ filteredStage, selectedArtifact })
  newPipeline = clearUndefinedArtifactId(newPipeline)
  const stringifyPipelineRuntimeInput = yamlStringify({
    pipeline: clearNullUndefined(newPipeline)
  })

  const triggerYaml: NGTriggerConfigV2 = {
    name,
    identifier,
    enabled: enabledStatus,
    description,
    tags,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    source,
    inputYaml: stringifyPipelineRuntimeInput,
    pipelineBranchName: _gitAwareForTriggerEnabled ? pipelineBranchName : null,
    inputSetRefs: _gitAwareForTriggerEnabled ? inputSetRefs : null
  }
  if (artifactType) {
    if (triggerYaml?.source?.spec && Object.getOwnPropertyDescriptor(triggerYaml?.source?.spec, 'manifestRef')) {
      delete triggerYaml.source.spec.manifestRef
    }
  }

  replaceEventConditions({ values: val, persistIncomplete, triggerYaml })

  return clearNullUndefined(triggerYaml)
}

export const getTriggerArtifactInitialSpec = (
  artifactType: ArtifactTriggerConfig['type']
): ArtifactTriggerSpec | undefined => {
  const connectorRef = ''
  const tag = '<+trigger.artifact.build>'
  const eventConditions: TriggerEventDataCondition[] = []
  const imagePath = ''

  switch (artifactType) {
    case 'Gcr': {
      return {
        connectorRef,
        eventConditions,
        imagePath,
        registryHostname: '',
        tag
      } as GcrSpec
    }
    case 'Ecr': {
      return {
        connectorRef,
        eventConditions,
        imagePath,
        region: '',
        tag
      } as EcrSpec
    }
    case 'ArtifactoryRegistry': {
      return {
        artifactDirectory: '',
        connectorRef,
        eventConditions,
        repository: '',
        repositoryFormat: ''
      } as ArtifactoryRegistrySpec
    }
    case 'AmazonS3': {
      return {
        bucketName: '',
        connectorRef,
        eventConditions,
        filePathRegex: '',
        region: ''
      } as AmazonS3RegistrySpec
    }
    case 'DockerRegistry': {
      return {
        connectorRef,
        eventConditions,
        imagePath,
        tag
      } as DockerRegistrySpec
    }
    case 'Acr': {
      return {
        connectorRef,
        eventConditions,
        registry: '',
        repository: '',
        subscriptionId: '',
        tag
      } as AcrSpec
    }
    case 'Nexus3Registry': {
      return {
        connectorRef,
        eventConditions,
        imagePath,
        repositoryFormat: 'repositoryUrl',
        repositoryName: '',
        repositoryUrl: '',
        tag
      } as NexusRegistrySpec
    }
    case 'Jenkins': {
      return {
        artifactPath: '',
        connectorRef,
        eventConditions,
        jobName: ''
      } as JenkinsRegistrySpec
    }
  }
}

export const getTriggerArtifactInitialSource = (
  triggerType: TriggerType,
  artifactType: ArtifactTriggerConfig['type']
): NGTriggerSourceV2 => ({
  type: triggerType,
  spec: {
    type: artifactType,
    spec: getTriggerArtifactInitialSpec(artifactType)
  }
})
