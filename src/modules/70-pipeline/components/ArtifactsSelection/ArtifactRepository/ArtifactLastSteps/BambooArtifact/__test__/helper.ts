/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, StepProps } from '@harness/uicore'
import type { ConnectorConfigDTO } from 'services/cd-ng'

import type { BambooArtifactProps, BambooArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

export const getInitialValues = (): BambooArtifactType => {
  return {
    identifier: '',
    spec: {
      planKey: '',
      artifactPaths: [],
      build: ''
    }
  }
}

export const getEditValues = (): BambooArtifactType => {
  return {
    identifier: 'test-bamboo-artifact',
    spec: {
      planKey: 'test-plan',
      artifactPaths: ['test-artifact-path'],
      build: 'test-build'
    },
    type: 'Bamboo'
  }
}

export const getEditRunTimeValues = (): BambooArtifactType => {
  return {
    identifier: 'test-bamboo-artifact',
    spec: {
      planKey: '<+input>',
      artifactPaths: '<+input>',
      build: '<+input>'
    },
    type: 'Bamboo'
  }
}

export const bambooProps: Omit<StepProps<ConnectorConfigDTO> & BambooArtifactProps, 'initialValues'> = {
  key: 'key',
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: ModalViewFor.PRIMARY,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  isMultiArtifactSource: true,
  selectedArtifact: 'Bamboo',
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}

export const bambooSideCarProps: Omit<StepProps<ConnectorConfigDTO> & BambooArtifactProps, 'initialValues'> = {
  key: 'key',
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: ModalViewFor.SIDECAR,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  isMultiArtifactSource: false,
  selectedArtifact: 'Bamboo',
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}
