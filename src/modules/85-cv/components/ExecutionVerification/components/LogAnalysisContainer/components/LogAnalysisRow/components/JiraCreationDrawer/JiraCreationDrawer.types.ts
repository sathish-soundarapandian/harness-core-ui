interface IdentifierType {
  key: string
  value: Record<string, string>
}

export interface JiraFormType {
  projectKey: string
  title: string
  description: string
  issueType: string
  identifiers?: Array<IdentifierType>
  priority?: string
}
