/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { Container, Icon, Text, Layout, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import BarrierStageTooltip from '../BarrierStageTooltip/BarrierStageTooltip'

export interface CDInfoProps {
  data?: any
  barrier?: {
    barrierInfoLoading?: boolean
    barrierData?: any
  }
}

interface IconComponentProps {
  label: string
  value: string
  icon: IconName
  dataTestId: string
}

function InfoComponent(props: IconComponentProps): React.ReactElement {
  const { label, value, icon, dataTestId } = props
  return (
    <Layout.Horizontal padding={{ right: 'medium', bottom: 'small', left: 'small' }}>
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name={icon} color={Color.GREY_600} size={24} />
      </Container>
      <Layout.Vertical spacing={'xsmall'} padding={{ top: 'xsmall', bottom: 'xsmall' }}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {label}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_700} data-testid={dataTestId}>
          {value}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default function CDInfo(props: CDInfoProps): React.ReactElement {
  const { getString } = useStrings()
  const { data, barrier } = props
  const artifacts = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.sidecars', []).map(
    (artifact: any) => artifact.imagePath ?? artifact.version
  )

  const primaryArtifactPath = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.primary', {})
  if (!isEmpty(primaryArtifactPath)) {
    artifacts.push(
      primaryArtifactPath.imagePath ??
        primaryArtifactPath.version ??
        primaryArtifactPath.artifactPath ??
        primaryArtifactPath.artifactPathFilter
    )
  }
  const serviceName = get(data, 'data.moduleInfo.cd.serviceInfo.displayName', null)
  const environment = get(data, 'data.moduleInfo.cd.infraExecutionSummary.name', null)
  const infraStructures = get(data, 'data.moduleInfo.cd.infraExecutionSummary.infrastructureIdentifier', null)
  return (
    <Container>
      {barrier?.barrierData?.data && data.status === 'Running' && (
        <BarrierStageTooltip
          loading={!!barrier.barrierInfoLoading}
          stageName={data.name}
          data={barrier.barrierData?.data}
        />
      )}
      {(serviceName || artifacts.length > 0 || environment) && (
        <Container border={{ top: true, width: 1, color: Color.GREY_100 }} padding={{ top: 'small' }}>
          {serviceName && (
            <InfoComponent
              label={getString('serviceOrServices')}
              value={serviceName}
              icon="services"
              dataTestId="hovercard-service"
            />
          )}

          {artifacts.length > 0 && (
            <Layout.Horizontal padding={{ right: 'medium', bottom: 'small', left: 'small' }}>
              <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
                <Icon name="services" color={Color.GREY_600} size={24} />
              </Container>
              <Layout.Vertical spacing={'xsmall'} padding={{ top: 'xsmall', bottom: 'xsmall' }}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('artifactOrArtifacts')}
                </Text>
                <Layout.Vertical spacing={'xsmall'} data-testid="hovercard-artifact">
                  {artifacts.map((imagePath: string, index: number) => (
                    <Text
                      key={`${imagePath}+${index}`}
                      font={{ size: 'xsmall' }}
                      color={Color.GREY_700}
                      data-testid="hovercard-artifacts"
                    >
                      {imagePath}
                    </Text>
                  ))}
                </Layout.Vertical>
              </Layout.Vertical>
            </Layout.Horizontal>
          )}
          {environment && (
            <InfoComponent
              label={getString('environmentOrEnvironments')}
              value={environment}
              icon="services"
              dataTestId="hovercard-environment"
            />
          )}
          {infraStructures && (
            <InfoComponent
              label={getString('infrastructureText')}
              value={infraStructures}
              icon="infrastructure"
              dataTestId="hovercard-infraStructure"
            />
          )}
        </Container>
      )}
    </Container>
  )
}
