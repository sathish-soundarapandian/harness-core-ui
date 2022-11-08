/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { getModuleRunType, getModuleRunTypeDetails } from '@pipeline/utils/runPipelineUtils'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import type { ExecutionListProps } from '../ExecutionList'
import { useExecutionListFilterContext } from '../ExecutionListFilterContext/ExecutionListFilterContext'
import { useExecutionListEmptyAction } from './useExecutionListEmptyAction'
import css from './ExecutionListEmpty.module.scss'

export function ExecutionListEmpty({
  isPipelineInvalid,
  onRunPipeline
}: Pick<ExecutionListProps, 'isPipelineInvalid' | 'onRunPipeline'>): JSX.Element {
  const { getString } = useStrings()
  const { isAnyFilterApplied, clearFilter } = useExecutionListFilterContext()
  const { module } = useModuleInfo()
  const { hasNoPipelines, loading, EmptyAction } = useExecutionListEmptyAction(!!isPipelineInvalid, onRunPipeline)
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
            onClick={clearFilter}
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
