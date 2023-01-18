/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'

import { AllowedTypes, Container, FormInput, Layout, TagsPopover, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { FilterYaml } from 'services/cd-ng'

import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { isValueExpression, isValueRuntimeInput } from '@common/utils/utils'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  entityFilterMatchTypeStringsMap,
  EntityFilterMatchType
} from '../AddEditEntityFilterModal/AddEditEntityFilterModal.types'
import { TagsPopoverTarget } from '../EntityFiltersList/EntityFilterSpec'

import css from './InlineEntityFiltersInputStep.module.scss'

export interface InlineEntityFiltersInputStepProps {
  inputSetData: any
  allowableTypes: AllowedTypes
  readonly: boolean
}

export default function InlineEntityFiltersInputStep({
  inputSetData,
  allowableTypes,
  readonly
}: InlineEntityFiltersInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const stageTemplate = inputSetData.template
  const stageValues = inputSetData.allValues

  return (
    <Layout.Vertical padding={{ top: 'small', bottom: 'small' }}>
      <Container className={css.filterGrid}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('identifier').toUpperCase()}</Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.matchType').toUpperCase()}</Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('tagsLabel').toUpperCase()}</Text>
        {stageTemplate.map((filter: FilterYaml, index: number) => {
          const filterStageValue = stageValues.find(
            (stageValue: FilterYaml) => stageValue.identifier === filter.identifier
          )

          return (
            <>
              <Text>{filter.identifier}</Text>

              {isValueRuntimeInput(filter.spec.matchType) ? (
                <FormInput.MultiTypeInput
                  name={`${inputSetData.path}.${index}.spec.matchType`}
                  useValue
                  selectItems={[
                    { label: getString('all'), value: 'all' },
                    { label: getString('common.any'), value: 'any' }
                  ]}
                  label=""
                  multiTypeInputProps={{
                    allowableTypes
                  }}
                  disabled={readonly}
                />
              ) : (
                <Text>
                  {getString(
                    entityFilterMatchTypeStringsMap[get(filterStageValue, 'spec.matchType') as EntityFilterMatchType]
                  )}
                </Text>
              )}

              {isValueRuntimeInput(filter.spec.tags) ? (
                <FormMultiTypeKVTagInput
                  name={`${inputSetData.path}.${index}.spec.tags`}
                  tagsProps={{ placeholder: getString('common.filterOnName', { name: getString('tagsLabel') }) }}
                  multiTypeProps={{
                    allowableTypes,
                    expressions
                  }}
                  disabled={readonly}
                />
              ) : isValueExpression(filterStageValue.spec?.tags) ? (
                filterStageValue.spec?.tags
              ) : (
                <TagsPopover
                  tags={defaultTo(filterStageValue.spec?.tags, {})}
                  target={<TagsPopoverTarget tags={defaultTo(filterStageValue.spec?.tags, {})} standAlone />}
                />
              )}
            </>
          )
        })}
      </Container>
    </Layout.Vertical>
  )
}
