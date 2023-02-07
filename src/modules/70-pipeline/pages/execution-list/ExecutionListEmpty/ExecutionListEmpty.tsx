/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import { defaultTo, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import emptyExecutionList from '@pipeline/pages/execution-list/images/cd-execution-illustration.svg'
import { getModuleRunType, getModuleRunTypeDetails } from '@pipeline/utils/runPipelineUtils'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import noDataFound from '@pipeline/icons/noDataFound.svg'
import { getIsAnyFilterApplied, useExecutionListQueryParams } from '../utils/executionListUtil'
import type { ExecutionListProps } from '../ExecutionList'
import { useExecutionListEmptyAction } from './useExecutionListEmptyAction'
import css from './ExecutionListEmpty.module.scss'

export function ExecutionListEmpty({
  isPipelineInvalid,
  onRunPipeline,
  resetFilter
}: Pick<ExecutionListProps, 'isPipelineInvalid' | 'onRunPipeline'> & { resetFilter: () => void }): JSX.Element {
  const { getString } = useStrings()
  const queryParams = useExecutionListQueryParams()
  const isAnyFilterApplied = getIsAnyFilterApplied(queryParams)
  const { module } = useModuleInfo()
  const { hasNoPipelines, loading, EmptyAction } = useExecutionListEmptyAction(
    !!isPipelineInvalid,
    defaultTo(onRunPipeline, noop)
  )
  const { illustration } = getModuleRunTypeDetails(module)

  return (
    <div className={css.noExecutions}>
      {isAnyFilterApplied ? (
        <Layout.Vertical spacing="small" flex>
          <img src={EmptySearchResults} className={css.image} />
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <Button
            text={getString('common.filters.clearFilters')}
            variation={ButtonVariation.LINK}
            onClick={resetFilter}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
          <img src={illustration} className={css.image} />
          <Text className={css.noExecutionsText} margin={{ top: 'medium', bottom: 'small' }}>
            {hasNoPipelines
              ? getString('pipeline.noPipelinesLabel')
              : getString('pipeline.noRunsLabel', { moduleRunType: getModuleRunType(module) })}
          </Text>
          {!loading && (
            <Text className={css.noExecutionsSubText} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
              {hasNoPipelines
                ? getString('pipeline.noPipelinesText')
                : getString('pipeline.noRunsText', { moduleRunType: getModuleRunType(module) })}
            </Text>
          )}
          <EmptyAction />
        </Layout.Vertical>
      )}
    </div>
  )
}

export function ExecutionListEmptyWithoutCta({
  resetFilter
}: Pick<ExecutionListProps, 'isPipelineInvalid'> & { resetFilter: () => void }): JSX.Element {
  const { getString } = useStrings()
  const queryParams = useExecutionListQueryParams()
  const isAnyFilterApplied = getIsAnyFilterApplied(queryParams)

  return (
    <Container className={css.executionListEmpty}>
      {isAnyFilterApplied ? (
        <Layout.Vertical flex={{ alignItems: 'center' }}>
          <img src={noDataFound} alt={getString('common.filters.noResultsFound')} />
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noResultsFound')}
          </Text>
          <Button
            text={getString('common.filters.clearFilters')}
            variation={ButtonVariation.LINK}
            onClick={resetFilter}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical>
          <img src={emptyExecutionList} alt={getString('pipeline.emptyExecutionListMsg')} />
          <Text>{getString('pipeline.emptyExecutionListMsg')}</Text>
        </Layout.Vertical>
      )}
    </Container>
  )
}
