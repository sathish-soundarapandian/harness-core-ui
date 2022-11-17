/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isObject } from 'lodash-es'
import { Text, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import { TitleWithToolTipId } from './TitleWithToolTipId'
import css from './ScopedTitle.module.scss'

interface TitleProps {
  title: string | Record<Scope, string>
  overrideScope?: ScopedObjectDTO
  toolTipId?: string
}

interface TitleInfo {
  name?: string
  label: string
  title: string
}

const ScopedTitle: React.FC<TitleProps> = ({ title, overrideScope, toolTipId }) => {
  const { selectedProject, selectedOrg } = useAppStore()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const getScopedTitle = (): TitleInfo => {
    const scope = getScopeFromDTO(overrideScope || { accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    switch (scope) {
      case Scope.PROJECT:
        return {
          name: selectedProject?.name,
          label: getString('projectLabel'),
          title: isObject(title) ? title[Scope.PROJECT] : title
        }
      case Scope.ORG:
        return {
          name: selectedOrg?.name,
          label: getString('orgLabel'),
          title: isObject(title) ? title[Scope.ORG] : title
        }
      default:
        return {
          label: getString('account'),
          title: isObject(title) ? title[Scope.ACCOUNT] : title
        }
    }
  }

  const titleInfo = getScopedTitle()
  return (
    <Layout.Horizontal>
      {titleInfo.name && (
        <Text font={{ variation: FontVariation.H4 }} className={css.horizontal}>
          {`[`}
          <Text lineClamp={1} font={{ variation: FontVariation.H4 }} className={css.name}>
            {titleInfo.name}
          </Text>
          {`]`}
          &nbsp;
        </Text>
      )}
      <TitleWithToolTipId title={`${titleInfo.label} ${titleInfo.title}`} toolTipId={toolTipId} />
    </Layout.Horizontal>
  )
}

export default ScopedTitle
