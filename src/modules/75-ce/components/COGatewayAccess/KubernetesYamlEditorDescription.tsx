import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

const KubernetesYamlEditorDescription: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ left: 'medium', right: 'medium' }}>
      <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.resourceDefinition')}</Text>
      <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.params.description')}</Text>
      <ul>
        <li>
          <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.params.host')}</Text>
        </li>
        <li>
          <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.params.name')}</Text>
        </li>
        <li>
          <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.params.port')}</Text>
        </li>
        <li>
          <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.params.learnMore')}</Text>
        </li>
      </ul>
      <Text>{getString('ce.co.autoStoppingRule.setupAccess.kubernetesDesc.validate')}</Text>
    </Layout.Vertical>
  )
}

export default KubernetesYamlEditorDescription
