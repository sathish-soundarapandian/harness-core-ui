/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Card, Container, Heading, ButtonVariation, Button, Layout, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { FreezeWindow } from 'services/cd-ng'
import { SaveFreezeButton } from './SaveFreezeButton'
import { useFreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { ScheduleFreezeForm } from '../ScheduleFreezeForm/ScheduleFreezeForm'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioOverviewSectionProps {
  isReadOnly: boolean
  onBack: () => void
}

export const FreezeWindowScheduleSection: React.FC<FreezeStudioOverviewSectionProps> = ({ onBack }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = useFreezeWindowContext()

  const validate = useCallback((formData: any) => updateFreeze({ ...freezeObj, window: formData }), [])

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('freezeWindows.freezeStudio.freezeSchedule')}
      </Heading>
      <Card className={css.sectionCard}>
        <ScheduleFreezeForm freezeWindow={freezeObj.window as FreezeWindow} onChange={validate} />
      </Card>

      <Layout.Horizontal
        spacing="small"
        margin={{ top: 'xxlarge' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Button
          margin={{ top: 'medium' }}
          icon="chevron-left"
          onClick={onBack}
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
        />
        <div className={css.scheduleTabSaveBtnContainer}>
          <SaveFreezeButton />
        </div>
      </Layout.Horizontal>
    </Container>
  )
}
