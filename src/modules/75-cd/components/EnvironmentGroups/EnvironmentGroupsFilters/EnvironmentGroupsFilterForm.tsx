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

export default function EnvironmentGroupsFilterForm({
  environments
}: {
  environments?: MultiSelectOption[]
}): React.ReactElement {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.Text
        name={'envGroupName'}
        label={getString('name')}
        key={'envGroupName'}
        placeholder={getString('common.environmentGroup.filters.environmentGroupNamePlaceholder')}
      />
      <FormInput.Text
        name={'description'}
        label={getString('description')}
        placeholder={getString('common.descriptionPlaceholder')}
        key={'description'}
      />
      <FormInput.KVTagInput name="envGroupTags" label={getString('tagsLabel')} key="envGroupTags" />
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
