/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import cx from 'classnames'
import { Card, getErrorInfoFromErrorObject, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Spinner } from '@blueprintjs/core'
import { capitalize, defaultTo } from 'lodash-es'
import {
  InstanceInfoDTO,
  AzureWebAppInstanceInfoDTO,
  CustomDeploymentInstanceInfoDTO,
  EcsInstanceInfoDTO,
  SpotInstanceInfoDTO,
  Failure,
  GetActiveInstancesByServiceIdEnvIdAndBuildIdsQueryParams,
  GetInstancesDetailsQueryParams,
  GitOpsInstanceInfoDTO,
  InstanceDetailsDTO,
  K8sInstanceInfoDTO,
  NativeHelmInstanceInfoDTO,
  ServiceDefinition,
  useGetActiveInstancesByServiceIdEnvIdAndBuildIds,
  useGetInstancesDetails,
  SpotInfrastructureDetails
} from 'services/cd-ng'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { useStrings } from 'framework/strings'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export type InstanceData = Record<string, Record<string, InstanceDetailsDTO[]>>

/**
 * @TODO Use this type from cd-ng service file.
 * Currently BE is not synced with latest BE develop and hence types issues are getting created.
 * So, did not update cd-ng services and created local type here
 */
type GoogleFunctionInstanceInfoDTO = InstanceInfoDTO & {
  functionName: string
  infraStructureKey?: string
  memorySize?: string
  project: string
  region: string
  revision: string
  runTime?: string
  source?: string
  updatedTime?: number
}

export interface ActiveServiceInstancePopoverProps {
  buildId?: string
  envId?: string
  instanceNum?: number
  serviceIdentifier?: string
  isEnvDetail?: boolean
  infraIdentifier?: string
  clusterId?: string
  pipelineExecutionId?: string
}

interface SectionProps {
  header: string
  values: {
    label: string
    value: string
  }[]
}

const Section: React.FC<{ data: SectionProps[] }> = props => {
  const { data } = props
  return (
    <Card className={css.activeServiceInstancePopover}>
      <Layout.Vertical>
        {data.map(item => {
          return (
            <Layout.Vertical key={item.header} className={css.activeServiceInstancePopoverSection}>
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
                        width={206}
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
    </Card>
  )
}

export const ActiveServiceInstancePopover: React.FC<ActiveServiceInstancePopoverProps> = props => {
  const {
    buildId = '',
    envId = '',
    instanceNum = 0,
    serviceIdentifier = '',
    isEnvDetail = false,
    pipelineExecutionId,
    infraIdentifier,
    clusterId
  } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { getString } = useStrings()

  const queryParams: GetActiveInstancesByServiceIdEnvIdAndBuildIdsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId: serviceId || serviceIdentifier,
    envId,
    buildIds: [buildId],
    clusterIdentifier: clusterId,
    infraIdentifier,
    pipelineExecutionId
  }

  const queryParamsEnv: GetInstancesDetailsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId: serviceId || serviceIdentifier,
    envId,
    infraIdentifier,
    clusterIdentifier: clusterId,
    pipelineExecutionId: defaultTo(pipelineExecutionId, ''),
    buildId: buildId
  }

  const { loading, data, error } = useGetActiveInstancesByServiceIdEnvIdAndBuildIds({
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: isEnvDetail
  })

  const {
    loading: envLoading,
    data: envData,
    error: envError
  } = useGetInstancesDetails({
    queryParams: queryParamsEnv,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: !isEnvDetail
  })

  if ((!isEnvDetail && loading) || (isEnvDetail && envLoading)) {
    return (
      <Card className={cx(css.activeServiceInstancePopover, css.spinner)}>
        <Spinner />
      </Card>
    )
  }

  if ((!isEnvDetail && error) || (isEnvDetail && envError)) {
    const errorObj = isEnvDetail ? envError : error
    return (
      <Card className={cx(css.activeServiceInstancePopover, css.spinner)}>
        <Text className={css.errorText}>{getErrorInfoFromErrorObject(errorObj as GetDataError<Failure | Error>)}</Text>
      </Card>
    )
  }

  if (
    (!isEnvDetail && !data?.data?.instancesByBuildIdList?.[0]?.instances?.length) ||
    (isEnvDetail && !envData?.data?.instances?.length)
  ) {
    return (
      <Card className={cx(css.activeServiceInstancePopover, css.spinner)}>
        <Text>{getString('cd.serviceDashboard.instanceDataEmpty')}</Text>
      </Card>
    )
  }

  const instanceData =
    (isEnvDetail
      ? envData?.data?.instances?.[instanceNum]
      : data?.data?.instancesByBuildIdList?.[0]?.instances?.[instanceNum]) || {}

  const instanceInfoDTOProperties = (instanceData?.instanceInfoDTO as CustomDeploymentInstanceInfoDTO)?.properties || {}
  const defaultInstanceInfoData = [
    {
      label:
        instanceData.instanceInfoDTO?.type === ServiceDeploymentType.ServerlessAwsLambda
          ? capitalize(getString('cd.serviceDashboard.function'))
          : capitalize(getString('cd.serviceDashboard.pod')),
      value: instanceData.podName || ''
    },
    {
      label: capitalize(getString('cd.serviceDashboard.artifact')),
      value: instanceData.artifactName || ''
    }
  ]
  const customDeploymentInstanceInfoData = Object.keys(instanceInfoDTOProperties).map(instanceDetailsKey => ({
    label: instanceDetailsKey,
    value: instanceInfoDTOProperties?.[instanceDetailsKey]
  }))

  function instanceInfoData(deploymentType: string | undefined): any {
    switch (deploymentType) {
      case ServiceDeploymentType.AzureWebApp:
        return [
          {
            label: getString('cd.serviceDashboard.webApp'),
            value: (instanceData.instanceInfoDTO as AzureWebAppInstanceInfoDTO).appName || ''
          },
          {
            label: getString('cd.serviceDashboard.host'),
            value: (instanceData.instanceInfoDTO as AzureWebAppInstanceInfoDTO).hostName || ''
          },
          {
            label: getString('common.state'),
            value: (instanceData.instanceInfoDTO as AzureWebAppInstanceInfoDTO).instanceState || ''
          },
          {
            label: getString('cd.serviceDashboard.artifact'),
            value: instanceData.artifactName || ''
          }
        ]
      case ServiceDeploymentType.ECS:
        return [
          {
            label: getString('cd.serviceName'),
            value: (instanceData.instanceInfoDTO as EcsInstanceInfoDTO)?.serviceName || ''
          },
          {
            label: getString('pipeline.artifactTriggerConfigPanel.artifact'),
            value: instanceData.artifactName || ''
          },
          {
            label: getString('cd.serviceDashboard.taskDefinitionArn'),
            value: (instanceData.instanceInfoDTO as EcsInstanceInfoDTO)?.taskDefinitionArn || ''
          },
          {
            label: getString('cd.serviceDashboard.taskArn'),
            value: (instanceData.instanceInfoDTO as EcsInstanceInfoDTO)?.taskArn || ''
          }
        ]
      case ServiceDeploymentType.GoogleCloudFunctions: {
        const instanceInfo = instanceData.instanceInfoDTO as GoogleFunctionInstanceInfoDTO
        const functionNameArr = instanceInfo?.functionName.split('/')
        const fuctionName = functionNameArr[functionNameArr.length - 1]
        return [
          {
            label: getString('cd.serviceDashboard.revision'),
            value: defaultTo(instanceInfo?.revision, '')
          },
          {
            label: getString('cd.serviceDashboard.functionName'),
            value: defaultTo(fuctionName, '')
          },
          {
            label: getString('cd.serviceDashboard.source'),
            value: defaultTo(instanceInfo?.source, '')
          },
          {
            label: getString('cd.serviceDashboard.runTime'),
            value: defaultTo(instanceInfo?.runTime, '')
          },
          {
            label: getString('cd.serviceDashboard.updatedTime'),
            value: defaultTo(instanceInfo?.updatedTime, '')
          },
          {
            label: getString('cd.serviceDashboard.memorySize'),
            value: defaultTo(instanceInfo?.memorySize, '')
          }
        ]
      }
      case ServiceDeploymentType.Elastigroup:
        return [
          ...defaultInstanceInfoData,
          {
            label: getString('cd.serviceDashboard.ec2InstanceId'),
            value: (instanceData.instanceInfoDTO as SpotInstanceInfoDTO)?.ec2InstanceId || ''
          }
        ]
      case ServiceDeploymentType.CustomDeployment:
        return [
          ...customDeploymentInstanceInfoData,
          {
            label: getString('cd.serviceDashboard.artifact'),
            value: instanceData.artifactName || ''
          }
        ]
      default:
        return ((instanceData?.instanceInfoDTO as K8sInstanceInfoDTO)?.containerList || []).length
          ? [
              ...defaultInstanceInfoData,
              {
                label: getString('cd.serviceDashboard.containerList'),
                value: (
                  <>
                    {(instanceData?.instanceInfoDTO as K8sInstanceInfoDTO)?.containerList?.map(
                      (cont: { containerId?: string; image?: string }) => {
                        return (
                          <Text lineClamp={1} className={css.containerListItems} key={cont?.containerId}>
                            {cont?.image}
                          </Text>
                        )
                      }
                    )}
                  </>
                )
              }
            ]
          : [...defaultInstanceInfoData]
    }
  }

  const getInfrastructureSectionValues = (deploymentType: ServiceDefinition['type']) => {
    switch (deploymentType) {
      case ServiceDeploymentType.Elastigroup:
        return [
          {
            label: getString('cd.serviceDashboard.elastigroupId'),
            value: (instanceData.infrastructureDetails as SpotInfrastructureDetails)?.elastigroupId || ''
          }
        ]
      case ServiceDeploymentType.ECS:
        return [
          {
            label: getString('cd.serviceDashboard.awsRegion'),
            value: instanceData.infrastructureDetails?.region
          },
          {
            label: getString('common.clusterName'),
            value: instanceData.infrastructureDetails?.cluster
          }
        ]
      default:
        return Object.keys(instanceData.infrastructureDetails || {}).map(infrastructureDetailsKey => ({
          label: capitalize(infrastructureDetailsKey),
          value: instanceData.infrastructureDetails?.[infrastructureDetailsKey]
        }))
    }
  }

  const infrastructureSectionValues = getInfrastructureSectionValues(
    instanceData.instanceInfoDTO?.type as ServiceDefinition['type']
  )

  const clusterIdentifier = (instanceData.instanceInfoDTO as GitOpsInstanceInfoDTO)?.clusterIdentifier

  if (clusterIdentifier) {
    infrastructureSectionValues.push({
      label: getString('common.cluster').toLowerCase(),
      value: clusterIdentifier
    })
  }

  const sectionData: SectionProps[] = [
    {
      header: getString('cd.serviceDashboard.instanceDetails'),
      values: instanceInfoData(instanceData.instanceInfoDTO?.type)
    },
    {
      header: getString('infrastructureText'),
      values: infrastructureSectionValues
    },
    {
      header: getString('deploymentText'),
      values: [
        {
          label: getString('cd.serviceDashboard.deployedAt'),
          value: getReadableDateTime(instanceData.deployedAt, 'MMM DD, YYYY hh:mm a')
        },
        {
          label: getString('cd.serviceDashboard.deployedBy'),
          value: instanceData.deployedByName
        },
        {
          label: getString('common.pipeline'),
          value: instanceData.pipelineExecutionName
        }
      ]
    }
  ]
  if ((instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO)?.helmChartInfo) {
    sectionData.push({
      header: getString('cd.serviceDashboard.helmChartDetails'),
      values: [
        {
          label: getString('cd.serviceDashboard.helmChartName'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.name as string
        },
        {
          label: getString('cd.serviceDashboard.helmRopoUrl'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.repoUrl as string
        },
        {
          label: getString('helmVersion'),
          value: (instanceData.instanceInfoDTO as NativeHelmInstanceInfoDTO).helmChartInfo?.version as string
        }
      ]
    })
  }
  return <Section data={sectionData}></Section>
}
