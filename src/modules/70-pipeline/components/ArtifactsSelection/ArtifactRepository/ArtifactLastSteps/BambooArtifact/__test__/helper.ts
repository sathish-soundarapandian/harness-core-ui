/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE, StepProps } from '@harness/uicore'
import { onSubmit } from '@pipeline/components/ApplicationConfig/__test__/ApplicationConfigTestUtils'

import type { BambooArtifactProps, BambooArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

export const getInitialValues = (isEditable = false): BambooArtifactType => {
  if (isEditable) {
    return {
      identifier: 'test',

      spec: {
        planName: 'PFP-PT',
        artifactPaths: 'helloworld.war',
        build: '14'
      }
    }
  }
  return {
    identifier: '',
    spec: {
      planName: '',
      artifactPaths: 'test',
      build: RUNTIME_INPUT_VALUE
    }
  }
}

export const getPropsForBambooArtifact = (): Omit<
  StepProps<ConnectorConfigDTO> & BambooArtifactProps,
  'initialValues'
> => {
  return {
    key: 'key',
    name: 'Artifact details',
    expressions: [],
    allowableTypes: [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypesWithRunTime[],
    context: 1,
    handleSubmit: onSubmit,
    artifactIdentifiers: [],
    selectedArtifact: 'Bamboo',
    prevStepData: {
      connectorId: {
        value: 'testConnector'
      }
    }
  }
}
