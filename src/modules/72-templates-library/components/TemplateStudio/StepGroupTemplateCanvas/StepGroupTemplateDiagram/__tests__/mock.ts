export enum StepType {
  STEP = 'STEP',
  STEP_GROUP = 'STEP_GROUP',
  SERVICE = 'SERVICE',
  SERVICE_GROUP = 'SERVICE_GROUP'
}
export interface StepState {
  stepType: StepType
  isRollback?: boolean
  isStepGroupRollback?: boolean
  isStepGroupCollapsed?: boolean
  isStepGroup?: boolean
  isSaved: boolean
  inheritedSG?: number
}

export const StepGroupEventMock = {
  entity: {
    data: {
      entityType: 'create-new',
      identifier: '2e50dc65-c1e5-49bb-bda7-fb67d10e04ec'
    },
    entityType: 'create-new',
    identifier: '2e50dc65-c1e5-49bb-bda7-fb67d10e04ec',
    type: 'addLinkClicked'
  },
  isLinkedTemplate: false,
  isParallel: false,
  isRollback: false,
  isTemplate: false,
  stepsMap: new Map<string, StepState>()
}

export const EditEventMock = {
  node: {
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
  },
  isStepGroup: false,
  stepsMap: {},
  addOrEdit: 'edit',
  stepType: 'STEP'
}
