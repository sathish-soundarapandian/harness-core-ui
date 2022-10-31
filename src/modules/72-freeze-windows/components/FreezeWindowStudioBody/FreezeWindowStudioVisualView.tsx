/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Icon, Tab, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ResourcesInterface, FreezeObj, ValidationErrorType } from '@freeze-windows/types'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { FreezeStudioOverviewSectionWithRef } from '../FreezeWindowStudioOverview/FreezeStudioOverviewSection'
import { FreezeStudioConfigSectionWithRef } from '../FreezeWindowStudioConfigSection/FreezeStudioConfigSection'
import { FreezeWindowScheduleSection } from '../FreezeWindowScheduleSection/FreezeWindowScheduleSection'
import css from './FreezeWindowStudioBody.module.scss'

enum FreezeWindowTabs {
  OVERVIEW = 'OVERVIEW',
  FREEZE_CONFIG = 'FREEZE_CONFIG',
  SCHEDULE = 'SCHEDULE'
}

export const FreezeWindowStudioVisualView = ({ resources }: { resources: ResourcesInterface }) => {
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<{ sectionId?: string | null }>()
  const { sectionId } = useQueryParams<{ sectionId?: string | null }>()
  const { isReadOnly, isActiveFreeze } = React.useContext(FreezeWindowContext)
  const formikRef = React.useRef<FormikProps<FreezeObj>>()
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrorType>({})

  React.useEffect(() => {
    if (!sectionId) {
      updateQueryParams({ sectionId: FreezeWindowTabs.OVERVIEW })
    }
  }, [])

  const setSelectedTabId = async (tabId: FreezeWindowTabs) => {
    const formik = formikRef && formikRef.current
    if (formik) {
      const formErrors = await formik.validateForm(formik.values)
      if (!isEmpty(formErrors)) {
        setValidationErrors(formErrors as ValidationErrorType)
        return
      } else {
        setValidationErrors({})
      }
    }
    updateQueryParams({ sectionId: tabId })
  }

  return (
    <section className={css.stepTabs}>
      <Tabs
        id="freezeWindowStudio"
        onChange={(tabId: FreezeWindowTabs) => {
          setSelectedTabId(tabId)
        }}
        selectedTabId={sectionId as FreezeWindowTabs}
        data-tabId={sectionId}
      >
        <Tab
          id={FreezeWindowTabs.OVERVIEW}
          panel={
            <FreezeStudioOverviewSectionWithRef
              isReadOnly={isReadOnly || isActiveFreeze}
              onNext={() => setSelectedTabId(FreezeWindowTabs.FREEZE_CONFIG)}
              ref={formikRef}
            />
          }
          title={
            <span>
              <Icon name="tick" height={20} size={20} className={css.tabIcon} />
              {getString('overview')}
            </span>
          }
        />
        <Tab
          id={FreezeWindowTabs.FREEZE_CONFIG}
          panel={
            <FreezeStudioConfigSectionWithRef
              onBack={() => setSelectedTabId(FreezeWindowTabs.OVERVIEW)}
              onNext={() => setSelectedTabId(FreezeWindowTabs.SCHEDULE)}
              resources={resources}
              ref={formikRef}
              validationErrors={validationErrors}
              isReadOnly={isReadOnly || isActiveFreeze}
            />
          }
          title={
            <span>
              <Icon name="services" height={20} size={20} className={css.tabIcon} />
              {getString('freezeWindows.freezeStudio.freezeConfiguration')}
            </span>
          }
        />
        <Tab
          id={FreezeWindowTabs.SCHEDULE}
          panel={
            <FreezeWindowScheduleSection
              onBack={() => setSelectedTabId(FreezeWindowTabs.FREEZE_CONFIG)}
              isReadOnly={isReadOnly || isActiveFreeze}
            />
          }
          title={
            <span>
              <Icon name="waiting" height={16} size={16} className={css.tabIcon} />
              {getString('common.schedule')}
            </span>
          }
        />
      </Tabs>
    </section>
  )
}
