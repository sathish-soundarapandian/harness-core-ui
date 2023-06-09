/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
