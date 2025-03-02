/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, omit, set } from 'lodash-es'
import produce from 'immer'
import { useFormikContext } from 'formik'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  ArtifactLastStepProps,
  useArtifactSelectionLastSteps
} from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { ArtifactConfig } from 'services/cd-ng'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import { ALLOWABLE_TYPES, getUniqueEntityIdentifier, ServiceDataType } from '../../CDOnboardingUtils'
import type { ConfigureServiceInterface } from '../ConfigureService'
import css from './DockerArtifactory.module.scss'

export default function ArtifactImagePath(): JSX.Element {
  const { values: formValues, setFieldValue } = useFormikContext<ConfigureServiceInterface>()
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isReadonly = false
  const artifactPath = 'serviceDefinition.spec.artifacts.primary'
  const getInitialArtifactLastStepData = React.useMemo(() => {
    const artifactContextData = get(serviceData, `${artifactPath}.spec`)
    const artifactName = artifactContextData?.name || 'sample_artifact_source'
    const identifier = getUniqueEntityIdentifier(artifactName)

    return {
      spec: {
        ...artifactContextData
      },
      type: formValues?.artifactType as ArtifactType,
      identifier // CONNECTOR IDENTIFIER CHECK
    }
  }, [serviceData])

  const artifactLastStepProps = React.useMemo((): ArtifactLastStepProps => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context: ModalViewFor.CD_Onboarding,
      expressions,
      allowableTypes: ALLOWABLE_TYPES,
      initialValues: getInitialArtifactLastStepData as any,
      handleSubmit: (data: ArtifactConfig) => {
        const updatedContextService = produce(serviceData as ServiceDataType, draft => {
          set(draft, artifactPath, data)
        })
        saveServiceData(updatedContextService)
        setFieldValue('artifactConfig', omit(data, 'identifier'))
      },
      artifactIdentifiers: [],
      isReadonly: isReadonly,
      prevStepData: get(serviceData, 'data.artifactData'),
      formClassName: css.connectorFormOverride,
      isMultiArtifactSource: true,
      selectedArtifact: (formValues?.artifactType as ArtifactType) || 'DockerRegistry'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressions, isReadonly, getString, formValues, setFieldValue, serviceData])

  const artifactSelectionLastSteps = useArtifactSelectionLastSteps({
    selectedArtifact: (formValues?.artifactType as ArtifactType) || 'DockerRegistry',
    artifactLastStepProps
  })
  return <>{artifactSelectionLastSteps}</>
}
