/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { get, set } from 'lodash-es'
import produce from 'immer'
import type { FormikProps } from 'formik'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  ArtifactLastStepProps,
  useArtifactSelectionLastSteps
} from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { ArtifactConfig } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import { getUniqueEntityIdentifier, ServiceDataType } from '../../CDOnboardingUtils'
import type { ConfigureServiceInterface } from '../ConfigureService'
import css from './DockerArtifactory.module.scss'

const ALLOWABLE_TYPES = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
] as AllowedTypesWithRunTime[]

export default function ArtifactImagePath({ formik }: { formik: FormikProps<ConfigureServiceInterface> }): JSX.Element {
  const { values: formValues, setFieldValue } = formik
  const { NG_ARTIFACT_SOURCES } = useFeatureFlags()
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isReadonly = false
  const artifactPath = NG_ARTIFACT_SOURCES
    ? 'serviceDefinition.spec.artifacts.primary.sources[0]'
    : 'serviceDefinition.spec.artifacts.primary'
  const getInitiialArtifactLastStepData = React.useMemo(() => {
    const artifactContextData = get(serviceData, `${artifactPath}.spec`)
    const artifactName = artifactContextData?.name || 'sample_artifact_source'
    const identifier = getUniqueEntityIdentifier(artifactName)

    return {
      spec: {
        ...artifactContextData
      },
      type: formValues?.artifactType,
      identifier // CONNECTOR IDENTIFIER CHECK
    }
  }, [serviceData])

  const artifactLastStepProps = React.useMemo((): ArtifactLastStepProps => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context: ModalViewFor.Template,
      expressions,
      allowableTypes: ALLOWABLE_TYPES,
      initialValues: getInitiialArtifactLastStepData as any,
      handleSubmit: (data: ArtifactConfig) => {
        const updatedContextService = produce(serviceData as ServiceDataType, draft => {
          set(draft, artifactPath, data)
        })
        saveServiceData(updatedContextService)
        setFieldValue('artifactConfig', data)
      },
      artifactIdentifiers: [],
      isReadonly: isReadonly,
      prevStepData: get(serviceData, 'data.artifactData'),
      formClassName: css.connectorFormOverride,
      isMultiArtifactSource: true,
      selectedArtifact: formValues?.artifactType || 'DockerRegistry'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressions, isReadonly, getString, formValues, setFieldValue, serviceData])

  const artifactSelectionLastSteps = useArtifactSelectionLastSteps({
    selectedArtifact: formValues?.artifactType || 'DockerRegistry',
    artifactLastStepProps
  })
  return <>{artifactSelectionLastSteps}</>
}
