export const inputSetOutput = {
  name: 'Is2',
  identifier: 'Is2',
  orgIdentifier: 'default',
  projectIdentifier: 'defaultproject',
  pipeline: {
    identifier: 'vikrant_test',
    stages: [
      {
        stage: {
          identifier: 's1',
          type: 'Custom',
          variables: [
            {
              name: 'stringVar2',
              type: 'String',
              default: 'Test1',
              value: 'Test1'
            }
          ]
        }
      }
    ]
  }
}

export const inputSetInput = {
  name: 'Is2',
  identifier: 'Is2',
  orgIdentifier: 'default',
  projectIdentifier: 'defaultproject',
  pipeline: {
    identifier: 'vikrant_test',
    stages: [
      {
        stage: {
          identifier: 's1',
          type: 'Custom',
          variables: [
            {
              name: 'stringVar2',
              type: 'String',
              default: 'Test1',
              value: '<+input>'
            }
          ]
        }
      }
    ]
  }
}
