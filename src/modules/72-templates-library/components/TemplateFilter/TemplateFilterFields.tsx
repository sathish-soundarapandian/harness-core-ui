/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { TemplateType, getAllowedTemplateTypes } from '@templates-library/utils/templatesUtils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'

export const TemplateFilterFields = (): React.ReactElement => {
  const { getString } = useStrings()
  const { CVNG_TEMPLATE_MONITORED_SERVICE, NG_SVC_ENV_REDESIGN } = useFeatureFlags()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountIdentifier: accountId })

  const allowedTemplateTypes = getAllowedTemplateTypes(scope, {
    [TemplateType.MonitoredService]: !!CVNG_TEMPLATE_MONITORED_SERVICE,
    [TemplateType.CustomDeployment]: !!NG_SVC_ENV_REDESIGN
  }).filter(item => !item.disabled)

  return (
    <>
      <FormInput.Text
        name={'templateNames'}
        label={getString('common.template.name')}
        key={'templateNames'}
        placeholder={getString('common.template.name')}
      />
      <FormInput.Text
        name={'description'}
        label={getString('description')}
        placeholder={getString('common.descriptionPlaceholder')}
        key={'description'}
      />
      <FormInput.KVTagInput name="tags" label={getString('tagsLabel')} />
      <FormInput.DropDown
        name={'templateEntityTypes'}
        key={'templateEntityTypes'}
        items={allowedTemplateTypes}
        placeholder={getString('all')}
        label={getString('common.template.type')}
      />
    </>
  )
}
