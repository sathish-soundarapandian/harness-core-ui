/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { FlatInitialValuesInterface } from '@triggers/pages/triggers/interface/TriggersWizardInterface'
import type {
  GcsBuildStoreTypeSpec,
  HelmManifestSpec,
  HttpBuildStoreTypeSpec,
  ManifestTriggerConfig,
  NGTriggerSourceV2,
  NGTriggerSpecV2,
  S3BuildStoreTypeSpec
} from 'services/pipeline-ng'

export interface ManifestLastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: AllowedTypes
  stepName: string
  initialValues: HelmManifestSpec
  handleSubmit: (data: ManifestTriggerSource) => void
  isReadonly?: boolean
}

export interface ManifestTriggerSource {
  type: Extract<Required<NGTriggerSourceV2>['type'], 'Manifest'>
  spec: ManifestTriggerSourceSpec
}

export interface ManifestTriggerSourceSpec {
  type: Required<ManifestTriggerConfig>['type']
  spec: HelmManifestSpec
}

export type ManifestBuildStoreType = GcsBuildStoreTypeSpec | HttpBuildStoreTypeSpec | S3BuildStoreTypeSpec

export type ManifestTriggerFormikValues = FlatInitialValuesInterface &
  NGTriggerSpecV2 & {
    source: ManifestTriggerSource
  }
