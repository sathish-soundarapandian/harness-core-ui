/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StringUtils } from '@common/exports'
import {
  createRequestBodyPayload,
  renderItemByType,
  getOptionsForMultiSelect,
  ConnectorStatCategories,
  validateForm,
  createOption
} from '../RequestUtils'
import mockMetadata from './mocks/stats-mocks.json'

describe('Request utils test', () => {
  test('Test createRequestBodyPayload method', () => {
    const request = createRequestBodyPayload({
      isUpdate: false,
      data: {
        formValues: {
          connectivityStatuses: [{ label: 'SUCCESS', value: 'SUCCESS' }],
          types: [{ label: 'K8sCluster', value: 'K8sCluster' }]
        },
        metadata: { name: 'Sample', filterVisibility: 'OnlyCreator', identifier: 'Sample' }
      },
      projectIdentifier: '',
      orgIdentifier: ''
    })
    expect(request.identifier).toBe(StringUtils.getIdentifierFromName(request.name))
  })

  test('Test renderItemByType method', () => {
    expect(renderItemByType({ name: 'Sample', key: 'SampleKey' })).toBe('name : Sample, key : SampleKey')
    expect(renderItemByType('Sample')).toBe('Sample')
    expect(renderItemByType(['Sample', 'Key'])).toBe('Sample, Key')
    expect(renderItemByType(1)).toBe('1')
    expect(renderItemByType(true)).toBe('true')
  })

  test('Test getOptionsForMultiSelect', () => {
    expect(getOptionsForMultiSelect(ConnectorStatCategories.TYPE, mockMetadata as any).length).toBe(
      mockMetadata?.data?.typeStats.length
    )
    expect(getOptionsForMultiSelect(ConnectorStatCategories.STATUS, mockMetadata as any).length).toBe(
      mockMetadata?.data?.statusStats.length
    )
  })

  test('Test validateForm method', () => {
    const { typeErrors, connectivityStatusErrors } = validateForm(
      {
        types: [createOption('Bitbucket', 10), createOption('Git', 20)],
        connectivityStatuses: [createOption('FAILURE', 1), createOption('SUCCESS', 2)],
        filterType: 'Connector'
      },
      ['sample', 'values'],
      ['test', 'data'],
      mockMetadata as any
    )
    expect(typeErrors.size).toBe(2)
    expect(connectivityStatusErrors.size).toBe(2)
  })
})
