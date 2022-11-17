import React from 'react'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import css from './PreferencesCard.module.scss'

export const PreferencesCard = () => {
  const { preference: recentProjects = [] } = usePreferenceStore<SavedProjectDetails[]>(
    PreferenceScope.USER,
    'recentProjects'
  )
  return <div className={css.container}>{recentProjects.map(project => project.projectIdentifier)}</div>
}

export default PreferencesCard
