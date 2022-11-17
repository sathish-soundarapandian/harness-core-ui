/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Text, Container } from '@harness/uicore'

import { OAuthProviderType, OAuthProviders, URLS } from '@common/constants/OAuthProviders'

import { useStrings } from 'framework/strings'
import css from './AuthFooter.module.scss'

export enum AuthPage {
  SignIn,
  SignUp
}

interface AuthFooterProps {
  page: AuthPage
}

const AuthFooter: React.FC<AuthFooterProps> = ({ page }) => {
  const { getString } = useStrings()
  return (
    <>
      <h2 className={css.lineMessage}>
        <span className={css.message}>
          {page === AuthPage.SignUp ? getString('signUp.oAuth.signup') : getString('signUp.oAuth.signin')}
        </span>
      </h2>

      <Container padding="large">
        <div className={css.oAuthIcons}>
          {OAuthProviders.map((oAuthProvider: OAuthProviderType) => {
            const { iconName, type, url } = oAuthProvider

            const link = `${URLS.OAUTH}api/users/${url}`

            return (
              <a className={css.iconContainer} key={type} href={link} rel="noreferrer" target="_blank">
                <Icon name={iconName} size={24} />
              </a>
            )
          })}
        </div>
        {page === AuthPage.SignUp ? (
          <div className={css.disclaimer}>
            {getString('signUp.disclaimer.initial')}
            <a className={css.externalLink} href={URLS.PRIVACY_AGREEMENT} rel="noreferrer" target="_blank">
              {getString('signUp.disclaimer.privacyPolicy')}
            </a>
            {getString('signUp.disclaimer.middle')}
            <a className={css.externalLink} href={URLS.SUBSCRIPTION_TERMS} rel="noreferrer" target="_blank">
              {getString('signUp.disclaimer.terms')}
            </a>
          </div>
        ) : (
          <button className={css.ssoButton}>
            <Text icon="cloud-sso" iconProps={{ className: css.icon, size: 24 }} className={css.text}>
              {getString('signUp.ssoButton')}
            </Text>
          </button>
        )}
      </Container>
    </>
  )
}

export default AuthFooter
