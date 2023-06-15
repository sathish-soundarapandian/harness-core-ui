import type { GetDataError } from 'restful-react'
import type { Error, Failure } from 'services/pipeline-ng'

export const triggerActivityHistoryList = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '6486a528ed02dd7906c072c0',
        payload:
          '{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","ref":"refs/heads/newBranchYiWfI0ooeK","checkout_sha":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[],"total_commits_count":0,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686545704709,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: 'MRhKMvFoR5ykglKxe56-FA',
          runSequence: 2068,
          executionStatus: 'RUNNING',
          startTs: 1686545709968
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '6486a4f4ed02dd7906c07145',
        payload:
          '{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","ref":"refs/heads/newBranchMQ8HAHaRFB","checkout_sha":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[],"total_commits_count":0,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686545652720,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: 'nd1ipb55TJqBmX-wedi7Bg',
          runSequence: 2067,
          executionStatus: 'RUNNING',
          startTs: 1686545655583
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '6486a3b5ed02dd7906c067f3',
        payload: '{"sample_key": "sample_value}',
        eventCreatedAt: 1686545333868,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: null,
          runSequence: null,
          executionStatus: 'RUNNING',
          startTs: 1686545335052
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '6486a27fed02dd7906c05c55',
        payload:
          '{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","ref":"refs/heads/newBranchBV3yUbtnsI","checkout_sha":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[],"total_commits_count":0,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686545023242,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: 'vGOzo1o8TdOpciOui_R7GQ',
          runSequence: 2065,
          executionStatus: 'RUNNING',
          startTs: 1686545025059
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '6481683aed02dd790697cc7b',
        payload:
          '{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","ref":"refs/heads/newBranchAqBB3ryk2n","checkout_sha":"2180ca2dc18f7c2eca125ee0bfadcde7d40a85c9","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[],"total_commits_count":0,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686202426100,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: '397XzPaPQ5aZEoLFAiAqMQ',
          runSequence: 2064,
          executionStatus: 'RUNNING',
          startTs: 1686202429933
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '64808d0ae061ae28dbaa6c50',
        payload:
          '{"object_kind":"push","event_name":"push","before":"adaadfc238735f418171ce39cba277a879ab6dee","after":"f583e413c3c3a509903b7ccb640efe8392cf06a8","ref":"refs/heads/newBranchpfMSyy78iy","checkout_sha":"f583e413c3c3a509903b7ccb640efe8392cf06a8","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[{"id":"f583e413c3c3a509903b7ccb640efe8392cf06a8","message":"some commit message","title":"some commit message","timestamp":"2023-06-07T13:58:33+00:00","url":"https://gitlab.com/autouser1/triggerautomation/-/commit/f583e413c3c3a509903b7ccb640efe8392cf06a8","author":{"name":"triggerAutomation","email":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5@noreply.gitlab.com"},"added":[],"modified":["foo/bar"],"removed":[]}],"total_commits_count":1,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686146314587,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: '2nOn7pyLTtqg3xevsHrpzA',
          runSequence: 1996,
          executionStatus: 'RUNNING',
          startTs: 1686146315760
        },
        type: 'Webhook'
      },
      {
        accountId: 'rXUXvbFqRr2XwcjBu3Oq-Q',
        eventCorrelationId: '64808d07e061ae28dbaa6c34',
        payload:
          '{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"adaadfc238735f418171ce39cba277a879ab6dee","ref":"refs/heads/newBranchpfMSyy78iy","checkout_sha":"adaadfc238735f418171ce39cba277a879ab6dee","message":null,"user_id":14016541,"user_name":"triggerAutomation","user_username":"project_44398478_bot_3ed79999ed1c2272aa5412d21e0ba9e5","user_email":null,"user_avatar":"https://secure.gravatar.com/avatar/367b057acf73962cf0a77add3967190f?s=80&d=identicon","project_id":44398478,"project":{"id":44398478,"name":"TriggerAutomation","description":null,"web_url":"https://gitlab.com/autouser1/triggerautomation","avatar_url":null,"git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","namespace":"Auto User1","visibility_level":0,"path_with_namespace":"autouser1/triggerautomation","default_branch":"main","ci_config_path":"","homepage":"https://gitlab.com/autouser1/triggerautomation","url":"git@gitlab.com:autouser1/triggerautomation.git","ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","http_url":"https://gitlab.com/autouser1/triggerautomation.git"},"commits":[],"total_commits_count":0,"push_options":{},"repository":{"name":"TriggerAutomation","url":"git@gitlab.com:autouser1/triggerautomation.git","description":null,"homepage":"https://gitlab.com/autouser1/triggerautomation","git_http_url":"https://gitlab.com/autouser1/triggerautomation.git","git_ssh_url":"git@gitlab.com:autouser1/triggerautomation.git","visibility_level":0}}',
        eventCreatedAt: 1686146311033,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        triggerIdentifier: 'dhhdhdh',
        orgIdentifier: 'default',
        projectIdentifier: 'testmeet',
        targetIdentifier: 'djhsuhd',
        targetExecutionSummary: {
          triggerId: 'dhhdhdh',
          targetId: 'djhsuhd',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: 'OCB8w3bwT6iLw2JRSg-d8g',
          runSequence: 1995,
          executionStatus: 'RUNNING',
          startTs: 1686146315705
        },
        type: 'Webhook'
      }
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageNumber: 0,
      pageSize: 100,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: false,
    totalElements: 7,
    totalPages: 1,
    first: true,
    number: 0,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    numberOfElements: 100,
    size: 100,
    empty: false
  },
  metaData: null,
  correlationId: 'e04c3422-bbd3-4266-ad2b-1f9f5d1d8474'
}

export const errorLoadingList: GetDataError<Failure | Error> = {
  message: 'Failed to fetch: 404 Not Found',
  data: {
    status: 'ERROR',
    code: 'DEFAULT_ERROR_CODE',
    message: 'Failed to fetch',
    correlationId: 'correlationId',
    responseMessages: [
      {
        code: 'DEFAULT_ERROR_CODE',
        level: 'ERROR',
        message: 'Failed to fetch',
        failureTypes: []
      }
    ]
  },
  status: 404
}
