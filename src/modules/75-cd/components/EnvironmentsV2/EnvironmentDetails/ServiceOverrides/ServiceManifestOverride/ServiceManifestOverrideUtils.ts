/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import type { StringKeys } from 'framework/strings'

export type OverrideManifestTypes =
  | 'Values'
  | 'OpenshiftParam'
  | 'KustomizePatches'
  | 'TasManifest'
  | 'TasVars'
  | 'TasAutoScaler'
export type OverrideManifestStoresTypes =
  | 'Git'
  | 'Github'
  | 'GitLab'
  | 'Bitbucket'
  | 'InheritFromManifest'
  | 'Harness'
  | 'CustomRemote'
  | 'AzureRepo'

export const OverrideManifests: Record<OverrideManifestTypes, OverrideManifestTypes> = {
  Values: 'Values',
  OpenshiftParam: 'OpenshiftParam',
  KustomizePatches: 'KustomizePatches',
  TasManifest: 'TasManifest',
  TasVars: 'TasVars',
  TasAutoScaler: 'TasAutoScaler'
}
export const OverrideManifestStores: Record<OverrideManifestStoresTypes, OverrideManifestStoresTypes> = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  InheritFromManifest: 'InheritFromManifest',
  Harness: 'Harness',
  CustomRemote: 'CustomRemote',
  AzureRepo: 'AzureRepo'
}
export const AllowedManifestOverrideTypes = [
  OverrideManifests.Values,
  OverrideManifests.OpenshiftParam,
  OverrideManifests.KustomizePatches
]

const gitStoreTypes: Array<OverrideManifestStoresTypes> = [
  OverrideManifestStores.Git,
  OverrideManifestStores.Github,
  OverrideManifestStores.GitLab,
  OverrideManifestStores.Bitbucket
]
export const OverrideManifestStoreMap: Record<OverrideManifestTypes, OverrideManifestStoresTypes[]> = {
  Values: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  OpenshiftParam: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  KustomizePatches: [
    ...gitStoreTypes,
    OverrideManifestStores.AzureRepo,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness
  ],
  TasManifest: [...gitStoreTypes, OverrideManifestStores.Harness, OverrideManifestStores.CustomRemote],
  TasVars: [...gitStoreTypes, OverrideManifestStores.Harness, OverrideManifestStores.CustomRemote],
  TasAutoScaler: [...gitStoreTypes, OverrideManifestStores.Harness, OverrideManifestStores.CustomRemote]
}
export const ManifestLabels: Record<OverrideManifestTypes, StringKeys> = {
  Values: 'pipeline.manifestTypeLabels.ValuesYaml',
  OpenshiftParam: 'pipeline.manifestTypeLabels.OpenshiftParam',
  KustomizePatches: 'pipeline.manifestTypeLabels.KustomizePatches',
  TasManifest: 'pipeline.manifestTypeLabels.TASManifest',
  TasVars: 'pipeline.manifestTypeLabels.VarsYAML',
  TasAutoScaler: 'pipeline.manifestTypeLabels.Autoscaler'
}
export const ManifestIcons: Record<OverrideManifestTypes, IconName> = {
  Values: 'functions',
  OpenshiftParam: 'openshift-params',
  KustomizePatches: 'kustomizeparam',
  TasManifest: 'tas-manifest',
  TasVars: 'list-vars',
  TasAutoScaler: 'autoScaler'
}

export const TASOverrideManifests = [
  OverrideManifests.TasManifest,
  OverrideManifests.TasVars,
  OverrideManifests.TasAutoScaler
]

export function getAllowedOverrideManifests({ CDS_TAS_NG = false }): OverrideManifestTypes[] {
  let overrideManifests = [...AllowedManifestOverrideTypes]

  if (CDS_TAS_NG) {
    overrideManifests = overrideManifests.concat(TASOverrideManifests)
  }
  return overrideManifests
}
