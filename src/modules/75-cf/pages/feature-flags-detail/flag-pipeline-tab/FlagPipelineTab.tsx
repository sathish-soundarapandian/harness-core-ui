/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/pipeline_flags_empty_state.svg'
import { useStrings } from 'framework/strings'
import { useGetFeaturePipeline, Variation } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import AvailablePipelinesDrawer from './components/available-pipelines-drawer/AvailablePipelinesDrawer'
import ConfiguredPipelineView from './components/configured-pipeline-view/ConfiguredPipelineView'
import PipelineErrorBanner from './components/pipeline-error-banner/PipelineErrorBanner'
export interface FlagPipelineTabProps {
  flagIdentifier: string
  flagVariations: Variation[]
}

const FlagPipelineTab: React.FC<FlagPipelineTabProps> = ({ flagIdentifier, flagVariations }) => {
  const { getString } = useStrings()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { trackEvent } = useTelemetry()

  const queryParams = useMemo(
    () => ({
      identifier: flagIdentifier,
      environmentIdentifier,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier
    }),
    [accountIdentifier, environmentIdentifier, orgIdentifier, projectIdentifier, flagIdentifier]
  )

  const {
    data: featurePipeline,
    loading,
    refetch: refetchFeaturePipeline
  } = useGetFeaturePipeline({
    identifier: flagIdentifier,
    queryParams,
    debounce: 500
  })

  const POLLING_INTERVAL = 5000
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (featurePipeline?.pipelineDetails) {
      setIsPolling(true)
      const polling = window.setTimeout(refetchFeaturePipeline, POLLING_INTERVAL)
      return () => window.clearTimeout(polling)
    }
  }, [featurePipeline, refetchFeaturePipeline])

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (loading && !isDrawerOpen && !isPolling) {
    return (
      <Container height="100%" flex={{ align: 'center-center' }}>
        <ContainerSpinner />
      </Container>
    )
  }

  return (
    <>
      {featurePipeline?.pipelineConfigured && !featurePipeline.pipelineErrorState ? (
        <ConfiguredPipelineView
          pipelineData={featurePipeline}
          flagIdentifier={flagIdentifier}
          flagVariations={flagVariations}
          onEdit={() => setIsDrawerOpen(true)}
          refetchFeaturePipeline={async () => await refetchFeaturePipeline()}
        />
      ) : (
        <Layout.Vertical height="100%">
          {featurePipeline?.pipelineErrorState && (
            <PipelineErrorBanner message={getString('cf.featureFlags.flagPipeline.pipelineDeleted')} />
          )}

          <Container height="100%" flex={{ align: 'center-center' }}>
            <NoData
              message={getString('cf.featureFlags.flagPipeline.noDataMessage')}
              buttonText={getString('cf.featureFlags.flagPipeline.title')}
              buttonProps={{ icon: 'plus' }}
              description={getString('cf.featureFlags.flagPipeline.noDataDescription')}
              imageURL={imageUrl}
              onClick={() => {
                setIsDrawerOpen(true)
                trackEvent(FeatureActions.AddFlagPipeline, {
                  category: Category.FEATUREFLAG
                })
              }}
              imgWidth={650}
            />
          </Container>
        </Layout.Vertical>
      )}

      <AvailablePipelinesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        flagIdentifier={flagIdentifier}
        configuredPipelineDetails={featurePipeline?.pipelineDetails}
        refetchFeaturePipeline={async () => await refetchFeaturePipeline()}
      />
    </>
  )
}

export default FlagPipelineTab
