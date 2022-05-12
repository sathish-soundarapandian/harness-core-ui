/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Container, Formik, FormikForm, Button, ButtonVariation } from '@wings-software/uicore'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'

import produce from 'immer'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PipelineActions } from '@common/constants/TrackingConstants'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'

const logger = loggerFor(ModuleName.CD)

interface UseTemplate {
  useTemplate?: boolean
}

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo: string
  branch: string
}

type CretePipelinesValue = PipelineInfoConfigWithGitDetails & UseTemplate

export interface PipelineCreateProps {
  afterSave?: (values: PipelineInfoConfig, gitDetails?: EntityGitDetails, useTemplate?: boolean) => void
  initialValues?: CretePipelinesValue
  closeModal?: () => void
  gitDetails?: IGitContextFormProps
}

export default function CreatePipelines({
  afterSave,
  initialValues = {
    identifier: DefaultNewPipelineId,
    name: '',
    description: '',
    tags: {},
    repo: '',
    branch: '',
    stages: []
  },
  closeModal,
  gitDetails
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { isGitSyncEnabled } = useAppStore()
  const { trackEvent } = useTelemetry()
  const templatesFeatureFlagEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const pipelineTemplatesFeatureFlagEnabled = useFeatureFlag(FeatureFlag.NG_PIPELINE_TEMPLATE)
  const isPipelineTemplateEnabled = templatesFeatureFlagEnabled && pipelineTemplatesFeatureFlagEnabled

  const newInitialValues = React.useMemo(() => {
    return produce(initialValues, draft => {
      if (draft.identifier === DefaultNewPipelineId) {
        draft.identifier = ''
      }
    })
  }, [initialValues])

  const isEdit = React.useMemo(() => initialValues?.identifier !== DefaultNewPipelineId, [initialValues])

  useEffect(() => {
    !isEdit &&
      trackEvent(PipelineActions.LoadCreateNewPipeline, {
        category: Category.PIPELINE
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  return (
    <Formik<CretePipelinesValue>
      initialValues={newInitialValues}
      formName="pipelineCreate"
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
        identifier: IdentifierSchema(),
        ...(isGitSyncEnabled
          ? {
              repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
              branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
            }
          : {})
      })}
      onSubmit={values => {
        logger.info(JSON.stringify(values))
        const formGitDetails =
          values.repo && values.repo.trim().length > 0
            ? { repoIdentifier: values.repo, branch: values.branch }
            : undefined
        afterSave && afterSave(omit(values, 'repo', 'branch', 'useTemplate'), formGitDetails, values.useTemplate)
      }}
    >
      {formikProps => (
        <FormikForm>
          <NameIdDescriptionTags
            formikProps={formikProps}
            identifierProps={{
              isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
            }}
            tooltipProps={{ dataTooltipId: 'pipelineCreate' }}
            className={css.pipelineCreateNameIdDescriptionTags}
          />
          {isGitSyncEnabled && (
            <GitSyncStoreProvider>
              <GitContextForm formikProps={formikProps as any} gitDetails={gitDetails} />
            </GitSyncStoreProvider>
          )}
          {!isEdit && isPipelineTemplateEnabled && (
            <Container padding={{ top: 'xlarge' }}>
              <Button
                text={'Start with Template'}
                icon={'template-library'}
                iconProps={{
                  size: 12
                }}
                variation={ButtonVariation.SECONDARY}
                onClick={() => {
                  formikProps.setFieldValue('useTemplate', true)
                  window.requestAnimationFrame(() => {
                    formikProps.submitForm()
                  })
                }}
              />
            </Container>
          )}
          <Container padding={{ top: 'xlarge' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              type="submit"
              text={isEdit ? getString('save') : getString('start')}
            />
            &nbsp; &nbsp;
            <Button
              variation={ButtonVariation.TERTIARY}
              text={getString('cancel')}
              onClick={() => {
                trackEvent(PipelineActions.CancelCreateNewPipeline, {
                  category: Category.PIPELINE
                })
                closeModal?.()
              }}
            />
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}
