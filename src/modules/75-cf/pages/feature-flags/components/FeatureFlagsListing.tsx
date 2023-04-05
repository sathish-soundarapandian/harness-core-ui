/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Cell, CellProps, Column, Renderer } from 'react-table'
import { Container, Layout, TableV2, Text, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import type { DeleteFeatureFlagQueryParams, Feature, FeatureMetric, Features } from 'services/cf'
import {
  featureFlagHasCustomRules,
  getDefaultVariation,
  isFeatureFlagOn,
  useFeatureFlagTypeToStringMapping
} from '@cf/utils/CFUtils'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import { useStrings } from 'framework/strings'
import { VariationTypeIcon } from '@cf/components/VariationTypeIcon/VariationTypeIcon'
import FlagOptionsMenuButton from '@cf/components/FlagOptionsMenuButton/FlagOptionsMenuButton'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import type { UseToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import type { UseGovernancePayload } from '@cf/hooks/useGovernance'
import { FeatureFlagStatus, FlagStatus } from '../FlagStatus'
import { FlagResult } from '../FlagResult'
import { RenderFeatureFlag } from './RenderFeatureFlag'

export interface FeatureFlagsListingProps {
  features?: Features | null
  toggleFeatureFlag: UseToggleFeatureFlag
  featureMetrics?: FeatureMetric[]
  featureMetricsLoading?: boolean
  numberOfEnvs?: number
  governance: UseGovernancePayload
  refetchFlags: () => void
  deleteFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  onRowClick: (flagId: string) => void
}

const FeatureFlagsListing: React.FC<FeatureFlagsListingProps> = ({
  features,
  toggleFeatureFlag,
  featureMetrics,
  featureMetricsLoading,
  numberOfEnvs,
  governance,
  refetchFlags,
  deleteFlag,
  queryParams,
  onRowClick
}) => {
  const gitSync = useFFGitSyncContext()
  const { getString } = useStrings()

  const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
    const data = row.original
    const isOn = isFeatureFlagOn(data)
    const hasCustomRules = featureFlagHasCustomRules(data)

    const defaultVariation = getDefaultVariation(data)

    const isFlagTypeBoolean = data.kind === FlagTypeVariations.booleanFlag
    const typeToString = useFeatureFlagTypeToStringMapping()

    return (
      <Layout.Vertical>
        <Layout.Horizontal>
          <Text>
            <VariationTypeIcon multivariate={data.kind !== FlagTypeVariations.booleanFlag} />
            {getString(isFlagTypeBoolean ? 'cf.boolean' : 'cf.multivariate')}
            {!isFlagTypeBoolean && (
              <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }}>
                ({typeToString[data.kind] || ''})
              </Text>
            )}
          </Text>
        </Layout.Horizontal>
        {!hasCustomRules && (
          <Container style={{ display: 'flex', alignItems: 'center' }}>
            <VariationWithIcon
              variation={defaultVariation}
              index={data.variations.indexOf(defaultVariation)}
              textStyle={{
                fontSize: '12px',
                lineHeight: '24px',
                color: '#9293AB',
                paddingLeft: 'var(--spacing-xsmall)'
              }}
              textElement={getString(isOn ? 'cf.featureFlags.defaultServedOn' : 'cf.featureFlags.defaultServedOff', {
                defaultVariation: defaultVariation.name || defaultVariation.value
              })}
            />
          </Container>
        )}
      </Layout.Vertical>
    )
  }

  const columns: Column<Feature>[] = useMemo(
    () => [
      {
        Header: getString('featureFlagsText').toUpperCase(),
        accessor: row => row.name,
        width: '40%',
        Cell: (cell: Cell<Feature>) => (
          <RenderFeatureFlag
            numberOfEnvs={numberOfEnvs}
            gitSync={gitSync}
            toggleFeatureFlag={toggleFeatureFlag}
            governance={governance}
            cell={cell}
            refetchFlags={refetchFlags}
          />
        )
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.kind,
        width: '22%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        width: '21%',
        Cell: function StatusCell(cell: Cell<Feature>) {
          const metrics = featureMetrics?.find(metric => metric.identifier === cell.row.original.identifier)

          return featureMetricsLoading ? (
            <Text icon="spinner" iconProps={{ size: 14 }}>
              {getString('cf.loading')}
            </Text>
          ) : (
            <FlagStatus
              status={metrics?.status?.status as FeatureFlagStatus}
              lastAccess={metrics?.status?.lastAccess as unknown as number}
            />
          )
        }
      },
      {
        Header: getString('cf.featureFlags.results').toUpperCase(),
        accessor: row => row.results,
        width: '12%',
        Cell: function ResultCell(cell: Cell<Feature>) {
          const metrics = featureMetrics?.find(metric => metric.identifier === cell.row.original.identifier)

          return featureMetricsLoading ? (
            <Text icon="spinner" iconProps={{ size: 14 }}>
              {getString('cf.loading')}
            </Text>
          ) : (
            <FlagResult feature={cell.row.original} metrics={metrics?.results} />
          )
        }
      },
      {
        id: 'version',
        width: '5%',
        Cell: (cell: Cell<Feature>) => (
          <Container style={{ textAlign: 'right' }} onClick={Utils.stopEvent}>
            <FlagOptionsMenuButton
              environment={cell.row.original.envProperties?.environment as string}
              flagData={cell.row.original}
              queryParams={queryParams}
              deleteFlag={deleteFlag}
              gitSync={gitSync}
              refetchFlags={refetchFlags}
            />
          </Container>
        ),
        disableSortBy: true,
        refetchFlags
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      gitSync.isAutoCommitEnabled,
      gitSync.isGitSyncEnabled,
      features,
      featureMetrics,
      featureMetricsLoading,
      queryParams
    ]
  )

  return (
    <TableV2<Feature>
      columns={columns}
      data={features?.features || []}
      onRowClick={feature => onRowClick(feature.identifier)}
    />
  )
}

export default FeatureFlagsListing
