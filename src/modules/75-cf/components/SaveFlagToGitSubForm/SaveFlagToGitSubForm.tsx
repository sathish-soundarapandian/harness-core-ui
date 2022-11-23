/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Container, FormInput, Layout, Text, Icon, Heading } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './SaveFlagToGitSubForm.module.scss'

export interface SaveFlagToGitSubFormProps {
  title?: string
  subtitle?: string
  flagName?: string
  hideNameField?: boolean
}

const SaveFlagToGitSubForm = ({ title, subtitle, hideNameField }: SaveFlagToGitSubFormProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      {title && (
        <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge' }}>
          {title}
        </Heading>
      )}

      <Layout.Vertical spacing="small">
        {subtitle && (
          <Heading level={4} font={{ variation: FontVariation.H5 }}>
            {subtitle}
          </Heading>
        )}
        {!hideNameField && (
          <Container width="50%">
            <FormInput.InputWithIdentifier
              inputName="flagName"
              inputLabel={getString('name')}
              idName="flagIdentifier"
              isIdentifierEditable={false}
              inputGroupProps={{ disabled: true }}
            />
          </Container>
        )}

        <Container>
          <Heading level={4} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} color={Color.GREY_600}>
            {getString('common.gitSync.harnessFolderLabel')}
          </Heading>
          <Layout.Horizontal className={css.formRow} spacing="small">
            <FormInput.Text name="gitDetails.repoIdentifier" label={getString('common.git.selectRepoLabel')} disabled />
            <FormInput.Text
              name="gitDetails.rootFolder"
              label={getString('common.gitSync.harnessFolderLabel')}
              disabled
            />
          </Layout.Horizontal>
          <FormInput.Text name="gitDetails.filePath" label={getString('common.git.filePath')} disabled />
        </Container>
        <Container>
          <Heading level={4} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} color={Color.GREY_600}>
            {getString('common.gitSync.commitDetailsLabel')}
          </Heading>
          <FormInput.TextArea
            name="gitDetails.commitMsg"
            label={getString('common.git.commitMessage')}
            placeholder={getString('common.git.commitMessage')}
          />

          <Container flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Icon name="git-branch-existing" />
            <Text margin={{ left: 'small', right: 'small' }} inline>
              {getString('common.git.existingBranchCommitLabel')}:
            </Text>
            <FormInput.Text name="gitDetails.branch" disabled style={{ marginBottom: 0 }} />
          </Container>

          <Container padding={{ left: 'xlarge', top: 'small' }} data-testid="commit-details-section">
            <FormInput.CheckBox large name="autoCommit" label={getString('cf.gitSync.autoCommitLabel')} />
          </Container>
        </Container>
      </Layout.Vertical>
    </>
  )
}

export default SaveFlagToGitSubForm
