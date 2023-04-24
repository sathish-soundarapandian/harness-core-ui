/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import type { Cell, Column } from 'react-table'
import { Container, Layout, TableV2, Text, Utils } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import type { DeleteFeatureFlagQueryParams, Feature, FlagState, ProjectFlags } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import FlagOptionsMenuButton from '@cf/components/FlagOptionsMenuButton/FlagOptionsMenuButton'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import { formatDate } from '@cf/utils/CFUtils'
import FlagEnvironmentsState from './FlagEnvironmentsState'
export interface AllEnvironmentsFlagsListingProps {
  environments: EnvironmentResponseDTO[]
  projectFlags: ProjectFlags
  refetchFlags: () => void
  deleteFlag: (data: string, mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void>) => void
  queryParams: DeleteFeatureFlagQueryParams
}

export const AllEnvironmentsFlagsListing: FC<AllEnvironmentsFlagsListingProps> = ({
  environments,
  projectFlags,
  refetchFlags,
  deleteFlag,
  queryParams
}) => {
  const prodEnvs = useMemo(() => environments.filter(e => e.type === 'Production'), [environments])
  const nonProdEnvs = useMemo(() => environments.filter(e => e.type === 'PreProduction'), [environments])
  const gitSync = useFFGitSyncContext()
  const { getString } = useStrings()

  const allEnvironmentsColumns: Column<FlagState>[] = useMemo(
    () => [
      {
        font: FontVariation.TABLE_HEADERS,
        id: 'flagName',
        accessor: row => row.name,
        width: '25%',
        Cell: (cell: Cell<FlagState>) => (
          <Container
            flex={{ distribution: 'space-between', align: 'center-center' }}
            padding={{ left: 'small', right: 'small' }}
          >
            <Layout.Vertical spacing="xsmall" width="fit-content">
              <Text color={Color.BLACK} font={{ variation: FontVariation.BODY2 }}>
                {cell.row.original.name}
              </Text>
              <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
                {cell.row.original.identifier}
              </Text>
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                {cell.row.original.description}
              </Text>
            </Layout.Vertical>
          </Container>
        )
      },
      {
        font: FontVariation.TABLE_HEADERS,
        id: 'createdAt',
        accessor: 'createdAt',
        width: '15%',
        Cell: (cell: Cell<FlagState>) => (
          <Layout.Horizontal
            flex={{ distribution: 'space-between', align: 'center-center' }}
            padding={{ left: 'small', right: 'small' }}
          >
            <Layout.Vertical spacing="xsmall">
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
                {getString('created')}
              </Text>

              <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
                {formatDate(cell.row.original.createdAt)}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        )
      },
      {
        id: 'environments',
        font: FontVariation.TABLE_HEADERS,
        width: '55%',
        Cell: (cell: Cell<FlagState>) => {
          const environmentsByType = {
            nonProd: nonProdEnvs.map(env => ({
              identifier: env.identifier,
              name: env.name,
              enabled: cell.row.original.environments[`${env.identifier}`].enabled
            })),
            prod: prodEnvs.map(env => ({
              identifier: env.identifier,
              name: env.name,
              enabled: cell.row.original.environments[`${env.identifier}`].enabled
            }))
          }
          return <FlagEnvironmentsState environmentsByType={environmentsByType} />
        }
      },
      {
        id: 'actions',
        width: '5%',
        Cell: (cell: Cell<Feature>) => (
          <Container flex={{ justifyContent: 'flex-end' }} onClick={Utils.stopEvent}>
            <FlagOptionsMenuButton
              flagData={cell.row.original}
              queryParams={queryParams}
              deleteFlag={deleteFlag}
              gitSync={gitSync}
              refetchFlags={refetchFlags}
            />
          </Container>
        ),
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nonProdEnvs, prodEnvs, queryParams, gitSync]
  )

  return <TableV2<FlagState> columns={allEnvironmentsColumns} data={projectFlags?.flags || []} />
}

export default AllEnvironmentsFlagsListing
