/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import type { Project } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '../../RouteDefinitions'
import bgImageURL from './assets/CODELandingPage.svg'

const CODEHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (project) {
      history.push(
        routes.toCODERepositories({ space: [accountId, project.orgIdentifier, project.identifier].join('/') })
      )
    }
  }

  return (
    <HomePageTemplate
      title={getString('common.purpose.code.name')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('code.homepageHeading')}
      documentText={getString('code.learnMore')}
    />
  )
}

export default CODEHomePage
