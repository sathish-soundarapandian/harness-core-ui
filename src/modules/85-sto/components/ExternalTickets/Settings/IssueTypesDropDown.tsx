/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropDown } from '@harness/uicore'
import type { DropDownProps, SelectOption } from '@harness/uicore'
import { useMetadataGetProject } from 'services/ticket-service/ticketServiceComponents'
import type { Project } from 'services/ticket-service/ticketServiceSchemas'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

type IssueTypesDropDownProps = Omit<DropDownProps, 'items'> & {
  jiraProjectId: string
  value?: string
}

const IssueTypesDropDown: React.FC<IssueTypesDropDownProps> = ({ jiraProjectId, value, ...props }) => {
  const {
    accountId,
    orgIdentifier: orgId,
    projectIdentifier: projectId,
    module = 'sto'
  } = useParams<ProjectPathProps & Optional<ModulePathParams>>()
  const [items, setItems] = useState<SelectOption[] | undefined>()

  const { data } = useMetadataGetProject<Project>(
    {
      pathParams: { id: jiraProjectId },
      queryParams: { accountId, orgId, projectId, module }
    },
    {
      retry: false,
      staleTime: 60000
    }
  )

  useEffect(() => {
    if (data?.ticketTypes) {
      setItems(
        data.ticketTypes?.filter(tt => !tt.isSubtask).map(tt => ({ label: tt.name, value: tt.name } as SelectOption)) ||
          []
      )
    }
  }, [data, setItems])

  return <DropDown {...props} items={items} value={value || ''} />
}
export default IssueTypesDropDown
