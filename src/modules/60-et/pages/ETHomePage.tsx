/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'

const ETHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('et.title')}
      bgImageUrl={'undefined'}
      projectCreateSuccessHandler={noop} // CET-1024: notice empty function as placeholder
      subTitle={getString('et.homepage.slogan')}
      documentText={getString('et.homepage.learnMore')}
      documentURL="https://developer.harness.io/docs/category/error-tracking"
    />
  )
}

export default ETHomePage
