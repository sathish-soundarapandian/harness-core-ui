/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import type { ValidateArtifactInputSetFieldArgs } from '../types'

interface CheckForValidationAndSetErrorArgs {
  data: K8SDirectServiceStep
  template?: K8SDirectServiceStep
  isRequired: boolean
  errors: FormikErrors<K8SDirectServiceStep>
  dataPathToField: string
  templatePathToField: string
  errorMessage?: string
}

const checkForValidationAndSetError = ({
  data,
  template,
  errors,
  isRequired,
  dataPathToField,
  templatePathToField,
  errorMessage
}: CheckForValidationAndSetErrorArgs): void => {
  if (
    isEmpty(get(data, dataPathToField)) &&
    isRequired &&
    getMultiTypeFromValue(get(template, templatePathToField)) === MultiTypeInputType.RUNTIME
  ) {
    set(errors, dataPathToField, errorMessage)
  }
}

export const validateCommonArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.imagePath`,
    template,
    templatePathToField: `${templatePathToField}.imagePath`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.imagePathLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tag`,
    template,
    templatePathToField: `${templatePathToField}.tag`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tagRegex`,
    template,
    templatePathToField: `${templatePathToField}.tagRegex`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagRegex') })
  })
}

export const validateAmazonS3ArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.bucketName`,
    template,
    templatePathToField: `${templatePathToField}.bucketName`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('common.bucketName') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.filePath`,
    template,
    templatePathToField: `${templatePathToField}.filePath`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('common.git.filePath') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.filePathRegex`,
    template,
    templatePathToField: `${templatePathToField}.filePathRegex`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.filePathRegexLabel') })
  })
}

export const validateECRArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  validateCommonArtifactFields({
    data,
    dataPathToField,
    template,
    templatePathToField,
    getString,
    isRequired,
    errors
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.region`,
    template,
    templatePathToField: `${templatePathToField}.region`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('regionLabel') })
  })
}

export const validateGCRArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  validateCommonArtifactFields({
    data,
    dataPathToField,
    template,
    templatePathToField,
    getString,
    isRequired,
    errors
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.registryHostname`,
    template,
    templatePathToField: `${templatePathToField}.registryHostname`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('connectors.GCR.registryHostname') })
  })
}

export const validateCustomArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.timeout`,
    template,
    templatePathToField: `${templatePathToField}.timeout`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.timeoutLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.scripts.fetchAllArtifacts.spec.source.spec.script`,
    template,
    templatePathToField: `${templatePathToField}.scripts.fetchAllArtifacts.spec.source.spec.script`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('common.script') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.scripts.fetchAllArtifacts.artifactsArrayPath`,
    template,
    templatePathToField: `${templatePathToField}.scripts.fetchAllArtifacts.artifactsArrayPath`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.artifactsArrayPath') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.scripts.fetchAllArtifacts.versionPath`,
    template,
    templatePathToField: `${templatePathToField}.scripts.fetchAllArtifacts.versionPath`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.versionPath') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.version`,
    template,
    templatePathToField: `${templatePathToField}.version`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('version') })
  })
}

export const validateJenkinsArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.jobName`,
    template,
    templatePathToField: `${templatePathToField}.jobName`,
    isRequired,
    errors,
    errorMessage: getString?.('pipeline.jenkinsStep.validations.jobName')
  })
}

export const validateArtifactoryArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.repository`,
    template,
    templatePathToField: `${templatePathToField}.repository`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('repository') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.artifactDirectory`,
    template,
    templatePathToField: `${templatePathToField}.artifactDirectory`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.artifactDirectory') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.artifactPath`,
    template,
    templatePathToField: `${templatePathToField}.artifactPath`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactPathLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.artifactPathFilter`,
    template,
    templatePathToField: `${templatePathToField}.artifactPathFilter`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: 'Artifact Path Filter' })
  })
}

export const validateNexus2ArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.repository`,
    template,
    templatePathToField: `${templatePathToField}.repository`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('repository') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.groupId`,
    template,
    templatePathToField: `${templatePathToField}.spec.groupId`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.groupId') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.artifactId`,
    template,
    templatePathToField: `${templatePathToField}.spec.artifactId`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.artifactId') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tag`,
    template,
    templatePathToField: `${templatePathToField}.tag`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tagRegex`,
    template,
    templatePathToField: `${templatePathToField}.tagRegex`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagRegex') })
  })
}

export const validateNexus3ArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.repository`,
    template,
    templatePathToField: `${templatePathToField}.repository`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('repository') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.repositoryUrl`,
    template,
    templatePathToField: `${templatePathToField}.spec.repositoryUrl`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('repositoryUrlLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.packageName`,
    template,
    templatePathToField: `${templatePathToField}.spec.packageName`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.packageName') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.groupId`,
    template,
    templatePathToField: `${templatePathToField}.spec.groupId`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.groupId') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.spec.artifactId`,
    template,
    templatePathToField: `${templatePathToField}.spec.artifactId`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.artifactId') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tag`,
    template,
    templatePathToField: `${templatePathToField}.tag`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagLabel') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.tagRegex`,
    template,
    templatePathToField: `${templatePathToField}.tagRegex`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('tagRegex') })
  })
}

export const validateACRArtifactFields = ({
  data,
  dataPathToField,
  template,
  templatePathToField,
  getString,
  isRequired,
  errors
}: ValidateArtifactInputSetFieldArgs): void => {
  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.connectorRef`,
    template,
    templatePathToField: `${templatePathToField}.connectorRef`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipelineSteps.deploy.inputSet.artifactServer') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.subscriptionId`,
    template,
    templatePathToField: `${templatePathToField}.subscriptionId`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.ACR.subscription') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.registry`,
    template,
    templatePathToField: `${templatePathToField}.registry`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('pipeline.ACR.registry') })
  })

  checkForValidationAndSetError({
    data,
    dataPathToField: `${dataPathToField}.repository`,
    template,
    templatePathToField: `${templatePathToField}.repository`,
    isRequired,
    errors,
    errorMessage: getString?.('fieldRequired', { field: getString?.('repository') })
  })
}
