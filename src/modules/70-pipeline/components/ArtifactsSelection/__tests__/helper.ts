/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findByText, queryByAttribute } from '@testing-library/dom'

export const testArtifactTypeList = async (): Promise<void> => {
  const dialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
  const artifactLabel = await findByText(dialog, 'connectors.specifyArtifactRepoType')
  expect(artifactLabel).toBeInTheDocument()
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', dialog, value)
  // Docker, GCR, ECR, Nexus, Artifactory, Custom, ACR should be rendered
  const DockerRegistry = queryByValueAttribute('DockerRegistry')
  expect(DockerRegistry).not.toBeNull()
  const Gcr = queryByValueAttribute('Gcr')
  expect(Gcr).not.toBeNull()
  const Ecr = queryByValueAttribute('Ecr')
  expect(Ecr).not.toBeNull()
  const Nexus3Registry = queryByValueAttribute('Nexus3Registry')
  expect(Nexus3Registry).not.toBeNull()
  const ArtifactoryRegistry = queryByValueAttribute('ArtifactoryRegistry')
  expect(ArtifactoryRegistry).not.toBeNull()
  const CustomArtifact = queryByValueAttribute('CustomArtifact')
  expect(CustomArtifact).not.toBeNull()
  const Acr = queryByValueAttribute('Acr')
  expect(Acr).not.toBeNull()
  // AmazonS3, Jenkins should NOT be rendered
  const amazonS3 = dialog.querySelector('input[value="AmazonS3"]')
  expect(amazonS3).toBeNull()
  const Jenkins = queryByValueAttribute('Jenkins')
  expect(Jenkins).toBeNull()
}
