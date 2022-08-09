/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { get } from 'lodash-es'
import {
  AllowedTypes,
  Container,
  getMultiTypeFromValue,
  Heading,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  Text
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { FeatureFlagConfigurationInstruction, FlagConfigurationStepFormDataValues } from '../types'
import FlagChangesForm, { FlagChangesFormProps } from './FlagChangesForm'

import subSectionCSS from './SubSection.module.scss'
import css from './FlagChanges.module.scss'

const allowedTypes: AllowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]

export interface FlagChangesProps {
  selectedFeature?: Feature | typeof RUNTIME_INPUT_VALUE
  selectedEnvironmentId?: string
  initialInstructions?: FeatureFlagConfigurationInstruction[] | typeof RUNTIME_INPUT_VALUE
  clearField: (fieldName: string) => void
  setField: (fieldName: string, value: unknown) => void
  fieldValues: FlagConfigurationStepFormDataValues
  showRuntimeFixedSelector?: boolean
  pathPrefix?: string
}

const FlagChanges: FC<FlagChangesProps> = ({
  selectedFeature,
  selectedEnvironmentId,
  fieldValues,
  initialInstructions,
  clearField,
  setField,
  showRuntimeFixedSelector = false,
  pathPrefix = ''
}) => {
  const { getString } = useStrings()

  const prefix = useCallback<(path: string) => string>(
    path => (pathPrefix ? `${pathPrefix}.${path}` : path),
    [pathPrefix]
  )

  const instructionsPath = useMemo<string>(() => prefix('spec.instructions'), [prefix])

  useEffect(() => {
    if (selectedFeature === RUNTIME_INPUT_VALUE) {
      setField(instructionsPath, RUNTIME_INPUT_VALUE)
    }
  }, [selectedFeature, instructionsPath])

  const subsectionsDisabled = showRuntimeFixedSelector && get(fieldValues, instructionsPath) === RUNTIME_INPUT_VALUE

  enum UI_STATE {
    RUNTIME,
    FLAG_OR_ENV_NOT_SELECTED,
    DISPLAY_FORM
  }

  const status = useMemo<UI_STATE>(() => {
    if (subsectionsDisabled) {
      return UI_STATE.RUNTIME
    }

    if (!selectedFeature || !selectedEnvironmentId) {
      return UI_STATE.FLAG_OR_ENV_NOT_SELECTED
    }

    return UI_STATE.DISPLAY_FORM
  }, [subsectionsDisabled, selectedFeature, selectedEnvironmentId])

  return (
    <Layout.Vertical spacing="medium">
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
        <Heading level={5} font={{ variation: FontVariation.H5 }}>
          {getString('cf.pipeline.flagConfiguration.flagChanges')}
        </Heading>
        {showRuntimeFixedSelector && (
          <MultiTypeSelectorButton
            type={getMultiTypeFromValue(get(fieldValues, instructionsPath), allowedTypes)}
            allowedTypes={allowedTypes}
            onChange={type => setField(instructionsPath, isMultiTypeRuntime(type) ? RUNTIME_INPUT_VALUE : undefined)}
            data-testid="runtime-fixed-selector-button"
            disabled={selectedFeature === RUNTIME_INPUT_VALUE}
          />
        )}
      </Layout.Horizontal>

      {status === UI_STATE.RUNTIME && (
        <Container className={subSectionCSS.subSection} padding="large" data-testid="flag-changes-runtime">
          <Text>{getString('cf.pipeline.flagConfiguration.flagChangesRuntime')}</Text>
          <ul className={css.runtimeList}>
            <li>{getString('cf.pipeline.flagConfiguration.flagChangesRuntimeSetFlagSwitch')}</li>
            <li>{getString('cf.pipeline.flagConfiguration.flagChangesRuntimeSetDefaultRules')}</li>
            <li>{getString('cf.pipeline.flagConfiguration.flagChangesRuntimeServeVariationToTargets')}</li>
            <li>{getString('cf.pipeline.flagConfiguration.flagChangesRuntimeServeVariationToTargetGroups')}</li>
            <li>{getString('cf.pipeline.flagConfiguration.flagChangesRuntimeServePercentageRollout')}</li>
          </ul>
        </Container>
      )}

      {status === UI_STATE.FLAG_OR_ENV_NOT_SELECTED && (
        <Container className={subSectionCSS.subSection} padding="large" data-testid="flag-changes-no-flag-selected">
          <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectAFeatureFlag')}</Text>
        </Container>
      )}

      {status === UI_STATE.DISPLAY_FORM && (
        <FlagChangesForm
          prefix={prefix}
          initialInstructions={initialInstructions as FlagChangesFormProps['initialInstructions']}
          clearField={clearField}
          setField={setField}
          fieldValues={fieldValues}
          selectedFeature={selectedFeature as FlagChangesFormProps['selectedFeature']}
          environmentIdentifier={selectedEnvironmentId as string}
        />
      )}
    </Layout.Vertical>
  )
}

export default FlagChanges
