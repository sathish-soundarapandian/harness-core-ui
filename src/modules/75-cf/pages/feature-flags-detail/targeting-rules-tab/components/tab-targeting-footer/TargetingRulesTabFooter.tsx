/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout } from '@harness/uicore'
import type { ReactElement } from 'react';
import React from 'react'
import { useStrings } from 'framework/strings'
import css from './TargetingRulesTabFooter.module.scss'

export interface TargetingRulesTabFooterProps {
  isLoading: boolean
  handleSubmit: () => void
  handleCancel: () => void
}

const TargetingRulesTabFooter = (props: TargetingRulesTabFooterProps): ReactElement => {
  const { isLoading, handleSubmit, handleCancel } = props
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      data-testid="targeting-rules-footer"
      padding="medium"
      spacing="small"
      className={css.actionButtons}
    >
      {isLoading && (
        <Button
          type="submit"
          data-testid="save-loading-button"
          text={getString('save')}
          loading
          variation={ButtonVariation.PRIMARY}
        />
      )}

      {!isLoading && (
        <Button
          type="submit"
          text={getString('save')}
          variation={ButtonVariation.PRIMARY}
          onClick={e => {
            e.preventDefault()
            handleSubmit()
          }}
        />
      )}

      <Button
        variation={ButtonVariation.TERTIARY}
        text={getString('cancel')}
        disabled={isLoading}
        onClick={e => {
          e.preventDefault()
          handleCancel()
        }}
      />
    </Layout.Horizontal>
  )
}

export default TargetingRulesTabFooter
