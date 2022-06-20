/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const splunkQueryPropsMock = {
  connectorIdentifier: 'splunk_trial',
  formikProps: {
    values: {
      identifier: 'splunk_metric',
      metricName: 'Splunk Metric',
      query: 'my test query',
      groupName: {
        label: 'G1',
        value: 'G1'
      },
      sli: false
    },
    errors: {},
    touched: {
      identifier: true,
      metricName: true
    },
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    initialValues: {
      identifier: 'splunk_metric',
      metricName: 'Splunk Metric',
      query: 'sdfsdf',
      groupName: {
        label: 'G1',
        value: 'G1'
      },
      sli: false
    },
    initialErrors: {},
    initialTouched: {},
    isValid: true,
    dirty: false,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: false,
    disabled: false,
    inline: false
  }
}
