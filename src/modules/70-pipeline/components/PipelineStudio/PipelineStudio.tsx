/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudioInternal } from '@pipeline/components/PipelineStudio/PipelineStudioInternal/PipelineStudioInternal'
import { TrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { getCDTrialDialog } from './CDTrial/useCDTrialModal'
import { getCITrialDialog } from './CITrial/useCITrialModal'
import { getPipelineStages } from './PipelineStagesUtils'
import css from './PipelineStudio.module.scss'

export default function PipelineStudio(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { branch, repoIdentifier, repoName, connectorRef, storeType } = useQueryParams<GitQueryParams>()

  const history = useHistory()

  const getTrialPipelineCreateForm = (
    onSubmit: (values: PipelineInfoConfig) => void,
    onClose: () => void
  ): React.ReactElement => {
    if (module === 'cd') {
      return getCDTrialDialog({
        actionProps: { onSuccess: onSubmit },
        trialType: TrialType.SET_UP_PIPELINE,
        onCloseModal: onClose
      })
    } else if (module === 'ci') {
      return getCITrialDialog({
        actionProps: { onSuccess: onSubmit },
        trialType: TrialType.SET_UP_PIPELINE,
        onCloseModal: onClose
      })
    } else {
      return <>/</>
    }
  }

  const { modal } = useQueryParams<{ modal?: ModuleLicenseType }>()

  const getOtherModal = modal ? getTrialPipelineCreateForm : undefined
  const handleRunPipeline = (): void => {
    history.push(
      routes.toPipelineStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier,
        repoName,
        connectorRef,
        storeType,
        runPipeline: true
      })
    )
  }
  const { licenseInformation } = useLicenseStore()
  const isCFEnabled = useFeatureFlag(FeatureFlag.CFNG_ENABLED)
  const isCIEnabled = useFeatureFlag(FeatureFlag.CING_ENABLED)
  const isCDEnabled = useFeatureFlag(FeatureFlag.CDNG_ENABLED)
  const isSTOEnabled = useFeatureFlag(FeatureFlag.SECURITY_STAGE)
  const isPipelineChainingEnabled = useFeatureFlag(FeatureFlag.PIPELINE_CHAINING)
  const { getString } = useStrings()

  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        repoIdentifier,
        branch,
        repoName,
        connectorRef,
        storeType
      }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getPipelineStages({
          args,
          getString,
          module,
          isCIEnabled: licenseInformation['CI'] && isCIEnabled,
          isCDEnabled: licenseInformation['CD'] && isCDEnabled,
          isCFEnabled: licenseInformation['CF'] && isCFEnabled,
          isSTOEnabled,
          isApprovalStageEnabled: true,
          isPipelineChainingEnabled
        })
      }
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudioInternal
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineProject={routes.toDeployments}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineList={routes.toPipelines}
        getOtherModal={getOtherModal}
      />
    </PipelineProvider>
  )
}
