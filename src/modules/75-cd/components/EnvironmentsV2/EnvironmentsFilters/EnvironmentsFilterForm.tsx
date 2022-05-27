/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'

import { FormInput, MultiSelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'

export default function EnvironmentsFilterForm({
  environments
}: {
  environments?: MultiSelectOption[]
}): React.ReactElement {
  const { getString } = useStrings()

  const typeList: MultiSelectOption[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('cd.preProduction'),
      value: 'PreProduction'
    }
  ]

  return (
    <>
      <FormInput.Text
        name={'environmentName'}
        label={getString('name')}
        key={'environmentName'}
        placeholder={getString('cd.environment.filters.environmentNamePlaceholder')}
      />
      <FormInput.Text
        name={'description'}
        label={getString('description')}
        placeholder={getString('common.descriptionPlaceholder')}
        key={'description'}
      />
      <FormInput.KVTagInput name="environmentTags" label={getString('tagsLabel')} key="environmentTags" />
      <FormInput.MultiSelect
        items={typeList}
        name="environmentTypes"
        label={getString('envType')}
        placeholder={getString('pipeline.filters.environmentPlaceholder')}
        key="environmentTypes"
        multiSelectProps={{
          allowCreatingNewItems: false
        }}
      />
      <FormInput.MultiSelect
        items={defaultTo(environments, [])}
        name="environments"
        label={getString('environments')}
        placeholder={getString('pipeline.filters.environmentPlaceholder')}
        key="environments"
        multiSelectProps={{
          allowCreatingNewItems: false
        }}
      />
    </>
  )
}
