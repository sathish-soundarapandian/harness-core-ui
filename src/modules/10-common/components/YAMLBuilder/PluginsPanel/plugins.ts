/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

enum PluginKind {
  HARNESS = 'harness',
  BITRISE = 'bitrise',
  GITHUB_ACTIONS = 'github_action'
}

export interface PluginInterface {
  name: string
  description: string
  kind: PluginKind
  logo: string
  repo: string
  image: string | null
  uses: string
  inputs: unknown[]
}

export const Plugins: PluginInterface[] = [
  {
    name: 'Comment on GitHub Pull Request',
    description:
      'You can send a new or update an existing comment on [GitHub](https://github.com) Pull Request or Issue.\n\nTo setup a **GitHub personal access token** visit: https://github.com/settings/tokens\n',
    kind: PluginKind.BITRISE,
    logo: 'https://storage.googleapis.com/harness-plugins/logos/bitrise/comment-on-github-pull-request@0.11.0',
    repo: 'https://github.com/kvvzr/bitrise-step-comment-on-github-pull-request.git',
    image: null,
    uses: 'comment-on-github-pull-request@0.11.0',
    inputs: [
      {
        name: 'personal_access_token',
        description:
          'To setup a **GitHub personal access token** visit: https://github.com/settings/tokens\nAdd repo(Full control of private repositories) scope to the generated token, to allow to comment on GitHub Pull Request or Issue.\n',
        required: true,
        secret: true,
        default: null,
        allowed_values: null
      },
      {
        name: 'body',
        description: 'Text of the message to send.\n',
        required: true,
        secret: false,
        default: null,
        allowed_values: null
      },
      {
        name: 'repository_url',
        description: 'The URL for target GitHub Repository.\n',
        required: true,
        secret: false,
        default: '$GIT_REPOSITORY_URL',
        allowed_values: null
      },
      {
        name: 'issue_number',
        description: 'Number of GitHub Pull request or Issue.\n',
        required: true,
        secret: false,
        default: '$BITRISE_PULL_REQUEST',
        allowed_values: null
      },
      {
        name: 'api_base_url',
        description: 'The URL for GitHub or GitHub Enterprise API',
        required: true,
        secret: false,
        default: 'https://api.github.com',
        allowed_values: null
      },
      {
        name: 'update_comment_tag',
        description:
          "If set and a commment with the given tag exists, it updates the comment instead of posting a new one.\nIf no comment with the given tag exists, a new comment is posted.\n\nThe tag should be a unique string that will be added to end of the comment's content. The step automatically extends the tag to be enclosed in square brackets.\n",
        required: false,
        secret: false,
        default: null,
        allowed_values: null
      }
    ]
  },
  {
    name: 'Gitea Comment',
    description:
      'Use this plugin to update build status on Gitea Pull Request. This is useful when the complete team does not want to open drone dashboard for each build message.',
    kind: PluginKind.HARNESS,
    logo: 'https://storage.googleapis.com/harness-plugins/logos/harness/gitea-comment@latest',
    repo: 'https://github.com/DefinitelyADev/gitea-comment',
    image: null,
    uses: '',
    inputs: [
      {
        name: 'comment_title',
        description: 'the title of the comment',
        required: false,
        secret: false,
        default: null,
        allowed_values: null
      },
      {
        name: 'comment',
        description: 'the content of the comment (required if comment_from_file is not used)',
        required: false,
        secret: false,
        default: null,
        allowed_values: null
      },
      {
        name: 'comment_from_file',
        description: 'the file path to read from (required if comment is not used)',
        required: false,
        secret: false,
        default: null,
        allowed_values: null
      },
      {
        name: 'gitea_token',
        description: 'gitea server auth token',
        required: true,
        secret: true,
        default: null,
        allowed_values: null
      },
      {
        name: 'gitea_base_url',
        description: 'the url of the gitea installation',
        required: true,
        secret: false,
        default: null,
        allowed_values: null
      }
    ]
  }
]
