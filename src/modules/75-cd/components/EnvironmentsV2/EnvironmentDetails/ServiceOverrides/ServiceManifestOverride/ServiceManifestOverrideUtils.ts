/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import type { StringKeys } from 'framework/strings'

export type OverrideManifestTypes = 'Values' | 'OpenshiftParam' | 'KustomizePatches'
export type OverrideManifestStoresTypes =
  | 'Git'
  | 'Github'
  | 'GitLab'
  | 'Bitbucket'
  | 'InheritFromManifest'
  | 'Harness'
  | 'CustomRemote'

export const OverrideManifests: Record<OverrideManifestTypes, OverrideManifestTypes> = {
  Values: 'Values',
  OpenshiftParam: 'OpenshiftParam',
  KustomizePatches: 'KustomizePatches'
}
export const OverrideManifestStores: Record<OverrideManifestStoresTypes, OverrideManifestStoresTypes> = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  InheritFromManifest: 'InheritFromManifest',
  Harness: 'Harness',
  CustomRemote: 'CustomRemote'
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
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  OpenshiftParam: [
    ...gitStoreTypes,
    OverrideManifestStores.InheritFromManifest,
    OverrideManifestStores.Harness,
    OverrideManifestStores.CustomRemote
  ],
  KustomizePatches: [...gitStoreTypes, OverrideManifestStores.InheritFromManifest, OverrideManifestStores.Harness]
}
export const ManifestLabels: Record<OverrideManifestTypes, StringKeys> = {
  Values: 'pipeline.manifestTypeLabels.ValuesYaml',
  OpenshiftParam: 'pipeline.manifestTypeLabels.OpenshiftParam',
  KustomizePatches: 'pipeline.manifestTypeLabels.KustomizePatches'
}
export const ManifestIcons: Record<OverrideManifestTypes, IconName> = {
  Values: 'functions',
  OpenshiftParam: 'openshift-params',
  KustomizePatches: 'kustomizeparam'
}
