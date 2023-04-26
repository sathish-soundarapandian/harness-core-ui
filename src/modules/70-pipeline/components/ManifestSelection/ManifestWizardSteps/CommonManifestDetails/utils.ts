/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ManifestDataType } from '../../Manifesthelper'
import type { ManifestTypes } from '../../ManifestInterface'

export const shouldAllowOnlyOneFilePath = (selectedManifest: ManifestTypes): boolean => {
  return [
    ManifestDataType.ServerlessAwsLambda,
    ManifestDataType.EcsTaskDefinition,
    ManifestDataType.EcsServiceDefinition,
    ManifestDataType.EcsScalableTargetDefinition,
    ManifestDataType.EcsScalingPolicyDefinition,
    ManifestDataType.TasManifest,
    ManifestDataType.TasAutoScaler,
    ManifestDataType.AsgLaunchTemplate,
    ManifestDataType.AsgConfiguration,
    ManifestDataType.GoogleCloudFunctionDefinition,
    ManifestDataType.GoogleCloudFunctionGenOneDefinition,
    ManifestDataType.AwsLambdaFunctionDefinition,
    ManifestDataType.AwsLambdaFunctionAliasDefinition
  ].includes(selectedManifest)
}

/**
 * @description List of manifests which are restricted to single addition
 */
export const allowedManifestForSingleAddition = [ManifestDataType.TasManifest, ManifestDataType.TasAutoScaler]
