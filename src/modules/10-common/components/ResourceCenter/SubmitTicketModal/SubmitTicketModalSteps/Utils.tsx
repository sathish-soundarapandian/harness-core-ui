export const getComponentsFromModule = (module: string): Array<{ label: string; value: string }> => {
  switch (module) {
    case 'cd':
      return [
        { label: 'Azure Web App', value: 'Azure Web App' },
        { label: 'ECS', value: 'ECS' },
        { label: 'EC2/AMI', value: 'EC2/AMI' },
        { label: 'GCP', value: 'GCP' },
        { label: 'GitOps', value: 'GitOps' },
        { label: 'Kubernetes/Helm', value: 'Kubernetes/Helm' },
        { label: 'Other', value: 'Other' },
        { label: 'Serverless', value: 'Serverless' },
        { label: 'Tanzu/PCF', value: 'Tanzu/PCF' },
        { label: 'WinRM/SSH', value: 'WinRM/SSH' }
      ]
    case 'ci':
      return [
        { label: 'Artifact upload', value: 'Artifact upload' },
        { label: 'Build', value: 'Build' },
        { label: 'Plugins', value: 'Plugins' },
        { label: 'Queue Intelligence', value: 'Queue Intelligence' },
        { label: 'Tests and test autoamtion', value: 'Tests and test autoamtion' },
        { label: 'Test intelligence', value: 'Test intelligence' }
      ]
    case 'ce':
      return [
        { label: 'Autostopping', value: 'Autostopping' },
        { label: 'Build', value: 'Build' },
        { label: 'Cost Governence', value: 'Cost Governence' },
        { label: 'Cost Optimization', value: 'Cost Optimization' },
        { label: 'Dashboard', value: 'Dashboard' }
      ]
    case 'sto':
      return [
        { label: 'Pipeline', value: 'Pipeline' },
        { label: 'Plugins and engines', value: 'Plugins and engines' },
        { label: 'Scan results and rules', value: 'Scan results and rules' }
      ]
    case 'chaos':
      return [
        { label: 'Experiment', value: 'Experiment' },
        { label: 'Hub', value: 'Hub' },
        { label: 'Infrastracture', value: 'Infrastracture' },
        { label: 'Probes', value: 'Probes' }
      ]
    case 'cf':
      return [
        { label: 'Integration and pipeline', value: 'Integration and pipeline' },
        { label: 'Relay Proxy', value: 'Relay Proxy' },
        { label: 'SDK', value: 'SDK' }
      ]
    case 'platform':
      return [
        { label: 'API', value: 'API' },
        { label: 'Authentication/SSO', value: 'Authentication/SSO' },
        { label: 'Connector', value: 'Connector' },
        { label: 'Delegate', value: 'Delegate' },
        { label: 'Git Experience', value: 'Git Experience' },
        { label: 'Policy as code (OPA)', value: 'Policy as code (OPA)' },
        { label: 'RBAC', value: 'RBAC' },
        { label: 'Secrets and secret engines', value: 'Secrets and secret engines' },
        { label: 'Security', value: 'Security' },
        { label: 'Triggers', value: 'Triggers' },
        { label: 'Templates', value: 'Templates' }
      ]
    default:
      return [{ label: 'Miscellaneous', value: 'Miscellaneous' }]
  }
}

export enum IssueType {
  QUESTION = 'QUESTION',
  PROBLEM = 'PROBLEM',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  OTHER = 'OTHER'
}

export enum PriorityType {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface SubmitTicket {
  subject: string
  issueType: IssueType
  priority: PriorityType
  ticketDetails: string
  module: string
  component: string
  fileData: any
}

export const issueTypes = [
  { label: 'Problem', value: IssueType.PROBLEM },
  { label: 'Question', value: IssueType.QUESTION },
  { label: 'Feature Request', value: IssueType.FEATURE_REQUEST },
  { label: 'Others', value: IssueType.OTHER }
]

export const priorityItems = [
  { label: 'Urgent', value: PriorityType.URGENT },
  { label: 'High', value: PriorityType.HIGH },
  { label: 'Normal', value: PriorityType.NORMAL },
  { label: 'Low', value: PriorityType.LOW }
]

//source :- https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
export function getBrowserName(userAgent: string): string {
  // The order matters here, and this may report false positives for unlisted browsers.

  if (userAgent.includes('Firefox')) {
    return 'Mozilla Firefox'
  } else if (userAgent.includes('SamsungBrowser')) {
    return 'Samsung Internet'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera'
  } else if (userAgent.includes('Edge')) {
    return 'Microsoft Edge (Legacy)'
  } else if (userAgent.includes('Edg')) {
    return 'Microsoft Edge (Chromium)'
  } else if (userAgent.includes('Chrome')) {
    return 'Google Chrome or Chromium'
  } else if (userAgent.includes('Safari')) {
    return 'Apple Safari'
  } else {
    return 'unknown'
  }
}
export function getOsVersion(): string {
  const os = navigator.userAgent
  let finalOs = ''
  if (os.search('Windows') !== -1) {
    finalOs = 'Windows'
  } else if (os.search('Mac') !== -1) {
    finalOs = 'MacOS'
  } else if (os.search('X11') !== -1 && !(os.search('Linux') !== -1)) {
    finalOs = 'UNIX'
  } else if (os.search('Linux') !== -1 && os.search('X11') !== -1) {
    finalOs = 'Linux'
  }
  return finalOs
}
