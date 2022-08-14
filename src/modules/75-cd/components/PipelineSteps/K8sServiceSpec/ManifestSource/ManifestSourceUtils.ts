/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikValues } from 'formik'
import { get, isEmpty, unset } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { TriggerDefaultFieldList, TriggerTypes } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type { ManifestAttributes } from 'services/cd-ng'

export const DefaultParam = 'defaultParam'
export const fromPipelineInputTriggerTab = (formik: FormikValues, fromTrigger = false): boolean => {
  return (
    formik?.values?.triggerType === TriggerTypes.MANIFEST && !isEmpty(formik?.values?.selectedArtifact) && !fromTrigger
  )
}
export function isNewServiceEntity(path: string): boolean {
  return path?.includes('service.serviceInputs.serviceDefinition')
}
export const isSelectedStage = (stageIdentifier: string, formikStageId: string): boolean =>
  stageIdentifier === formikStageId
export const isSelectedManifest = (selectedManifest: any, identifier: string): boolean =>
  !isEmpty(selectedManifest) && (!selectedManifest.identifier || selectedManifest.identifier === identifier)

export const isFieldfromTriggerTabDisabled = (
  fieldName: string,
  formik: FormikValues,
  stageIdentifier: string,
  identifier: string,
  fromTrigger = false
): boolean => {
  if (fromTrigger) {
    // Trigger Configuration Tab
    return get(TriggerDefaultFieldList, fieldName) ? true : false
  } else if (
    fromPipelineInputTriggerTab(formik, fromTrigger) &&
    isSelectedManifest(formik?.values?.selectedArtifact, identifier) &&
    isSelectedStage(stageIdentifier, formik?.values?.stageId)
  ) {
    return true
  }
  return false
}

export const shouldDisplayRepositoryName = (item: any): boolean => {
  return (
    item?.record?.spec?.connectionType === GitRepoName.Repo ||
    item?.record?.spec?.type === GitRepoName.Repo ||
    item?.connector?.spec?.connectionType === GitRepoName.Repo ||
    item?.connector?.spec?.type === GitRepoName.Repo
  )
}

export const getDefaultQueryParam = (initialQueryData: string, formikQueryDataValue: string): string => {
  //initialConnectorRefData is empty in case of new service entity, so we return defaultParam string to make tag as enabled
  if (isEmpty(initialQueryData)) {
    return DefaultParam
  }
  return getMultiTypeFromValue(initialQueryData) !== MultiTypeInputType.RUNTIME
    ? initialQueryData
    : formikQueryDataValue
}

export function getFinalQueryParamData(initialParam: string): string | undefined {
  return initialParam !== DefaultParam ? initialParam : undefined
}

export const getManifestTriggerSetValues = (
  initialValues: K8SDirectServiceStep,
  formik: FormikValues,
  stageIdentifier: string,
  manifestPath: string
): { identifier: string; type: ManifestTypes; spec: ManifestAttributes } | undefined => {
  if (stageIdentifier === formik?.values?.stageId) {
    const initialArtifactValue = get(initialValues, `${manifestPath}`)
    const { selectedArtifact } = formik?.values || {}

    if (initialArtifactValue && selectedArtifact.identifier === initialArtifactValue.identifier) {
      /*
         backend requires eventConditions  inside selectedArtifact but should not be added to inputYaml
        */
      if (selectedArtifact?.spec.eventConditions && selectedArtifact?.spec.store) {
        unset(selectedArtifact?.spec, 'eventConditions')
      }

      return {
        identifier: selectedArtifact?.identifier,
        type: selectedArtifact?.type,
        spec: {
          ...selectedArtifact?.spec
        }
      }
    }
  }
}
export function getFqnPath(stageIdentifier: string, manifestPath: string): string {
  return `pipeline.stages.${stageIdentifier}.spec.service.serviceInputs.serviceDefinition.spec.${manifestPath}.spec.store.spec.bucketName`
}
