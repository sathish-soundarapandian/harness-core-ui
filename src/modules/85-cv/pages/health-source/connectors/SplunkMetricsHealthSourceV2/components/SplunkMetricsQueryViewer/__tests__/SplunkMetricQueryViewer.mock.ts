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
