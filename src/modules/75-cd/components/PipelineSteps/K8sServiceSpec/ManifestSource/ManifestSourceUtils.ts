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

export const fromPipelineInputTriggerTab = (formik: FormikValues, fromTrigger = false): boolean => {
  return (
    formik?.values?.triggerType === TriggerTypes.MANIFEST && !isEmpty(formik?.values?.selectedArtifact) && !fromTrigger
  )
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
    item?.connector?.spec?.type === GitRepoName.Repo
  )
}

export const getConnectorRef = (initialConnectorRefData: string, formikConnectorRefValue: string): string => {
  return getMultiTypeFromValue(initialConnectorRefData) !== MultiTypeInputType.RUNTIME
    ? initialConnectorRefData
    : formikConnectorRefValue
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

    const stages = formik?.initialValues?.inputSetTemplateYamlObj?.pipeline?.stages
    const stageConnectorManifest = stages?.map((st: any) =>
      get(st, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests' || [])?.find(
        (mani: { manifest: { identifier: any; spec: { store: { spec: { connectorRef: string } } } } }) =>
          mani?.manifest?.identifier === selectedArtifact?.identifier &&
          mani?.manifest?.spec?.store?.spec?.connectorRef === '<+input>'
      )
    )

    //!stageConnectorManifest is required because if manifest store has connectorRef as runtime so we cannot unset values from input yaml
    if (
      initialArtifactValue &&
      selectedArtifact.identifier === initialArtifactValue.identifier &&
      !stageConnectorManifest
    ) {
      /*
         backend requires eventConditions and store inside selectedArtifact but should not be added to inputYaml
        */
      if (selectedArtifact?.spec.eventConditions && selectedArtifact?.spec.store) {
        unset(selectedArtifact?.spec, 'eventConditions')
        unset(selectedArtifact?.spec, 'store')
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
