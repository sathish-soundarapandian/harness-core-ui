/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Heading, HarnessDocTooltip } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type { FormikErrors } from 'formik'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'
import type { InputSetDTO } from '@pipeline/utils/types'

import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import GitPopover from '../../../components/GitPopover/GitPopover'
import { ErrorsStrip } from '../../../components/ErrorsStrip/ErrorsStrip'

import css from '../../../components/RunPipelineModal/RunPipelineForm.module.scss'

export interface RunModalHeaderV1Props {
  pipelineExecutionId?: string
  runClicked: boolean
  executionView?: boolean
  pipelineResponse: ResponsePMSPipelineResponseDTO | null
  formRefDom: React.MutableRefObject<HTMLElement | undefined>
  formErrors: FormikErrors<InputSetDTO>
  runModalHeaderTitle: string
}

export default function RunModalHeaderV1(props: RunModalHeaderV1Props): React.ReactElement | null {
  const { runClicked, executionView, pipelineResponse, formRefDom, formErrors, runModalHeaderTitle } = props
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const isPipelineRemote =
    supportingGitSimplification &&
    pipelineResponse?.data?.gitDetails?.repoName &&
    pipelineResponse?.data?.gitDetails?.branch

  if (executionView) {
    return null
  }

  return (
    <>
      <div className={css.runModalHeader}>
        <Heading
          level={2}
          font={{ weight: 'bold' }}
          color={Color.BLACK_100}
          className={css.runModalHeaderTitle}
          data-tooltip-id="runPipelineFormTitle"
        >
          {runModalHeaderTitle}
          <HarnessDocTooltip tooltipId="runPipelineFormTitle" useStandAlone={true} />
        </Heading>
        {isGitSyncEnabled && (
          <GitSyncStoreProvider>
            <GitPopover
              data={pipelineResponse?.data?.gitDetails ?? {}}
              iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
            />
          </GitSyncStoreProvider>
        )}
      </div>
      {isPipelineRemote && (
        <div className={css.gitRemoteDetailsWrapper}>
          <GitRemoteDetails
            repoName={pipelineResponse?.data?.gitDetails?.repoName}
            branch={pipelineResponse?.data?.gitDetails?.branch}
            filePath={pipelineResponse?.data?.gitDetails?.filePath}
            fileUrl={pipelineResponse?.data?.gitDetails?.fileUrl}
            flags={{ readOnly: true }}
          />
        </div>
      )}
      {runClicked ? <ErrorsStrip domRef={formRefDom} formErrors={formErrors} /> : null}
    </>
  )
}
