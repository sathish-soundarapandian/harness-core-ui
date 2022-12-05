/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { FieldArray, useFormikContext } from 'formik'
import { get } from 'lodash-es'

import { Button, ButtonSize, ButtonVariation, Container, FormInput, MultiTypeInputType, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'

import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { isValueRuntimeInput } from '@common/utils/utils'

import {
  EntityFilterListProps,
  EntityFilterType,
  entityFilterTypeStringsMap,
  entityTypeStringsMap
} from '../InlineEntityFiltersUtils'

import css from './EntityFilterList.module.scss'

export default function EntityFilterList<T>({
  filterPrefix,
  readonly,
  entities,
  filters,
  defaultFilterType = EntityFilterType.ALL,
  placeholderProps
}: EntityFilterListProps): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<T>()
  const entityFilterList = get(values, filterPrefix)

  const entityItems = useMemo(() => {
    return entities.map(entity => ({
      label: getString(entityTypeStringsMap[entity]),
      value: entity.toString()
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities])

  const filterItems = useMemo(() => {
    return filters.map(filter => ({
      label: getString(entityFilterTypeStringsMap[filter]),
      value: filter.toString()
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return (
    <FieldArray
      name={filterPrefix}
      render={({ push, remove }) => {
        function handleAdd(): void {
          push({
            type: defaultFilterType
          })
        }

        function handleRemove(index: number): void {
          remove(index)
        }

        return (
          <Container className={css.filterGrid}>
            {Array.isArray(entityFilterList) && (
              <>
                {entityFilterList.length > 0 ? (
                  <>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('common.filterOnName', { name: getString('entities') }).toUpperCase()}
                    </Text>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('typeLabel').toUpperCase()}
                    </Text>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('common.condition').toUpperCase()}
                    </Text>
                    <span />
                    <span />
                  </>
                ) : null}

                {entityFilterList.map((entityFilter, index) => {
                  if (!entityFilter) {
                    return null
                  }

                  const isOfTypeTags = get(values, `${filterPrefix}.[${index}].type`) === EntityFilterType.TAGS
                  const isTagRuntime = isValueRuntimeInput(get(values, `${filterPrefix}.[${index}].spec.tags`))
                  const filteredOnEntities = get(values, `${filterPrefix}.[${index}].entities`)

                  return (
                    <>
                      <FormInput.MultiSelect
                        name={`${filterPrefix}.[${index}].entities`}
                        items={entityItems}
                        className={css.tagInputRenderer}
                        multiSelectProps={{
                          placeholder: filteredOnEntities?.length ? '' : placeholderProps.entity
                        }}
                      />

                      <FormInput.Select name={`${filterPrefix}.[${index}].type`} items={filterItems} />

                      {isOfTypeTags ? (
                        <FormMultiTypeKVTagInput
                          name={`${filterPrefix}.[${index}].spec.tags`}
                          tagsProps={{ placeholder: placeholderProps.tags }}
                          multiTypeProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                          }}
                          enableConfigureOptions
                        />
                      ) : (
                        '-'
                      )}

                      {isOfTypeTags && !isTagRuntime ? (
                        <FormInput.RadioGroup
                          name={`${filterPrefix}.[${index}].spec.matchType`}
                          className={css.radioGroup}
                          radioGroup={{ inline: true, disabled: readonly }}
                          disabled={readonly}
                          items={[
                            { label: getString('all'), value: 'all' },
                            { label: getString('common.any'), value: 'any' }
                          ]}
                        />
                      ) : (
                        <span />
                      )}

                      <Button icon="main-trash" minimal onClick={() => handleRemove(index)} />
                    </>
                  )
                })}
              </>
            )}
            <Button
              icon="plus"
              disabled={readonly}
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              minimal
              onClick={handleAdd}
              text={getString('common.addName', { name: getString('filters.filtersLabel') })}
              flex={{ justifyContent: 'flex-start' }}
            />
          </Container>
        )
      }}
    />
  )
}
