/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import cx from 'classnames'
import { capitalize, defaultTo, isEmpty, isUndefined } from 'lodash-es'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Card,
  Collapse,
  Container,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  PageError,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import {
  GetActiveServiceInstanceDetailsGroupedByPipelineExecutionQueryParams,
  InstanceDetailGroupedByPipelineExecution,
  InstanceDetailsDTO,
  NGServiceConfig,
  useGetActiveServiceInstanceDetailsGroupedByPipelineExecution
} from 'services/cd-ng'
import type {
  ExecutionPathProps,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps,
  ServicePathProps
} from '@common/interfaces/RouteInterfaces'
import { DialogEmptyState } from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/EnvironmentDetailsUtils'
import routes from '@common/RouteDefinitions'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { useServiceContext } from '@cd/context/ServiceContext'
import { commonActiveInstanceData } from '../ActiveServiceInstances/ActiveServiceInstancePopover'

import PostProdRollbackBtn from './PostProdRollback/PostProdRollbackButton'
import type { PipelineExecInfoProps } from './ServiceDetailUtils'
import { supportedDeploymentTypesForPostProdRollback } from './PostProdRollback/PostProdRollbackUtil'
import css from './ServiceDetailsSummaryV2.module.scss'

export interface ServiceDetailInstanceViewProps {
  envName: string
  envId: string
  environmentType: 'PreProduction' | 'Production'
  infraIdentifier?: string
  infraName?: string
  clusterIdentifier?: string
  artifact?: string
  closeDailog?: () => void
  isEnvView: boolean
  setRollbacking?: React.Dispatch<React.SetStateAction<boolean>>
}

interface ActiveInstanceInfoProp {
  instanceData: InstanceDetailsDTO
  getString: UseStringsReturn['getString']
}

interface InstanceViewProp {
  instanceData: InstanceDetailGroupedByPipelineExecution[] | undefined
  artifactName: string
  infraName: string
  closeDailog?: () => void
  isEnvView: boolean
  setRollbacking?: React.Dispatch<React.SetStateAction<boolean>>
}

const ActiveInstanceInfo = (prop: ActiveInstanceInfoProp): React.ReactElement => {
  const { instanceData, getString } = prop
  const sectionData = commonActiveInstanceData(instanceData, getString)

  return (
    <Layout.Vertical padding={{ top: 'medium' }}>
      {sectionData.map(item => {
        return (
          <Layout.Vertical key={item.header} className={css.activeInstanceStyle}>
            <Text font={{ weight: 'semi-bold', size: 'small' }} margin={{ bottom: 'small' }} color={Color.GREY_800}>
              {item.header}
            </Text>
            <Layout.Vertical>
              {item.values.map(itemValue =>
                itemValue.value ? (
                  <Layout.Horizontal key={itemValue.label}>
                    <Text
                      font={{ weight: 'semi-bold', size: 'small' }}
                      color={Color.GREY_500}
                      margin={{ right: 'medium', bottom: 'xsmall' }}
                      width={90}
                      lineClamp={1}
                    >
                      {`${itemValue.label}:`}
                    </Text>
                    <Text
                      font={{ weight: 'semi-bold', size: 'small' }}
                      color={Color.GREY_800}
                      className={css.sectionValue}
                      width={300}
                      lineClamp={1}
                    >
                      {itemValue.value}
                    </Text>
                  </Layout.Horizontal>
                ) : (
                  <></>
                )
              )}
            </Layout.Vertical>
          </Layout.Vertical>
        )
      })}
    </Layout.Vertical>
  )
}

function InstanceView(prop: InstanceViewProp): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { instanceData, artifactName, infraName, closeDailog, isEnvView, setRollbacking } = prop
  const pipelineDetailList: PipelineExecInfoProps[] = (instanceData || []).map(pipelineInfo => {
    return {
      pipelineId: pipelineInfo.pipelineId,
      planExecutionId: pipelineInfo.planExecutionId,
      lastDeployedAt: defaultTo(pipelineInfo.lastDeployedAt, 0),
      count: pipelineInfo.instances.length,
      infrastructureMappingId: pipelineInfo.instances[0].infrastructureMappingId,
      instanceKey: pipelineInfo.instances[0].instanceKey,
      rollbackStatus: pipelineInfo.rollbackStatus,
      stageNodeExecutionId: pipelineInfo.stageNodeExecutionId,
      stageSetupId: pipelineInfo.stageSetupId
    }
  })
  const { orgIdentifier, projectIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  const makeKey = (info?: PipelineExecInfoProps): string => {
    if (isUndefined(info)) return ''
    return `${info.pipelineId}_${info.planExecutionId}_${info.lastDeployedAt}`
  }

  const [pipelineExecKey, setPipelineExecKey] = useState<PipelineExecInfoProps | undefined>()

  //serviceType
  const { serviceResponse } = useServiceContext()
  const serviceDataParse = React.useMemo(
    () => yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, '')),
    [serviceResponse?.yaml]
  )
  const serviceType = serviceDataParse?.service?.serviceDefinition?.type

  // Allow rollback action or not
  const showRollbackAction =
    useFeatureFlag(FeatureFlag.POST_PROD_ROLLBACK) &&
    serviceType &&
    supportedDeploymentTypesForPostProdRollback.includes(serviceType) &&
    isEnvView

  if (!instanceData?.length) {
    return <></>
  }

  const instanceDetailMap = new Map<string, InstanceDetailsDTO[]>()
  instanceData.forEach(item =>
    instanceDetailMap.set(`${item.pipelineId}_${item.planExecutionId}_${item.lastDeployedAt}`, item.instances)
  )

  if (
    (isUndefined(pipelineExecKey) && pipelineDetailList.length) ||
    (pipelineExecKey && !instanceDetailMap.has(makeKey(pipelineExecKey)))
  ) {
    setPipelineExecKey({
      pipelineId: pipelineDetailList[0].pipelineId,
      planExecutionId: pipelineDetailList[0].planExecutionId,
      lastDeployedAt: defaultTo(pipelineDetailList[0].lastDeployedAt, 0),
      count: pipelineDetailList[0].count,
      infrastructureMappingId: pipelineDetailList[0].infrastructureMappingId,
      instanceKey: pipelineDetailList[0].instanceKey,
      rollbackStatus: pipelineDetailList[0].rollbackStatus,
      stageNodeExecutionId: pipelineDetailList[0].stageNodeExecutionId,
      stageSetupId: pipelineDetailList[0].stageSetupId
    })
  }

  function handleClick(pipelineId?: string, executionIdentifier?: string): void {
    /* istanbul ignore else */
    if (pipelineId && executionIdentifier) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineId,
        executionIdentifier,
        projectIdentifier,
        accountId,
        module,
        source
      })

      window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  return (
    <Layout.Horizontal className={css.instanceDetail}>
      <Layout.Vertical className={css.overflowScrollPipelineIdList}>
        {pipelineDetailList.map(card => (
          <Card
            key={makeKey(card)}
            className={css.pipelineExecCardStyle}
            onClick={() => {
              setPipelineExecKey(card)
            }}
            selected={makeKey(pipelineExecKey) === makeKey(card)}
          >
            <Layout.Horizontal className={css.pipelineIdTitle}>
              <Text color={Color.PRIMARY_7} font={{ weight: 'bold' }} lineClamp={1} tooltipProps={{ isDark: true }}>
                {`${card.pipelineId} `}
              </Text>
              <Text color={Color.PRIMARY_7} font={{ weight: 'bold' }}>
                {` (${card.count})`}
              </Text>
            </Layout.Horizontal>
            {card.lastDeployedAt ? (
              <ReactTimeago
                date={new Date(card.lastDeployedAt)}
                component={val => (
                  <Text font={{ size: 'xsmall' }} color={Color.GREY_500}>
                    {' '}
                    {val.children}{' '}
                  </Text>
                )}
              />
            ) : null}
          </Card>
        ))}
      </Layout.Vertical>
      <Layout.Vertical padding={4}>
        <Layout.Horizontal spacing="small">
          <Button
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            text={getString('cd.openExecution')}
            className={css.openExecBtn}
            icon="launch"
            onClick={() => handleClick(pipelineExecKey?.pipelineId, pipelineExecKey?.planExecutionId)}
            iconProps={{ size: 12, color: Color.PRIMARY_7 }}
          />
          {showRollbackAction ? (
            <PostProdRollbackBtn
              artifactName={artifactName}
              infraName={infraName}
              closeDailog={closeDailog}
              setRollbacking={setRollbacking}
              {...pipelineExecKey}
            />
          ) : null}
        </Layout.Horizontal>
        <div className={cx('separator', css.separatorStyle, css.marginBottom12)} />
        <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.marginBottom12}>
          {getString('pipeline.execution.instances')}
        </Text>
        <div className={css.overflowScroll}>
          {(instanceDetailMap.get(makeKey(pipelineExecKey)) || []).map((instance, index) => (
            <Collapse
              key={`${makeKey(pipelineExecKey)}_${index}`}
              collapseClassName={css.collapse}
              collapseHeaderClassName={css.collapseHeader}
              heading={<Text font={{ variation: FontVariation.SMALL }}>{`Instance - ${index + 1}`}</Text>} //todo text to decided later
              expandedHeading={<Text font={{ variation: FontVariation.SMALL }}>{`Instance - ${index + 1}`}</Text>}
              isOpen={!index}
              collapsedIcon={'main-chevron-right'}
              expandedIcon={'main-chevron-down'}
            >
              {<ActiveInstanceInfo instanceData={instance} getString={getString} />}
            </Collapse>
          ))}
        </div>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default function ServiceDetailInstanceView(props: ServiceDetailInstanceViewProps): React.ReactElement {
  const {
    artifact,
    envName,
    envId,
    environmentType,
    clusterIdentifier,
    infraIdentifier,
    infraName,
    closeDailog,
    isEnvView,
    setRollbacking
  } = props
  const { getString } = useStrings()
  const [searchTermInstance, setSearchTermInstance] = useState('')
  const searchInstanceRef = useRef({} as ExpandingSearchInputHandle)
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveServiceInstanceDetailsGroupedByPipelineExecutionQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    envId,
    environmentType,
    artifact,
    clusterIdentifier,
    infraIdentifier
  }

  const { data, loading, error, refetch } = useGetActiveServiceInstanceDetailsGroupedByPipelineExecution({
    queryParams,
    lazy: !envId
  })

  const instanceDetailData = data?.data?.instanceDetailGroupedByPipelineExecutionList

  const filteredInstanceData = useMemo(() => {
    /* istanbul ignore else */
    if (!searchTermInstance) {
      return instanceDetailData
    }

    const searchValue = searchTermInstance.toLocaleLowerCase()
    return instanceDetailData?.filter(instance => instance.pipelineId.toLocaleLowerCase().includes(searchValue))
  }, [instanceDetailData, searchTermInstance])

  const resetSearch = /* istanbul ignore next */ (): void => {
    searchInstanceRef.current.clear()
  }

  const onSearchInfra = useCallback(
    /* istanbul ignore next */ (val: string) => {
      setSearchTermInstance(val.trim())
    },
    []
  )

  const noData = !filteredInstanceData?.length
  const searchApplied = !isEmpty(searchTermInstance.trim())

  return (
    <Container className={css.instanceDetailView}>
      <Container className={css.instanceViewHeader}>
        <Text className={css.instanceDetailTitle}>{getString('cd.serviceDashboard.instanceDetails')}</Text>
        {(!noData || searchApplied) && (
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            onChange={onSearchInfra}
            className={css.searchIconStyle}
            alwaysExpanded
            ref={searchInstanceRef}
          />
        )}
      </Container>
      <div className={cx('separator', css.separatorStyle)} />
      {loading ? (
        <Container
          flex={{ justifyContent: 'center', alignItems: 'center' }}
          height={700}
          data-test="ServiceInstancesLoading"
        >
          <Icon name="spinner" color={Color.BLUE_500} size={30} />
        </Container>
      ) : error ? (
        <Container data-test="ServiceInstancesError" height={700} flex={{ justifyContent: 'center' }}>
          <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
        </Container>
      ) : noData ? (
        <DialogEmptyState
          isSearchApplied={searchApplied}
          resetSearch={resetSearch}
          isServicePage={true}
          message={getString('cd.environmentDetailPage.noInstancesToShow')}
        />
      ) : (
        <>
          <Layout.Horizontal
            margin={{ top: 'medium', bottom: 'small' }}
            flex={{ alignItems: 'center', justifyContent: 'start' }}
            spacing="small"
          >
            <Icon name="instances" color={Color.GREY_1000} />
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {capitalize(getString('environment').toLowerCase()) + ':'}
            </Text>
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} tooltipProps={{ isDark: true }}>
              {envName}
            </Text>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_600}>
              {' | '}
            </Text>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {capitalize(getString('cd.infra')) + ':'}
            </Text>
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} tooltipProps={{ isDark: true }}>
              {infraName ? infraName : '-'}
            </Text>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_600}>
              {' | '}
            </Text>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {capitalize(getString('cd.serviceDashboard.artifact')) + ':'}
            </Text>
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} tooltipProps={{ isDark: true }}>
              {artifact ? artifact : '-'}
            </Text>
          </Layout.Horizontal>
          <InstanceView
            instanceData={filteredInstanceData}
            artifactName={defaultTo(artifact, '-')}
            infraName={defaultTo(infraName, '-')}
            closeDailog={closeDailog}
            isEnvView={isEnvView}
            setRollbacking={setRollbacking}
          />
        </>
      )}
    </Container>
  )
}
