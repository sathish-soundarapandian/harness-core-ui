/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable } from '@blueprintjs/core'
import {
  ModuleVersionsListResponseResponse,
  ModuleVersionsResponse,
  useListModuleVersions
} from 'services/cd-ng-open-api'
import css from './UseReleaseNotesModal.module.scss'

export interface ModuleVersionTableProps {
  moduleVersions?: ModuleVersionsListResponseResponse
}

export const ModuleVersionTable: React.FC<ModuleVersionTableProps> = () => {
  const { data } = useListModuleVersions(
    {
      queryParams: {
        page: 0
      }
    } || []
  )

  return (
    <HTMLTable className={css.table} data-testid="release-note-table">
      <thead>
        <tr style={{ backgroundColor: '#E2F5FF' }} data-testid="release-note-table-head">
          <th className={css.th}>Component</th>
          <th className={css.th}>Version</th>
          <th className={css.th}>Last Updated</th>
          <th className={css.th}>Release Notes</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((module: ModuleVersionsResponse, i: number) => (
          <tr key={`${module?.name}-${i}`} className={css.tr}>
            <td className={css.td} data-testid="name">
              {module?.display_name}
            </td>
            <td className={css.td} data-testid="version">
              {module?.version}
            </td>
            <td className={css.td} data-testid="updated">
              {module?.updated}
            </td>
            <td className={css.td} data-testid="link">
              <a href={`${module?.release_notes_link}`} target="_blank" rel="noreferrer noopener">
                {'Link'}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}
