/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import {
  AllowedTypes,
  Container,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikContextType } from 'formik'
import produce from 'immer'
import { PrimaryArtifact, ServiceSpec, useGetArtifactSourceInputs } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { isValueRuntimeInput } from '@common/utils/utils'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import ExperimentalInput from '../K8sServiceSpecForms/ExperimentalInput'
import type { K8SDirectServiceStep } from '../K8sServiceSpecInterface'

interface PrimaryArtifactRefProps {
  template: ServiceSpec
  initialValues: K8SDirectServiceStep
  readonly: boolean
  allowableTypes: AllowedTypes
  serviceIdentifier?: string
  stepViewType?: StepViewType
  primaryArtifact?: PrimaryArtifact
  formik?: FormikContextType<unknown>
  path?: string
}

function PrimaryArtifactRef({
  template,
  initialValues,
  path,
  allowableTypes,
  readonly,
  formik,
  serviceIdentifier = '',
  stepViewType
}: PrimaryArtifactRefProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()

  const { data: artifactSourceResponse, loading: loadingArtifactSourceResponse } = useGetArtifactSourceInputs({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    serviceIdentifier
  })
  const artifactSources = useMemo(
    () =>
      defaultTo(
        artifactSourceResponse?.data?.sourceIdentifiers?.map(source => ({ label: source, value: source })),
        []
      ),
    [artifactSourceResponse?.data?.sourceIdentifiers]
  )

  useEffect(() => {
    // if the API is in loading state then just return this ends up showing unsaved changes in the pipeline
    if (loadingArtifactSourceResponse) {
      return
    }
    const artifactSourceTemplate = getStageFormTemplate(`${path}.artifacts.primary.sources`)
    const serviceInputsFormikValue = get(formik?.values, `${path}.artifacts.primary.sources`)
    const isSingleArtifactSource = artifactSources.length === 1
    if (
      typeof artifactSourceTemplate === 'string' &&
      getMultiTypeFromValue(artifactSourceTemplate) === MultiTypeInputType.RUNTIME &&
      //Autoselect primary artifact if there is only 1 artifact source
      (!isEmpty(serviceInputsFormikValue) || isSingleArtifactSource)
    ) {
      const shouldSetDefaultArtifactSource = isSingleArtifactSource && stepViewType !== StepViewType.TemplateUsage

      const sourceIdentifierToSourceInputMap = get(
        artifactSourceResponse?.data?.sourceIdentifierToSourceInputMap,
        shouldSetDefaultArtifactSource
          ? artifactSources[0].value
          : `${initialValues.artifacts?.primary?.primaryArtifactRef}`
      )
      if (sourceIdentifierToSourceInputMap) {
        const idSourceMap = yamlParse(defaultTo(sourceIdentifierToSourceInputMap, ''))
        if (idSourceMap) {
          //In templateusage view type, the formik is directly set by reading the values from pipeline yaml, whereas in run pipeline form, the set value is reset on switching between yaml and visual view
          if (shouldSetDefaultArtifactSource) {
            formik?.setValues(
              produce(formik?.values, (draft: any) => {
                set(draft, `${path}.artifacts.primary.primaryArtifactRef`, artifactSources[0].value)
                isEmpty(serviceInputsFormikValue) &&
                  set(draft, `${path}.artifacts.primary.sources`, [clearRuntimeInput(idSourceMap)])
              })
            )
          }
          updateStageFormTemplate([idSourceMap], `${path}.artifacts.primary.sources`)
        }
      } else {
        // This is to select single artifact source by default even when there is no runtime inputs in Artifact source
        const primaryRefFormikValue = get(formik?.values, `${path}.artifacts.primary.primaryArtifactRef`)
        if (isEmpty(primaryRefFormikValue) && shouldSetDefaultArtifactSource) {
          formik?.setValues(
            produce(formik?.values, (draft: any) => {
              set(draft, `${path}.artifacts.primary.primaryArtifactRef`, artifactSources[0].value)
              set(draft, `${path}.artifacts.primary.sources`, undefined)
            })
          )
        }
      }
    } else if (isEmpty(get(formik?.values, `${path}.artifacts.primary.sources`))) {
      updateStageFormTemplate(undefined, `${path}.artifacts.primary.sources`)
      formik?.setFieldValue(`${path}.artifacts.primary.sources`, undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifactSources, artifactSourceResponse?.data?.sourceIdentifierToSourceInputMap])

  const onPrimaryArtifactRefChange = (value: SelectOption): void => {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
      updateStageFormTemplate(undefined, `${path}.artifacts.primary.sources`)
      const isRuntime = isValueRuntimeInput(value) && stepViewType === StepViewType.TemplateUsage

      formik?.setValues(
        produce(formik?.values, (draft: any) => {
          set(draft, `${path}.artifacts.primary.primaryArtifactRef`, isRuntime ? RUNTIME_INPUT_VALUE : value)
          set(draft, `${path}.artifacts.primary.sources`, isRuntime ? RUNTIME_INPUT_VALUE : undefined)
        })
      )
      return
    }
    const sourceIdentifierToSourceInputMap = get(
      artifactSourceResponse?.data?.sourceIdentifierToSourceInputMap,
      value?.value as string,
      ''
    )

    if (sourceIdentifierToSourceInputMap) {
      const idSourceMap = yamlParse(defaultTo(sourceIdentifierToSourceInputMap, ''))
      if (idSourceMap) {
        updateStageFormTemplate([idSourceMap], `${path}.artifacts.primary.sources`)
        formik?.setValues(
          produce(formik?.values, (draft: any) => {
            set(draft, `${path}.artifacts.primary.primaryArtifactRef`, value.value)
            set(draft, `${path}.artifacts.primary.sources`, [
              stepViewType === StepViewType.TemplateUsage ? idSourceMap : clearRuntimeInput(idSourceMap)
            ])
          })
        )
      }
    } else {
      updateStageFormTemplate(undefined, `${path}.artifacts.primary.sources`)
      formik?.setValues(
        produce(formik?.values, (draft: any) => {
          set(draft, `${path}.artifacts.primary.primaryArtifactRef`, value?.value)
          set(draft, `${path}.artifacts.primary.sources`, undefined)
        })
      )
    }
  }

  return (
    <Container width={400}>
      {getMultiTypeFromValue(template?.artifacts?.primary?.primaryArtifactRef as string) ===
        MultiTypeInputType.RUNTIME && (
        <ExperimentalInput
          tooltipProps={{ dataTooltipId: 'primaryArtifactRef' }}
          label={getString('primaryArtifactText')}
          placeholder={getString('cd.selectArtifactSource')}
          name={`${path}.artifacts.primary.primaryArtifactRef`}
          selectItems={artifactSources}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              addClearBtn: !readonly,
              items: artifactSources
            },
            onChange: onPrimaryArtifactRefChange
          }}
          disabled={readonly}
          formik={formik}
        />
      )}
    </Container>
  )
}

export default PrimaryArtifactRef
