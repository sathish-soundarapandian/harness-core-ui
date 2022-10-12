/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Card, Container, Heading, ButtonVariation, Button, Layout, Color } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { FreezeWindow } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { WindowPathProps } from '@freeze-windows/types'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { ScheduleFreezeForm } from '../ScheduleFreezeForm/ScheduleFreezeForm'
import { useFreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { useSaveFreeze } from './useSaveFreeze'
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
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<WindowPathProps>()
  const { onSave, isSaveDisabled, isSaveInProgress } = useSaveFreeze()
  const validate = useCallback((formData: any) => {
    updateFreeze({ ...freezeObj, windows: [formData] })
  }, [])

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('freezeWindows.freezeStudio.freezeSchedule')}
      </Heading>
      <Card className={css.sectionCard}>
        <ScheduleFreezeForm
          freezeWindow={(freezeObj?.windows as FreezeWindow[])?.[0]}
          onSubmit={onSave}
          onChange={validate}
          formActions={
            <Layout.Horizontal
              spacing="small"
              margin={{ top: 'xxlarge' }}
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Button
                icon="chevron-left"
                onClick={onBack}
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
              />
              <RbacButton
                type="submit"
                disabled={isSaveDisabled}
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                icon="send-data"
                loading={isSaveInProgress}
                permission={{
                  permission: PermissionIdentifier.MANAGE_DEPLOYMENT_FREEZE,
                  resource: {
                    resourceType: ResourceType.DEPLOYMENTFREEZE
                  },
                  resourceScope: {
                    accountIdentifier,
                    orgIdentifier,
                    projectIdentifier
                  }
                }}
              />
            </Layout.Horizontal>
          }
        />
      </Card>
    </Container>
  )
}
