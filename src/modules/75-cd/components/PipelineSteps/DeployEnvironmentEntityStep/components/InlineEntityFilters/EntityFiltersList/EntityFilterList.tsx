/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FieldArray, useFormikContext } from 'formik'
import { get, isNil } from 'lodash-es'

import { Button, ButtonSize, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { FilterYaml } from 'services/cd-ng'

import type { EntityFilterListProps } from './EntityFilterListUtils'
import { defaultEntityFilter } from '../AddEditEntityFilterModal/AddEditEntityFilterModalUtils'
import {
  AddEditEntityFilterModalState,
  entityFilterTypeStringsMap,
  entityTypeStringsMap
} from '../AddEditEntityFilterModal/AddEditEntityFilterModal.types'
import AddEditEntityFilterModal from '../AddEditEntityFilterModal/AddEditEntityFilterModal'
import EntityFilterSpec from './EntityFilterSpec'

import css from './EntityFilterList.module.scss'

export default function EntityFilterList<T>({
  filterPrefix,
  readonly,
  allowableTypes,
  ...entityFilterProps
}: EntityFilterListProps): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<T>()
  const entityFilterList = get(values, filterPrefix, []) as FilterYaml[]
  const allEntityFilterIdentifiers = entityFilterList.map(entityFilter => entityFilter.identifier)
  const [addEditEntityFilterModalState, setAddEditEntityFilterModalState] = useState<AddEditEntityFilterModalState>({
    isOpen: false,
    index: -1,
    initialValues: {
      ...defaultEntityFilter
    }
  })

  return (
    <FieldArray
      name={filterPrefix}
      render={({ push, replace, remove }) => {
        function handleRemove(index: number): void {
          remove(index)
        }

        const onClose = (index?: number, filter?: FilterYaml): void => {
          if (filter && !isNil(index)) {
            if (index > -1) {
              replace(index, filter)
            } else {
              push(filter)
            }
          }
          setAddEditEntityFilterModalState({
            isOpen: false,
            index: -1,
            initialValues: {
              ...defaultEntityFilter
            }
          })
        }

        return (
          <>
            <Container className={css.filterGrid}>
              {Array.isArray(entityFilterList) && (
                <>
                  {entityFilterList.length > 0 && (
                    <>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                        {getString('identifier').toUpperCase()}
                      </Text>
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
                    </>
                  )}

                  {entityFilterList.map((entityFilter, index) => {
                    if (!entityFilter) {
                      return null
                    }

                    const { identifier, entities, type, spec } = entityFilter

                    return (
                      <>
                        <Text lineClamp={1}>{identifier}</Text>
                        <Layout.Vertical>
                          {entities?.map(entity => getString(entityTypeStringsMap[entity])).join(', ')}
                        </Layout.Vertical>
                        <Text>{getString(entityFilterTypeStringsMap[type])}</Text>
                        <EntityFilterSpec type={type} spec={spec} />
                        <Layout.Horizontal spacing="small">
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="edit"
                            data-testid={`edit-filter-${identifier}`}
                            disabled={readonly}
                            onClick={() =>
                              setAddEditEntityFilterModalState({
                                isOpen: true,
                                index,
                                initialValues: { ...entityFilter }
                              })
                            }
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="remove-minus"
                            data-testid={`delete-environment-${identifier}`}
                            disabled={readonly}
                            onClick={() => handleRemove(index)}
                          />
                        </Layout.Horizontal>
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
                onClick={() =>
                  setAddEditEntityFilterModalState({
                    isOpen: true,
                    index: -1,
                    initialValues: {
                      ...defaultEntityFilter
                    }
                  })
                }
                text={getString('common.addName', { name: getString('filters.filtersLabel') })}
                flex={{ justifyContent: 'flex-start' }}
              />
            </Container>
            <AddEditEntityFilterModal
              onClose={onClose}
              allEntityFilterIdentifiers={allEntityFilterIdentifiers}
              allowableTypes={allowableTypes}
              {...addEditEntityFilterModalState}
              {...entityFilterProps}
            />
          </>
        )
      }}
    />
  )
}
