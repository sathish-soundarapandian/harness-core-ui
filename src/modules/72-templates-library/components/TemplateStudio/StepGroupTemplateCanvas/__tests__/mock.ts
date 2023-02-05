export const StepMock = {
  step: {
    type: 'ShellScript',
    name: 'step1',
    identifier: 'step1',
    spec: {
      shell: 'Bash',
      onDelegate: true,
      source: {
        type: 'Inline',
        spec: {
          script: 'echo "hello1"'
        }
      },
      environmentVariables: [],
      outputVariables: []
    },
    timeout: '10m'
  }
}
