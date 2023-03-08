/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { get } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonSize, ButtonVariation, Icon, ModalDialog, Text } from '@harness/uicore'
import type { Error, Failure } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import css from '../ValidationBadge.module.scss'

interface ValidationErrorModalProps {
  isOpen: boolean
  error: GetDataError<Failure | Error> | null
  onClose: () => void
  onRevalidate: () => Promise<void>
}

export function ValidationErrorModal({ isOpen, onClose, onRevalidate, error }: ValidationErrorModalProps): JSX.Element {
  const { getString } = useStrings()
  const errorMessage = get(error, 'data.message') ?? get(error, 'message') ?? ''

  return (
    <ModalDialog
      isOpen={isOpen}
      enforceFocus={false}
      width={700}
      onClose={onClose}
      title={getString('error')}
      className={css.validationErrorModal}
    >
      <div className={css.container}>
        <Icon name="warning-sign" size={32} color={Color.RED_700} margin={{ bottom: 'medium' }} />
        <Text lineClamp={2} font={{ variation: FontVariation.H6 }} color={Color.ORANGE_700}>
          {getString('pipeline.validation.validationResultApiError', { message: errorMessage })}
        </Text>
        <div>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK} inline>
            {getString('common.suggestionsLabel')}
          </Text>
          &nbsp;
          <Button
            className={css.retryLink}
            onClick={onRevalidate}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            text={getString('retry')}
          />
          &nbsp;
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK} inline>
            {getString('or')}
          </Text>
          &nbsp;
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK} inline>
            {getString('common.checkYourNetwork')}
          </Text>
        </div>
      </div>
    </ModalDialog>
  )
}
