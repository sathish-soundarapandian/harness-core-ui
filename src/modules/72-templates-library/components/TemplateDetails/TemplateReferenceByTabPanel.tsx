/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateSummaryResponse } from 'services/template-ng'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import css from '@templates-library/components/TemplateDetails/TemplateDetails.module.scss'

interface Props {
  selectedTemplate: TemplateSummaryResponse
  templates: TemplateSummaryResponse[]
}

interface Params {
  selectedTemplate: TemplateSummaryResponse
  templates: TemplateSummaryResponse[]
  accountId: string
}

const getCustomReferredEntityFQN = ({ selectedTemplate, templates, accountId }: Params) => {
  const versionLabel = selectedTemplate.versionLabel
    ? selectedTemplate.versionLabel
    : /* istanbul ignore next */ (
        templates.find(
          /* istanbul ignore next */ template => template.stableTemplate && template.versionLabel
        ) as TemplateSummaryResponse
      ).versionLabel

  const entityIdentifier = `${selectedTemplate.identifier}/${versionLabel}/`
  const { orgIdentifier, projectIdentifier } = defaultTo(selectedTemplate, {})

  // Custom FQN is required when the entity type is template - as projectIdentifier and orgIdentifier needs to be omitted
  // in case of account level templates and only projectIdentifier is to be omitted in case of org level templates

  let referredEntityFQN = `${accountId}/`
  /* istanbul ignore else */ if (orgIdentifier) {
    referredEntityFQN += `${orgIdentifier}/`
  }
  /* istanbul ignore else */ if (projectIdentifier) {
    referredEntityFQN += `${projectIdentifier}/`
  }
  referredEntityFQN += `${entityIdentifier}`

  return referredEntityFQN
}

export function TemplateReferenceByTabPanel(props: Props) {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedTemplate, templates } = props

  return (
    <EntitySetupUsage
      pageSize={4}
      pageHeaderClassName={css.referencedByHeader}
      pageBodyClassName={css.referencedByBody}
      entityType={EntityType.Template}
      customReferredEntityFQN={getCustomReferredEntityFQN({
        selectedTemplate,
        templates,
        accountId
      })}
    />
  )
}
