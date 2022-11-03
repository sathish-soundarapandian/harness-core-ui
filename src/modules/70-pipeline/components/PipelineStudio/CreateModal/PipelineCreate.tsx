/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get, omit, pick } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import { Container, Formik, FormikForm, Button, ButtonVariation, Text } from '@wings-software/uicore'
import { FontVariation } from '@wings-software/design-system'
import { Divider } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails, PipelineInfoConfig } from 'services/pipeline-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PipelineActions } from '@common/constants/TrackingConstants'
import { GitSyncForm, gitSyncFormSchema } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { InlineRemoteSelect } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { errorCheck } from '@common/utils/formikHelpers'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'

const logger = loggerFor(ModuleName.CD)

interface UseTemplate {
  useTemplate?: boolean
}

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo?: string
  branch: string
  connectorRef?: string
  storeType?: string
  importYaml?: string
  filePath?: string
}

type CreatePipelinesValue = PipelineInfoConfigWithGitDetails & UseTemplate

export interface PipelineCreateProps {
  afterSave?: (
    values: PipelineInfoConfig,
    storeMetadata: StoreMetadata,
    gitDetails?: EntityGitDetails,
    useTemplate?: boolean
  ) => void
  initialValues?: CreatePipelinesValue
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
    storeType: StoreType.INLINE,
    stages: [],
    connectorRef: ''
  },
  closeModal,
  gitDetails
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { storeType: storeTypeParam = StoreType.INLINE } = useQueryParams<GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams()
  const { isGitSyncEnabled, gitSyncEnabledOnlyForFF, supportingGitSimplification } = useAppStore()
  const oldGitSyncEnabled = isGitSyncEnabled && !gitSyncEnabledOnlyForFF
  const { trackEvent } = useTelemetry()

  const newInitialValues = React.useMemo(() => {
    return produce(initialValues, draft => {
      if (draft.identifier === DefaultNewPipelineId) {
        draft.identifier = ''
      }
    })
  }, [initialValues])

  const getGitValidationSchema = () => {
    if (supportingGitSimplification && storeTypeParam === StoreType.REMOTE) {
      return gitSyncFormSchema(getString)
    } else if (oldGitSyncEnabled) {
      return {
        repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
        branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
      }
    } else {
      return {}
    }
  }

  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
        identifier: IdentifierSchema(),
        ...getGitValidationSchema()
      }),
    [getString, supportingGitSimplification, oldGitSyncEnabled, storeTypeParam]
  )

  const isEdit = React.useMemo(
    () =>
      supportingGitSimplification
        ? pipelineIdentifier !== DefaultNewPipelineId
        : initialValues.identifier !== DefaultNewPipelineId,
    [initialValues.identifier, supportingGitSimplification, pipelineIdentifier]
  )

  useEffect(() => {
    !isEdit &&
      trackEvent(PipelineActions.LoadCreateNewPipeline, {
        category: Category.PIPELINE
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  const handleSubmit = (values: CreatePipelinesValue): void => {
    logger.info(JSON.stringify(values))
    const formGitDetails =
      supportingGitSimplification && values.storeType === StoreType.REMOTE
        ? { repoName: values.repo, branch: values.branch, filePath: values.filePath }
        : values.repo && values.repo.trim().length > 0
        ? { repoIdentifier: values.repo, branch: values.branch }
        : undefined

    afterSave?.(
      omit(values, 'storeType', 'connectorRef', 'repo', 'branch', 'filePath', 'useTemplate'),
      {
        storeType: values.storeType as StoreMetadata['storeType'],
        connectorRef:
          typeof values.connectorRef !== 'string' ? (values.connectorRef as any)?.value : values.connectorRef
      },
      formGitDetails,
      values.useTemplate
    )
  }

  return (
    <Container className={css.pipelineCreateForm}>
      <Formik<CreatePipelinesValue>
        initialValues={newInitialValues}
        formName="pipelineCreate"
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <FormikForm>
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
              }}
              tooltipProps={{ dataTooltipId: 'pipelineCreate' }}
              inputGroupProps={{
                ...(!(errorCheck('name', formikProps) || get(formikProps, `errors.identifier`)) && {
                  className: css.zeroMargin
                })
              }}
            />
            {oldGitSyncEnabled && (
              <GitSyncStoreProvider>
                <GitContextForm formikProps={formikProps as any} gitDetails={gitDetails} />
              </GitSyncStoreProvider>
            )}

            {supportingGitSimplification ? (
              <>
                <Divider />
                <Text font={{ variation: FontVariation.H6 }} className={css.choosePipelineSetupHeader}>
                  {getString('pipeline.createPipeline.choosePipelineSetupHeader')}
                </Text>
                <InlineRemoteSelect
                  className={css.pipelineCardWrapper}
                  selected={storeTypeParam}
                  getCardDisabledStatus={(current, selected) =>
                    pipelineIdentifier !== DefaultNewPipelineId && current !== selected
                  }
                  onChange={item => {
                    if (pipelineIdentifier === DefaultNewPipelineId) {
                      formikProps?.setFieldValue('storeType', item.type)
                      updateQueryParams({ storeType: item.type })
                    }
                  }}
                />
              </>
            ) : null}
            {storeTypeParam === StoreType.REMOTE ? (
              <GitSyncForm
                formikProps={formikProps as any}
                isEdit={isEdit}
                initialValues={pick(newInitialValues, 'repo', 'branch', 'filePath', 'connectorRef')}
              />
            ) : null}

            {supportingGitSimplification ? (
              <Divider className={cx({ [css.gitSimplificationDivider]: storeTypeParam === StoreType.INLINE })} />
            ) : null}

            {!isEdit && (
              <Container padding={{ top: 'large' }}>
                <RbacButton
                  text={getString('common.templateStartLabel')}
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
                  featuresProps={{
                    featuresRequest: {
                      featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
                    }
                  }}
                />
              </Container>
            )}

            <Container className={css.createPipelineButtons}>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={isEdit ? getString('continue') : getString('start')}
                disabled={gitDetails?.remoteFetchFailed}
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
    </Container>
  )
}
