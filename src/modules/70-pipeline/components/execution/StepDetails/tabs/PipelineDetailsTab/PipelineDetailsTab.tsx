/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { partition } from 'lodash-es'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { isExecutionComplete, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { String, useStrings } from 'framework/strings'
import { Collapse } from '@pipeline/components/execution/StepDetails/common/Collapse/Collapse'

import css from './PipelineDetailsTab.module.scss'

export function PipelineDetailsTab(): React.ReactElement {
  const { pipelineStagesMap, queryParams } = useExecutionContext()
  const { getString } = useStrings()

  const [completedStages, upcomingStages] = partition(
    [...pipelineStagesMap.values()].filter(stage => !isExecutionSkipped(stage.status)),
    stage => isExecutionComplete(stage.status)
  )
  const filteredCompletedStages = completedStages.reverse().filter(stage => queryParams.stage !== stage.nodeUuid)
  const filteredUpcomingStages = upcomingStages.filter(stage => queryParams.stage !== stage.nodeUuid)

  return (
    <div className={css.main}>
      <div className={css.upcoming}>
        <String stringID="pipeline.execution.upcomingStagesPrefix" />
        {filteredUpcomingStages.length > 0 ? (
          <span>{filteredUpcomingStages.map(stage => stage.name).join(', ')}</span>
        ) : (
          <String stringID="none" />
        )}
      </div>
      <String tagName="div" className={css.title} stringID="pipeline.execution.stagesExecuted" />
      {filteredCompletedStages.length > 0 ? (
        filteredCompletedStages.map(stage => (
          <div key={stage.nodeUuid}>
            <Collapse
              titleContentClassName={css.summary}
              titleClassName={css.collapseTitle}
              title={
                <React.Fragment>
                  <div>{`${getString('pipeline.execution.stageTitlePrefix')} ${stage.name}`}</div>
                  <div>
                    {stage.endTs
                      ? `${getString('pipeline.execution.timePrefix')}${moment(stage.endTs).fromNow()}`
                      : /* istanbul ignore next */ null}
                  </div>
                </React.Fragment>
              }
              isDefaultOpen
            >
              {stage.moduleInfo?.cd ? (
                <div className={css.stageInfo}>
                  <div>
                    <String className={css.heading} tagName="div" stringID="serviceOrServices" />
                    <Text lineClamp={1} font={{ size: 'small' }} color={Color.BLACK}>
                      {stage.moduleInfo.cd.serviceInfo?.displayName}
                    </Text>
                  </div>
                  <div>
                    <String className={css.heading} tagName="div" stringID="artifactOrArtifacts" />
                    <div>
                      {[
                        stage.moduleInfo.cd.serviceInfo?.artifacts?.primary ? (
                          <div>
                            <Text lineClamp={1} font={{ size: 'small' }} color={Color.BLACK}>
                              {stage.moduleInfo.cd.serviceInfo.artifacts.primary.imagePath}
                            </Text>
                            <Text lineClamp={1} font={{ size: 'small' }} color={Color.BLACK}>
                              ({getString('common.artifactTag')}: #
                              {stage.moduleInfo.cd.serviceInfo.artifacts.primary.tag})
                            </Text>
                          </div>
                        ) : (
                          ''
                        ),
                        ...(stage.moduleInfo.cd.serviceInfo?.artifacts?.sidecars || /* istanbul ignore next */ []).map(
                          (artifact: any) => (
                            <div key={artifact.imagePath}>
                              <Text lineClamp={1} color={Color.BLACK}>
                                {artifact.imagePath}
                              </Text>
                              <Text lineClamp={1} color={Color.BLACK}>
                                ({getString('common.artifactTag')}: #{artifact.tag})
                              </Text>
                            </div>
                          )
                        )
                      ]
                        .filter(str => str)
                        .map((str, i) => (
                          <div key={i}>{str}</div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <String className={css.heading} tagName="div" stringID="environmentOrEnvironments" />
                    <Text lineClamp={1} font={{ size: 'small' }} color={Color.BLACK}>
                      {stage.moduleInfo.cd.infraExecutionSummary?.name}
                    </Text>
                  </div>
                </div>
              ) : /* istanbul ignore next */ null}
            </Collapse>
          </div>
        ))
      ) : (
        <String stringID="none" />
      )}
    </div>
  )
}
