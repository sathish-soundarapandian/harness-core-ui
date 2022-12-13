/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const awsRegionsData = {
  metaData: {},
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1',
      valueType: null
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1',
      valueType: null
    },
    {
      name: 'US East (N. Virginia)',
      value: 'us-east-1',
      valueType: null
    },
    {
      name: 'US East (Ohio)',
      value: 'us-east-2',
      valueType: null
    },
    {
      name: 'US West (N. California)',
      value: 'us-west-1',
      valueType: null
    },
    {
      name: 'US West (Oregon)',
      value: 'us-west-2',
      valueType: null
    }
  ],
  responseMessages: []
}

export const bucketListData = {
  status: 'SUCCESS',
  data: [
    {
      bucketName: 'tdp-tdp2-1rc6irugmilkh'
    },
    {
      bucketName: 'cdng-terraform-state'
    },
    {
      bucketName: 'prod-bucket-339'
    },
    {
      bucketName: 'tf-test-bkt-jul17'
    },
    {
      bucketName: 'openshift4x-2wn97-bootstrap'
    }
  ],
  metaData: null,
  correlationId: '631fb63d-b587-42fd-983f-9cbeba3df618'
}

export const filePathListData = {
  status: 'SUCCESS',
  data: [
    {
      buildDetails: { number: 'folderName/filePath1.yaml' }
    },
    {
      buildDetails: { number: 'folderName/filePath2.yaml' }
    },
    {
      buildDetails: { number: 'folderName/filePath3.yaml' }
    }
  ],
  metaData: null,
  correlationId: '631fb63d-b587-42fd-983f-9cbeba3df618'
}
