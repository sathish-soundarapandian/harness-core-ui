/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Checkbox, ExpandingSearchInput, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import StatusSelect from '@pipeline/components/StatusSelect/StatusSelect'
import NewPipelineSelect from '@pipeline/components/NewPipelineSelect/NewPipelineSelect'
import { getFeaturePropsForRunPipelineButton, getRbacButtonModules } from '@pipeline/utils/runPipelineUtils'
import { useBooleanStatus, useUpdateQueryParams } from '@common/hooks'
import { Page } from '@common/exports'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { GetListOfExecutionsQueryParams } from 'services/pipeline-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ExecutionCompareYaml } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareYaml'
import { useExecutionCompareContext } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import { useExecutionListFilterContext } from '../ExecutionListFilterContext/ExecutionListFilterContext'
import { ExecutionListFilter } from '../ExecutionListFilter/ExecutionListFilter'
import type { ExecutionListProps } from '../ExecutionList'
import css from './ExecutionListSubHeader.module.scss'

export interface FilterQueryParams {
  query?: string
  pipeline?: string
  status?: ExecutionStatus | null
}

export function ExecutionListSubHeader(
  props: Pick<ExecutionListProps, 'isPipelineInvalid' | 'onRunPipeline'>
): React.ReactElement {
  const { module, pipelineIdentifier } = useParams<Partial<PipelineType<PipelinePathProps>>>()
  const { queryParams } = useExecutionListFilterContext()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()
  const rbacButtonModules = getRbacButtonModules(module)
  const { getString } = useStrings()
  const { isCompareMode, cancelCompareMode, compareItems } = useExecutionCompareContext()
  const { state: showCompareExecutionDrawer, close, open } = useBooleanStatus(false)

  const changeQueryParam = <T extends keyof GetListOfExecutionsQueryParams>(
    key: T,
    value: GetListOfExecutionsQueryParams[T]
  ): void => {
    if (value) {
      updateQueryParams({ [key]: value, page: DEFAULT_PAGE_INDEX })
    } else {
      updateQueryParams({ [key]: undefined }) // removes the specific param
    }
  }

  if (isCompareMode) {
    return (
      <>
        <Page.SubHeader className={css.main}>
          <Text font={{ variation: FontVariation.LEAD }}>{getString('pipeline.execution.compareExecutionsTitle')}</Text>
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
            <Button
              text={getString('pipeline.execution.compareAction')}
              variation={ButtonVariation.PRIMARY}
              onClick={() => open()}
              disabled={compareItems.length < 2}
            />
            <Button
              text={getString('cancel')}
              variation={ButtonVariation.TERTIARY}
              onClick={() => cancelCompareMode()}
            />
          </Layout.Horizontal>
        </Page.SubHeader>
        {showCompareExecutionDrawer && (
          <ExecutionCompareYaml
            compareItems={compareItems}
            onClose={() => {
              close()
              cancelCompareMode()
            }}
          />
        )}
      </>
    )
  }

  return (
    <Page.SubHeader className={css.main}>
      <div className={css.lhs}>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          className={css.runButton}
          onClick={props.onRunPipeline}
          disabled={props.isPipelineInvalid}
          tooltip={props.isPipelineInvalid ? getString('pipeline.cannotRunInvalidPipeline') : ''}
          permission={{
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier
            },
            permission: PermissionIdentifier.EXECUTE_PIPELINE,
            options: {
              skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
            }
          }}
          featuresProps={getFeaturePropsForRunPipelineButton({ modules: rbacButtonModules, getString })}
        >
          <String stringID="runPipelineText" />
        </RbacButton>
        <Checkbox
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_800}
          label={getString(
            (() => {
              switch (module) {
                case 'ci':
                  return 'pipeline.myBuildsText'
                case 'cd':
                  return 'pipeline.myDeploymentsText'
                case 'sto':
                  return 'pipeline.mySecurityTestsText'
                default:
                  return 'pipeline.myPipelineRunsText'
              }
            })()
          )}
          checked={queryParams.myDeployments}
          onChange={e => changeQueryParam('myDeployments', e.currentTarget.checked)}
          className={cx(css.myDeploymentsCheckbox, { [css.selected]: queryParams.myDeployments })}
        />
        <StatusSelect
          value={queryParams.status as ExecutionStatus[]}
          onSelect={value => changeQueryParam('status', value as GetListOfExecutionsQueryParams['status'])}
        />
        {pipelineIdentifier ? null : (
          <NewPipelineSelect
            selectedPipeline={queryParams.pipelineIdentifier}
            onPipelineSelect={value => changeQueryParam('pipelineIdentifier', value)}
          />
        )}
      </div>
      <div className={css.rhs}>
        <ExpandingSearchInput
          defaultValue={queryParams.searchTerm}
          alwaysExpanded
          onChange={value => changeQueryParam('searchTerm', value)}
          width={200}
          className={css.expandSearch}
        />
        <ExecutionListFilter />
      </div>
    </Page.SubHeader>
  )
}
