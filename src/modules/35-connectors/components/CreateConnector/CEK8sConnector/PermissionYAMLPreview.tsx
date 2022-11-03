/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'

interface PermissionYAMLPreviewProps {
  yamlContent?: string
}

const PermissionYAMLPreview = (props: PermissionYAMLPreviewProps) => {
  return (
    <div>
      <YAMLBuilder
        entityType="Service"
        height="400px"
        fileName={'ccm-k8s-connector.yaml'}
        existingYaml={props.yamlContent}
        yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
        isReadOnlyMode={true}
        isEditModeSupported={false}
        theme={'DARK'}
      />
    </div>
  )
}

export default PermissionYAMLPreview
