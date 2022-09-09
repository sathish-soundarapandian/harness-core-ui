/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Checkbox, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { useStrings } from 'framework/strings'
import { OutOfSyncErrorStrip } from '@pipeline/components/InputSetErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import type { EntityGitDetails, InputSetErrorWrapper, InputSetSummaryResponse } from 'services/pipeline-ng'
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
  pipelineGitDetails?: EntityGitDetails
  refetch: () => Promise<void>
  hideInputSetButton?: boolean
  showReconcile: boolean
  onReconcile?: (identifier: string) => void
  reRunInputSetYaml?: string
}

export function MultipleInputSetList(props: MultipleInputSetListProps): JSX.Element {
  const {
    inputSet,
    onCheckBoxHandler,
    pipelineGitDetails,
    refetch,
    hideInputSetButton,
    showReconcile,
    onReconcile,
    reRunInputSetYaml
  } = props
  const { getString } = useStrings()

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
          {(isInputSetInvalid(inputSet) || showReconcile) && !reRunInputSetYaml && (
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
                pipelineGitDetails={pipelineGitDetails}
                onlyReconcileButton={true}
                refetch={refetch}
                hideInputSetButton={hideInputSetButton}
                isOverlayInputSet={inputSet.inputSetType === 'OVERLAY_INPUT_SET'}
                onReconcile={onReconcile}
              />
            </Container>
          )}
        </Layout.Horizontal>
        {inputSet.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={inputSet.gitDetails} /> : null}
      </Layout.Horizontal>
    </li>
  )
}
