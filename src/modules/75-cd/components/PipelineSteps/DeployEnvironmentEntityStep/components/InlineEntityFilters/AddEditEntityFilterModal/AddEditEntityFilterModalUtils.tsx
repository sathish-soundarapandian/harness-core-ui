/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { isEmpty, isNil } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'

import type { UseStringsReturn } from 'framework/strings'
import type { FilterSpec } from 'services/cd-ng'

import { isValueRuntimeInput } from '@common/utils/utils'

import { MAX_LENGTH } from '@pipeline/components/CommonPipelineStages/PipelineStage/PipelineStageOutputSection/utils'

import type {
  AddEditEntityFilterFormState,
  EntityFilterMatchType,
  EntityFilterType,
  EntityType,
  entityTypeStringsMap
} from './AddEditEntityFilterModal.types'
import type { FilterYaml } from '../../../types'

export const defaultEntityFilter = {
  identifier: '',
  entities: [],
  type: 'all',
  spec: {
    matchType: 'all'
  }
} as FilterYaml

export function getEntitySelectOptions(
  items: EntityType[],
  getString: UseStringsReturn['getString'],
  mapHelper: typeof entityTypeStringsMap
): SelectOption[] {
  return items.map(item => {
    return {
      label: getString(mapHelper[item]),
      value: item
    }
  })
}

export function getExistingFilterIdentifiers(index: number, filterIdentifiers: string[]): string[] {
  if (index > -1) {
    filterIdentifiers.splice(index, 1)
  }
  return filterIdentifiers
}

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  existingFilters: string[]
): Yup.ObjectSchema<AddEditEntityFilterFormState> {
  return Yup.object()
    .required()
    .shape({
      identifier: Yup.string()
        .trim()
        .required(getString('cd.inlineEntityFilters.validation.filterIdentifierRequired'))
        .max(
          MAX_LENGTH,
          getString('common.validation.fieldCannotbeLongerThanN', {
            name: getString('cd.inlineEntityFilters.filterIdentifier'),
            n: MAX_LENGTH
          })
        )
        .matches(
          /^[a-zA-Z_][0-9a-zA-Z_$.]*$/,
          getString('common.validation.fieldMustBeAlphanumeric', { name: getString('common.filter') })
        )
        .notOneOf(existingFilters, getString('cd.inlineEntityFilters.validation.filterIdentifierAlreadyExists')),
      type: Yup.mixed<EntityFilterType>().required().default('all').oneOf(['all', 'tags']),
      entities: Yup.array<SelectOption>().required(
        getString('cd.inlineEntityFilters.validation.selectAtleastOneEntity')
      ),
      spec: Yup.object<FilterSpec>()
        .required()
        .when('type', {
          is: (val: EntityFilterMatchType) => val !== 'all',
          then: (schema: FilterSpec) =>
            schema.test({
              test(value: FilterSpec): boolean | Yup.ValidationError {
                const tagsType = getMultiTypeFromValue(value.tags)

                if (tagsType === MultiTypeInputType.FIXED) {
                  if (isNil(value.tags) || isEmpty(value.tags)) {
                    return this.createError({
                      path: 'spec.tags',
                      message: getString('cd.inlineEntityFilters.validation.tagsAreRequired')
                    })
                  }

                  if (isValueRuntimeInput(value.matchType)) {
                    return this.createError({
                      path: 'spec.tags',
                      message: getString('cd.inlineEntityFilters.validation.chooseAllOrAny')
                    })
                  }
                }

                return true
              }
            })
        })
    })
}
