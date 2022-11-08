/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type {
  AmazonS3InitialValuesType,
  CustomArtifactSource,
  GithubPackageRegistryInitialValuesType,
  GoogleArtifactRegistryInitialValuesType,
  ImagePathProps,
  ImagePathTypes,
  JenkinsArtifactType,
  Nexus2InitialValuesType,
  ArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { GCRImagePath } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
import { ECRArtifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ECRArtifact/ECRArtifact'
import { Nexus3Artifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/NexusArtifact/NexusArtifact'
import { Nexus2Artifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Nexus2Artifact/Nexus2Artifact'
import Artifactory from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Artifactory/Artifactory'
import { AmazonS3 } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/AmazonS3Artifact/AmazonS3'
import { CustomArtifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/CustomArtifact/CustomArtifact'
import { ACRArtifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ACRArtifact/ACRArtifact'
import { JenkinsArtifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/JenkinsArtifact/JenkinsArtifact'
import { GoogleArtifactRegistry } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/GoogleArtifactRegistry/GoogleArtifactRegistry'
import { GithubPackageRegistry } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/GithubPackageRegistry/GithubPackageRegistry'
import { DockerRegistryArtifact } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/DockerRegistryArtifact/DockerRegistryArtifact'
import { AmazonMachineImage } from '../ArtifactRepository/ArtifactLastSteps/AmazonMachineImage/AmazonMachineImage'

export type ArtifactLastStepProps = ImagePathProps<
  ImagePathTypes &
    AmazonS3InitialValuesType &
    JenkinsArtifactType &
    GoogleArtifactRegistryInitialValuesType &
    CustomArtifactSource &
    GithubPackageRegistryInitialValuesType &
    Nexus2InitialValuesType
>

export interface ArtifactSelectionLastStepsParams {
  selectedArtifact: ArtifactType | null
  artifactLastStepProps: ArtifactLastStepProps
}

export function useArtifactSelectionLastSteps(params: ArtifactSelectionLastStepsParams) {
  const { selectedArtifact, artifactLastStepProps } = params

  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.Gcr:
      return <GCRImagePath {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.Ecr:
      return <ECRArtifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return <Nexus3Artifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
      return <Nexus2Artifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return <Artifactory {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return <AmazonS3 {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.CustomArtifact:
      return <CustomArtifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.Acr:
      return <ACRArtifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.Jenkins:
      return <JenkinsArtifact {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
      return <GoogleArtifactRegistry {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.GithubPackageRegistry:
      return <GithubPackageRegistry {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.AmazonMachineImage:
      return <AmazonMachineImage {...artifactLastStepProps} />
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
    default:
      return <DockerRegistryArtifact {...artifactLastStepProps} />
  }
}
