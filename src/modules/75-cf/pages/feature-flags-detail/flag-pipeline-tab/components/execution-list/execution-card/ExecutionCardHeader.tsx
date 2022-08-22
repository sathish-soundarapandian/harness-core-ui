/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation, Color } from '@harness/design-system'
import { Container, Text } from '@harness/uicore'
import React, { FC } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Duration, TimeAgo } from '@common/exports'
import routes from '@common/RouteDefinitions'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import type { FeaturePipelineExecution } from 'services/cf'
import { useStrings } from 'framework/strings'
import css from '../ExecutionList.module.scss'

interface ExecutionCardHeaderProps {
  executionHistoryItem: FeaturePipelineExecution
  pipelineIdentifier: string
}

const ExecutionCardHeader: FC<ExecutionCardHeaderProps> = ({ executionHistoryItem, pipelineIdentifier }) => {
  const history = useHistory()
  const { orgIdentifier, accountId, projectIdentifier } = useParams<Record<string, string>>()

  const { getString } = useStrings()

  return (
    <Container
      border={{ bottom: true, color: Color.GREY_250 }}
      padding={{ right: 'medium', left: 'medium' }}
      flex={{ justifyContent: 'space-between' }}
    >
      <span className={css.executionCardHeaderLeft}>
        <ExecutionStatusLabel status={executionHistoryItem.status as ExecutionStatus} />
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
          {getString('cf.featureFlags.flagPipeline.buildID')}: {executionHistoryItem.runSequence}
        </Text>
      </span>
      <span className={css.executionCardHeaderRight}>
        <Duration
          iconProps={{
            size: 10
          }}
          startTime={executionHistoryItem.createdAt}
          endTime={executionHistoryItem.endTs}
          icon="deployment-timeout-legacy"
          font={{ variation: FontVariation.SMALL }}
        />
        <TimeAgo
          time={executionHistoryItem.createdAt}
          font={{ variation: FontVariation.SMALL }}
          iconProps={{
            size: 10
          }}
          color={Color.GREY_900}
        />
        <Text
          icon="person"
          iconProps={{
            size: 12,
            inverse: true
          }}
          font={{ variation: FontVariation.SMALL }}
          color={Color.GREY_900}
        >
          {executionHistoryItem.triggeredBy}
        </Text>
        <RbacOptionsMenuButton
          items={[
            {
              text: getString('cf.featureFlags.flagPipeline.openExecution'),
              onClick:
                /* istanbul ignore next */
                () =>
                  history.push(
                    routes.toExecutionPipelineView({
                      accountId,
                      orgIdentifier,
                      module: 'cf',
                      projectIdentifier,
                      executionIdentifier: executionHistoryItem.executionId,
                      pipelineIdentifier: pipelineIdentifier,
                      source: 'executions'
                    })
                  ),
              permission: {
                resource: { resourceType: ResourceType.FEATUREFLAG },
                permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
              },
              featuresProps: {
                featuresRequest: {
                  featureNames: [FeatureIdentifier.MAUS]
                }
              }
            }
          ]}
        />
      </span>
    </Container>
  )
}

export default ExecutionCardHeader
