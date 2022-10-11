/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { FreezeWindow } from 'services/cd-ng'
import { ScheduleFreezeForm } from '../ScheduleFreezeForm/ScheduleFreezeForm'

interface GlobalFreezeScheduleFormProps {
  onSave: (scheduledFreeze: FreezeWindow) => void
  onCancel?: () => void
  freezeWindow: FreezeWindow
}

export const GlobalFreezeScheduleForm: FC<GlobalFreezeScheduleFormProps> = ({ onSave, onCancel, freezeWindow }) => {
  const { getString } = useStrings()

  return (
    <ScheduleFreezeForm
      isGlobalFreezeForm
      freezeWindow={freezeWindow}
      onSubmit={onSave}
      formActions={
        <Layout.Horizontal spacing="small" margin={{ top: 'large' }}>
          <Button text={getString('save')} variation={ButtonVariation.PRIMARY} type="submit" />
          <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
        </Layout.Horizontal>
      }
    />
  )
}
