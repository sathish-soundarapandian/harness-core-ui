/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { useStrings } from 'framework/strings'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { MultiEnvironmentsInputSetForm } from './MultiEnvironmentsInputSetForm'
import { EnvironmentGroupInputSetForm } from './EnvironmentGroupInputSetForm'
import SingleEnvironmentInputSetForm from './SingleEnvironmentInputSetForm'
import type { StageInputSetFormProps } from '../StageInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export default function EnvironmentsInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier'>): React.ReactElement {
  const { getString } = useStrings()
  const { NG_SVC_ENV_REDESIGN: isSvcEnvEntityEnabled } = useFeatureFlags()

  return (
    <>
      <SingleEnvironmentInputSetForm
        deploymentStage={deploymentStage}
        deploymentStageTemplate={deploymentStageTemplate}
        allowableTypes={allowableTypes}
        path={path}
        viewType={viewType}
        readonly={readonly}
        stageIdentifier={stageIdentifier}
      />

      {isSvcEnvEntityEnabled && deploymentStageTemplate.environments && (
        <div id={`Stage.${stageIdentifier}.Environments`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('environments')}</div>
          <div className={css.nestedAccordions}>
            <MultiEnvironmentsInputSetForm
              deploymentStage={deploymentStage}
              deploymentStageTemplate={deploymentStageTemplate}
              allowableTypes={allowableTypes}
              path={path}
              viewType={viewType}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              pathToEnvironments={'environments.values'}
              entityType={'environments'}
            />
          </div>
        </div>
      )}

      <EnvironmentGroupInputSetForm
        deploymentStage={deploymentStage}
        deploymentStageTemplate={deploymentStageTemplate}
        allowableTypes={allowableTypes}
        path={path}
        viewType={viewType}
        readonly={readonly}
        stageIdentifier={stageIdentifier}
      />
    </>
  )
}
