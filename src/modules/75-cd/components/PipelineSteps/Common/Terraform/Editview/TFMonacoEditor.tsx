/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, Classes } from '@blueprintjs/core'
import { FormikProps, connect } from 'formik'
import { Button } from '@harness/uicore'

import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import css from './TFMonaco.module.scss'

export interface TFMonacoProps {
  formik: FormikProps<unknown>
  expressions?: string[]
  name: string
  title?: string
}

export function TFBackendConfigMonaco(props: TFMonacoProps): React.ReactElement {
  const [isFullScreen, setFullScreen] = React.useState(false)
  const { expressions = [] } = props
  const monaco = (
    <div className={css.monacoWrapper}>
      {isFullScreen ? null : (
        <Button
          className={css.expandBtn}
          icon="fullscreen"
          small
          onClick={() => setFullScreen(true)}
          iconProps={{ size: 10 }}
          type="button"
        />
      )}

      <MonacoTextField name={props.name} expressions={expressions} height={300} />
    </div>
  )
  return (
    <React.Fragment>
      {isFullScreen ? <div className={css.monacoWrapper} /> : monaco}
      <Dialog
        lazy
        isOpen={isFullScreen}
        isCloseButtonShown
        enforceFocus={false}
        canOutsideClickClose={false}
        onClose={() => setFullScreen(false)}
        title={props.title}
        className={css.monacoDialog}
      >
        <div className={Classes.DIALOG_BODY}>{monaco}</div>
      </Dialog>
    </React.Fragment>
  )
}

export const TFMonaco = connect<TFMonacoProps>(TFBackendConfigMonaco)
