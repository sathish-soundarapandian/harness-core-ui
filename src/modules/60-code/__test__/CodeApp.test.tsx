/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render } from '@testing-library/react'
import {
  Repository,
  Repositories,
  Commits,
  Branches,
  FileEdit,
  Settings,
  PullRequests,
  PullRequest,
  Compare,
  Webhooks,
  WebhookNew,
  WebhookDetails,
  Tags
} from '../CodeApp'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  }),
  useRouteMatch: () => ({ params: { accountId: '1234', orgIdentifier: 'abc', projectIdentifier: 'xyz' } })
}))

jest.mock(
  'react',
  () => ({
    ...jest.requireActual('react'),
    Suspense: ({ children }: { children: JSX.Element }) => <div>{children}</div>
  }),
  { virtual: true }
)

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (id: string) => id
  })
}))

jest.mock(
  'code/App',
  () => ({
    default: ({ children }: { children: JSX.Element }) => <div>code/App {children}</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Repositories',
  () => ({
    default: () => <div>code/Repositories</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Repository',
  () => ({
    default: () => <div>code/Repository</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/FileEdit',
  () => ({
    default: () => <div>code/FileEdit</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Commits',
  () => ({
    default: () => <div>code/Commits</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Branches',
  () => ({
    default: () => <div>code/Branches</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Tags',
  () => ({
    default: () => <div>code/Tags</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/PullRequests',
  () => ({
    default: () => <div>code/PullRequests</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Compare',
  () => ({
    default: () => <div>code/Compare</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/PullRequest',
  () => ({
    default: () => <div>code/PullRequest</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Settings',
  () => ({
    default: () => <div>code/Settings</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/Webhooks',
  () => ({
    default: () => <div>code/Webhooks</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/WebhookNew',
  () => ({
    default: () => <div>code/WebhookNew</div>
  }),
  { virtual: true }
)

jest.mock(
  'code/WebhookDetails',
  () => ({
    default: () => <div>code/WebhookDetails</div>
  }),
  { virtual: true }
)

describe('CodeApp', () => {
  test('Exports should work properly', async () => {
    const { container } = render(
      <div>
        <Repository />
        <Repositories />
        <Commits />
        <Branches />
        <Tags />
        <FileEdit />
        <Settings />
        <PullRequests />
        <PullRequest />
        <Compare />
        <Webhooks />
        <WebhookNew />
        <WebhookDetails />
      </div>
    )

    expect(container).toMatchSnapshot()
  })
})
