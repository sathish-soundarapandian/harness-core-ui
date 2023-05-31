/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { ArtifactCell, PipelineStepCell, SbomCell, TypeCell, ViolationsCell } from './ArtifactTableCells'
import css from './ArtifactsTable.module.scss'

export type ArtifactType = 'File' | 'Image' | 'Sbom'

export interface Artifact {
  type: ArtifactType
  imageName: string
  tag: string
  url: string
  id?: string // artifact Id
  stepExecutionId?: string
  sbomName?: string
  sbomUrl?: string
  isSbomAttested?: string
  node?: ExecutionNode
  stage: string
  allowListViolationCount: number | undefined
  denyListViolationCount: number | undefined
}

export interface ArtifactsColumnActions {
  showEnforcementViolations: (stepExecutionId?: string) => void
}

export interface ArtifactsTableProps extends ArtifactsColumnActions {
  artifacts: Artifact[]
}

export function ArtifactsTable({ artifacts, showEnforcementViolations }: ArtifactsTableProps): React.ReactElement {
  const { getString } = useStrings()

  const columns: Column<Artifact>[] = React.useMemo(() => {
    return [
      {
        Header: 'Artifact', //TODO: move this to common and update all instances
        accessor: 'url',
        Cell: ArtifactCell
      },
      {
        Header: getString('step'),
        accessor: 'node',
        Cell: PipelineStepCell
      },
      {
        Header: getString('pipeline.artifactsSelection.artifactType'),
        accessor: 'type',
        Cell: TypeCell
      },
      {
        Header: getString('common.violations'),
        accessor: 'allowListViolationCount',
        Cell: ViolationsCell,
        showEnforcementViolations
      },
      {
        Header: getString('common.sbom'),
        accessor: 'sbomName',
        Cell: SbomCell
      }
    ]
  }, [getString, showEnforcementViolations])

  return <TableV2 className={css.table} columns={columns} data={artifacts} sortable />
}
