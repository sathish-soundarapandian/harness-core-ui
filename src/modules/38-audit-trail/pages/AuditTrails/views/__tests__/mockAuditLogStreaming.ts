import type {
  StreamingDestinationAggregateListResponseResponse,
  StreamingDestinationCards,
  StreamingDestinationSpecDto
} from '@harnessio/react-audit-service-client'

export const mockAggregateListResponse: StreamingDestinationAggregateListResponseResponse = [
  {
    connector_info: {
      identifier: 'awsConn',
      name: 'conn name 1'
    },
    streaming_destination: {
      identifier: 'idWithNoRelationToName',
      name: 'theFourth',
      status: 'INACTIVE',
      connector_ref: 'account.myAwsConnector',
      spec: {
        type: 'AWS_S3',
        bucket: 'bucketStopsHere'
      } as StreamingDestinationSpecDto,
      tags: {}
    },
    streaming_details: {
      last_streamed_at: 1674997516641,
      error_message: 'message 1',
      status: 'FAILED'
    }
  },
  {
    connector_info: {
      identifier: 'awsConn',
      name: 'conn name 2'
    },
    streaming_destination: {
      identifier: 'sd3',
      name: 'sd3',
      status: 'ACTIVE',
      connector_ref: 'account.myAwsConnector',
      spec: {
        type: 'AWS_S3'
        // bucket: 's3Bucket'
      },
      tags: {}
    },
    streaming_details: {
      last_streamed_at: 1674996788302,
      error_message: `Error: Could not find active connector. The 
      connector myAwsConnector, Google cloud storage was not found. Please reconnect the connector and try to resync. It will send the data that couldn’t be sent before once again but, 
      remember to fix the error before resyncing.`,
      status: 'FAILED'
    }
  },
  {
    connector_info: {
      identifier: 'awsConn',
      name: 'conn name 3'
    },
    streaming_destination: {
      identifier: 'streaming_destination_one',
      name: 'streaming destination one',
      status: 'ACTIVE',
      connector_ref: 'account.Audit_Connector',
      spec: {
        type: 'AWS_S3'
        // bucket: 'test-nishant-audit-streaming-pr'
      },
      // description: null,
      tags: {}
    },
    streaming_details: {
      last_streamed_at: 1674994756802,
      status: 'SUCCESS'
    }
  },
  {
    connector_info: {
      identifier: 'awsConn4',
      name: 'conn name 4'
    },
    streaming_destination: {
      identifier: 'streaming_destination_two',
      name: 'streaming destination two',
      status: 'ACTIVE',
      connector_ref: 'account.Audit_Connector2',
      spec: {
        type: 'AWS_S3'
        // bucket: 'test-nishant-audit-streaming-pr'
      },
      // description: null,
      tags: {}
    }
  }
]

export const mockStreamingDestinationCards: StreamingDestinationCards = {
  countByStatusCard: [
    {
      status: 'ACTIVE',
      count: 1
    },
    {
      status: 'INACTIVE',
      count: 1
    }
  ],
  lastStreamedCard: {
    lastStreamedAt: 1674994532956
  },
  failureInfoCard: {
    count: 1
  }
}

export const mockResponseCreateOrUpdateStreamingDestination = {
  streaming_destination: {
    identifier: 'testing_sample1',
    name: 'testing sample1',
    status: 'ACTIVE',
    connector_ref: 'account.abc',
    spec: { type: 'AWS_S3', bucket: 'test12345' },
    description: null,
    tags: {}
  },
  created: 1675759534964,
  updated: 1675792444128,
  status_updated: 1675792444122
}
