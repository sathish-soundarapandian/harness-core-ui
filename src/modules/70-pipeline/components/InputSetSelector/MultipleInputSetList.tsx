/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, pick } from 'lodash-es'
import cx from 'classnames'
import { Checkbox, Container, Icon, Layout, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { clearNullUndefined, isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { useStrings } from 'framework/strings'
import {
  EntityGitDetails,
  InputSetErrorWrapper,
  InputSetSummaryResponse,
  ResponsePMSPipelineResponseDTO,
  useUpdateInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline
} from 'services/pipeline-ng'
import { OutOfSyncErrorStrip } from '@pipeline/components/InputSetErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import type { InputSetDTO } from '@pipeline/utils/types'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getIconByType } from './utils'
import { InputSetGitDetails } from './InputSetGitDetails'
import css from './InputSetSelector.module.scss'

interface MultipleInputSetListProps {
  inputSet: InputSetSummaryResponse
  onCheckBoxHandler: (
    checked: boolean,
    label: string,
    val: string,
    type: InputSetSummaryResponse['inputSetType'],
    inputSetGitDetails: EntityGitDetails | null,
    inputSetErrorDetails?: InputSetErrorWrapper,
    overlaySetErrorDetails?: { [key: string]: string }
  ) => void
  pipeline?: ResponsePMSPipelineResponseDTO | null
  refetch: () => Promise<void>
  hideInpSetBtn?: boolean
  showReconcile: boolean
}

export function MultipleInputSetList(props: MultipleInputSetListProps): JSX.Element {
  const { inputSet, onCheckBoxHandler, pipeline, refetch, hideInpSetBtn, showReconcile } = props
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateOverlayInputSet, loading: updateOverlayInputSetLoading } = useUpdateOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const inputSetUpdateHandler = async (tempInputSet: InputSetDTO): Promise<void> => {
    if (tempInputSet.identifier) {
      try {
        const gitParams = tempInputSet?.gitDetails?.objectId
          ? {
              ...pick(tempInputSet?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
              lastObjectId: tempInputSet?.gitDetails?.objectId,
              pipelineRepoID: repoIdentifier,
              pipelineBranch: branch
            }
          : {}
        const response = await updateInputSet(yamlStringify({ inputSet: clearNullUndefined(tempInputSet) }), {
          pathParams: {
            inputSetIdentifier: tempInputSet.identifier
          },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier,
            ...gitParams
          }
        })
        if (response?.data) {
          refetch?.()
        }
      } catch (error) {
        showError(getRBACErrorMessage(error), undefined, 'pipeline.refresh.all.error')
      }
    } else {
      throw new Error(getString('common.validation.identifierIsRequired'))
    }
  }

  const overlayInputSetUpdateHandler = async (tempInputSet: InputSetDTO): Promise<void> => {
    if (tempInputSet.identifier) {
      try {
        const gitParams = tempInputSet?.gitDetails?.objectId // Update for Remote Case
          ? {
              ...pick(tempInputSet?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
              lastObjectId: tempInputSet?.gitDetails?.objectId,
              repoIdentifier,
              branch
            }
          : {}
        const response = await updateOverlayInputSet(
          yamlStringify({ overlayInputSet: clearNullUndefined(tempInputSet) }) as unknown as void,
          {
            pathParams: {
              inputSetIdentifier: tempInputSet.identifier
            },
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              ...gitParams
            }
          }
        )
        if (response) {
          if (response.data?.errorResponse) {
            showError(getString('inputSets.overlayInputSetSavedError'), undefined, 'pipeline.overlayinputset.error')
          } else {
            refetch?.()
          }
        }
      } catch (error) {
        showError(getRBACErrorMessage(error), undefined, 'pipeline.refresh.all.error')
      }
    } else {
      throw new Error(getString('common.validation.identifierIsRequired'))
    }
  }

  return (
    <li
      className={cx(css.item)}
      onClick={() => {
        if (isInputSetInvalid(inputSet) || showReconcile) {
          return
        }
        onCheckBoxHandler(
          true,
          defaultTo(inputSet.name, ''),
          defaultTo(inputSet.identifier, ''),
          defaultTo(inputSet.inputSetType, 'INPUT_SET'),
          defaultTo(inputSet.gitDetails, null),
          inputSet.inputSetErrorDetails,
          inputSet.overlaySetErrorDetails
        )
      }}
    >
      <Layout.Horizontal flex={{ distribution: 'space-between' }}>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Checkbox
            className={css.checkbox}
            disabled={isInputSetInvalid(inputSet) || showReconcile}
            labelElement={
              <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }}>
                <Icon name={getIconByType(inputSet.inputSetType)}></Icon>
                <Container margin={{ left: true }} className={css.nameIdContainer}>
                  <Text
                    data-testid={`popover-${inputSet.name}`}
                    lineClamp={1}
                    font={{ weight: 'bold' }}
                    color={Color.GREY_800}
                  >
                    {inputSet.name}
                  </Text>
                  <Text font="small" lineClamp={1} margin={{ top: 'xsmall' }} color={Color.GREY_450}>
                    {getString('idLabel', { id: inputSet.identifier })}
                  </Text>
                </Container>
              </Layout.Horizontal>
            }
          />
          {(isInputSetInvalid(inputSet) || showReconcile) && (
            <Container padding={{ left: 'large' }} className={css.invalidEntity}>
              <Badge
                text={'common.invalid'}
                iconName="error-outline"
                showTooltip={false}
                entityName={inputSet.name}
                entityType={inputSet.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
                uuidToErrorResponseMap={inputSet.inputSetErrorDetails?.uuidToErrorResponseMap}
                overlaySetErrorDetails={inputSet.overlaySetErrorDetails}
              />
              <OutOfSyncErrorStrip
                inputSet={inputSet}
                pipeline={pipeline}
                inputSetUpdateHandler={
                  inputSet.inputSetType === 'INPUT_SET' ? inputSetUpdateHandler : overlayInputSetUpdateHandler
                }
                updateLoading={updateInputSetLoading || updateOverlayInputSetLoading}
                onlyReconcileButton={true}
                refetch={refetch}
                hideInpSetBtn={hideInpSetBtn}
                isOverlayInputSet={inputSet.inputSetType === 'OVERLAY_INPUT_SET'}
              />
            </Container>
          )}
        </Layout.Horizontal>
        {inputSet.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={inputSet.gitDetails} /> : null}
      </Layout.Horizontal>
    </li>
  )
}
