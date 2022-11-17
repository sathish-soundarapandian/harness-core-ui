/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'

export type Providers = 'AZURE' | 'BITBUCKET' | 'GITHUB' | 'GITLAB' | 'GOOGLE' | 'LINKEDIN'

export interface OAuthProviderType {
  type: Providers
  name: string
  url: string
  iconName: IconName
  color?: Color
}

export const OAuthProviders: OAuthProviderType[] = [
  { type: 'GITHUB', name: 'Github', url: 'oauth2Redirect?provider=github', iconName: 'github', color: Color.BLACK },
  { type: 'BITBUCKET', name: 'Bitbucket', url: 'oauth2Redirect?provider=bitbucket', iconName: 'bitbucket-blue' },
  { type: 'GITLAB', name: 'GitLab', url: 'oauth2Redirect?provider=gitlab', iconName: 'service-gotlab' },
  { type: 'LINKEDIN', name: 'LinkedIn', url: 'oauth2Redirect?provider=linkedin', iconName: 'linkedin' },
  { type: 'GOOGLE', name: 'Google', url: 'oauth2Redirect?provider=google', iconName: 'google' },
  { type: 'AZURE', name: 'Azure', url: 'oauth2Redirect?provider=azure', iconName: 'service-azure' }
]

export const URLS = {
  OAUTH: 'https://app.harness.io/gateway/',
  FREE_TRIAL: 'https://harness.io/thanks-freetrial-p/',
  PRIVACY_AGREEMENT: 'https://harness.io/privacy/',
  SUBSCRIPTION_TERMS: 'https://harness.io/subscriptionterms/'
}
