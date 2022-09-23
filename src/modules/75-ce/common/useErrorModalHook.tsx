/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container, Text } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { ServiceError } from 'services/lw'
import { useStrings } from 'framework/strings'
import type { ServiceWarning } from '@ce/types'
import css from './useErrorModalHook.module.scss'

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 750,
    minHeight: 350,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface UserErrorModalReturn {
  openErrorModal: (_error: ServiceError[], _warning?: ServiceWarning[]) => void
  hideErrorModal?: () => void
}

interface UseErrorModalHookProps {
  errorSummary?: string
  warningSummary?: string
}

const useErrorModalHook = (props: UseErrorModalHookProps): UserErrorModalReturn => {
  const [errors, setErrors] = useState<ServiceError[]>()
  const [warnings, setWarnings] = useState<ServiceError[]>()

  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          <Text font={{ size: 'medium' }} color={Color.BLACK}>
            {getString('details')}
          </Text>
          {!isEmpty(errors) && (
            <Container padding={{ top: 'large' }}>
              <Text
                icon={'error'}
                iconProps={{ color: Color.RED_500, size: 14 }}
                color={Color.GREY_900}
                lineClamp={1}
                font={{ variation: FontVariation.SMALL_SEMI }}
                margin={{ top: 'small', bottom: 'small' }}
              >
                {props?.errorSummary}
              </Text>
              <div className={css.errorMsg}>
                <pre>{JSON.stringify({ errors }, null, ' ')}</pre>
              </div>
            </Container>
          )}
          {!isEmpty(warnings) && (
            <Container padding={{ top: 'large' }}>
              <Text
                icon={'warning-sign'}
                iconProps={{ color: Color.YELLOW_500, size: 14 }}
                color={Color.GREY_900}
                lineClamp={1}
                font={{ variation: FontVariation.SMALL_SEMI }}
                margin={{ top: 'small', bottom: 'small' }}
              >
                {props?.warningSummary}
              </Text>
              <div className={css.warningMsg}>
                <pre>{JSON.stringify({ warnings }, null, ' ')}</pre>
              </div>
            </Container>
          )}
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            // props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [errors, warnings]
  )

  return {
    openErrorModal: (_error: ServiceError[], _warning?: ServiceWarning[]) => {
      setErrors(_error)
      if (!isEmpty(_warning)) {
        setWarnings(_warning)
      }
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useErrorModalHook
