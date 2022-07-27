
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {  Color } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import React from 'react'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useGetExecutionDetailV2 } from 'services/pipeline-ng'
import type { ChangeTitleData } from './components/ChangeEventCard/ChangeEventCard.types'
import { createChangeTitleData } from './components/ChangeEventCard/ChangeEventCard.utils'
import { Text,  Layout } from '@wings-software/uicore'
import css from './components/ChangeEventCard/components/ChangeTitle/ChangeTitle.module.scss'
import { useStrings } from 'framework/strings'

export const ChangeTableName = ({row}: any) => {
    const {original: data} = useMemo(()=>row, [row]);
    const { getString } = useStrings()
    const { orgIdentifier, projectIdentifier, accountId } = useParams<
    ProjectPathProps & { identifier: string }
  >()
    const { data: executionDetails } = useGetExecutionDetailV2({
        planExecutionId: defaultTo(data?.metadata?.planExecutionId, ''),
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          stageNodeId: data?.metadata?.stageStepId
        }
      })
    
      const { pipelineExecutionSummary } = defaultTo(executionDetails?.data, {})
      const { pipelineIdentifier, runSequence, status } = defaultTo(pipelineExecutionSummary, {})
    
      const changeTitleData: ChangeTitleData = useMemo(
        () => createChangeTitleData(data, pipelineIdentifier, runSequence, status),
        [pipelineExecutionSummary]
      )

      const { name, executionId, url } = changeTitleData
  const titleOptions = useMemo(
    () =>
      url
        ? {
            tooltip: name,
            className: css.addEllipsis
          }
        : {},
    [url, name]
  )
      console.log("changeTitleData", changeTitleData)
      return (<><Layout.Horizontal>
      <Text
        {...titleOptions}
        font={{ size: 'medium', weight: 'semi-bold' }}
        width="max-content"
        margin={{ right: 'medium' }}
        color={Color.BLACK_100}
      >
        {name}
      </Text>
      <Text font={{ size: 'xsmall' }} color={Color.GREY_800} flex={{ align: 'center-center' }}>
        ({getString('cd.serviceDashboard.executionId')}
        <span>{executionId}</span>)
      </Text>
    </Layout.Horizontal></>)
}