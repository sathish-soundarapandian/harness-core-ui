/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Formik } from 'formik'

import {
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  Layout,
  ModalDialog,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvSwaggerObjectWrapper } from 'services/cd-ng'

import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { isValueRuntimeInput } from '@common/utils/utils'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  getExistingFilterIdentifiers,
  getEntitySelectOptions,
  getValidationSchema
} from './AddEditEntityFilterModalUtils'
import {
  AddEditEntityFilterFormState,
  AddEditEntityFilterModalProps,
  entityFilterTypeStringsMap,
  entityTypeStringsMap
} from './AddEditEntityFilterModal.types'

import css from './AddEditEntityFilterModal.module.scss'

export default function AddEditEntityFilterModal({
  allEntityFilterIdentifiers,
  onClose,
  entities,
  filters = ['all', 'tags'],
  allowableTypes,
  isOpen,
  index,
  initialValues
}: AddEditEntityFilterModalProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const entityItems = useMemo(() => {
    return getEntitySelectOptions(entities, getString, entityTypeStringsMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities])

  const filterItems = useMemo(() => {
    return filters.map(filter => {
      return {
        label: getString(entityFilterTypeStringsMap[filter]),
        value: filter
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const onSubmit = (values: AddEditEntityFilterFormState): void => {
    const filterEntities = values.entities.map(
      opt => opt.value as NonNullable<EnvSwaggerObjectWrapper['envFilterEntityType']>
    )
    const filterSpec = values.spec

    onClose(index, {
      identifier: values.identifier,
      type: values.type,
      entities: filterEntities,
      spec: {
        ...(values.type === 'tags' && {
          tags: filterSpec.tags,
          matchType: isValueRuntimeInput(filterSpec.tags) ? RUNTIME_INPUT_VALUE : filterSpec.matchType
        })
      }
    })
  }

  const dialogTitle =
    index !== -1 ? getString('common.editName', { name: getString('common.filter') }) : getString('filters.newFilter')

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={() => onClose()}
      title={dialogTitle}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      enforceFocus={false}
      lazy
      width={500}
    >
      <Formik<AddEditEntityFilterFormState>
        initialValues={{
          ...initialValues,
          entities: getEntitySelectOptions(initialValues.entities, getString, entityTypeStringsMap)
        }}
        onSubmit={onSubmit}
        validationSchema={getValidationSchema(
          getString,
          getExistingFilterIdentifiers(index, [...allEntityFilterIdentifiers])
        )}
      >
        {formikProps => {
          const { entities: filteredOnEntities, type, spec } = formikProps.values
          const showCondition = type === 'tags'
          const showMatchType = !isValueRuntimeInput(spec.tags)

          const entitiesPlaceholder = filteredOnEntities.length
            ? ''
            : getString('common.filterOnName') + entityItems.map(entityItem => entityItem.label).join(' / ')

          return (
            <FormikForm>
              <FormInput.Text
                name={'identifier'}
                label={getString('common.ID')}
                placeholder={getString('cd.inlineEntityFilters.enterFilterIdentifier')}
                tooltipProps={{
                  dataTooltipId: 'inlineEntityFilterIdentifer'
                }}
              />
              <FormInput.MultiSelect
                name={'entities'}
                items={entityItems}
                label={getString('common.filterOnName', { name: getString('entities') })}
                tagInputProps={
                  {
                    placeholder: entitiesPlaceholder
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any
                }
                tooltipProps={{
                  dataTooltipId: 'inlineEntityFilterEntitiesList'
                }}
              />
              <FormInput.Select
                name={'type'}
                items={filterItems}
                label={getString('typeLabel')}
                tooltipProps={{
                  dataTooltipId: 'inlineEntityFilterType'
                }}
              />
              <Layout.Horizontal
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                spacing="medium"
                margin={{ bottom: 'medium' }}
              >
                {showCondition && (
                  <>
                    <FormMultiTypeKVTagInput
                      name={'spec.tags'}
                      tagsProps={{ placeholder: getString('common.filterOnName', { name: getString('tagsLabel') }) }}
                      multiTypeProps={{
                        allowableTypes,
                        expressions
                      }}
                      label={getString('common.condition')}
                      enableConfigureOptions
                      configureOptionsProps={{
                        variableName: 'spec.tags',
                        hideExecutionTimeField: true
                      }}
                      className={css.tagInput}
                      tooltipProps={{
                        dataTooltipId: `inlineEntityFilterCondition_${type}`
                      }}
                    />
                    {showMatchType && (
                      <FormInput.RadioGroup
                        name={'spec.matchType'}
                        className={css.radioGroup}
                        radioGroup={{
                          inline: true
                        }}
                        items={[
                          { label: getString('all'), value: 'all' },
                          { label: getString('common.any'), value: 'any' }
                        ]}
                      />
                    )}
                  </>
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <Button type="submit" variation={ButtonVariation.PRIMARY}>
                  {getString('save')}
                </Button>
                <Button variation={ButtonVariation.SECONDARY} onClick={() => onClose()}>
                  {getString('cancel')}
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </ModalDialog>
  )
}
