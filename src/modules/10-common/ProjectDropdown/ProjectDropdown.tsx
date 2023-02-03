/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProjectListPromise, ProjectResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface ProjectDropdown {
  onChange: (item: SelectOption) => void
  value?: SelectOption
  className?: string
}

const ProjectDropdown: React.FC<ProjectDropdown> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const [query, setQuery] = useState<string>()
  const { getString } = useStrings()

  function projectListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      getProjectListPromise({ queryParams: { accountIdentifier: accountId, searchTerm: query } })
        .then(result => {
          let selectItems: Array<SelectOption> = []

          if (result?.data?.content?.length) {
            selectItems = result?.data?.content?.reduce?.((selected: Array<SelectOption>, item: ProjectResponse) => {
              if (item.project?.name && item.project?.identifier) {
                return [...selected, { label: item.project.name, value: item.project.identifier }]
              }
              return selected
            }, [])
          }

          resolve(selectItems)
        })
        .catch(() => {
          resolve([])
        })
    })
  }

  return (
    <DropDown
      className={props.className}
      buttonTestId="project-select"
      onChange={props.onChange}
      value={props.value}
      items={projectListPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('projectsText')}
    />
  )
}

export default ProjectDropdown
