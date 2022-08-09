/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormInput, Layout, MultiTypeInputType } from '@harness/uicore'
import { Form, FormikProps } from 'formik'
import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import DragnDropPaths from '@pipeline/components/ManifestSelection/DragnDropPaths'
import type { ManifestConfig } from 'services/cd-ng'
import { gitFetchTypeList, GitFetchTypes } from '../DeployProvisioningWizard/Constants'
import type { SelectArtifactInterface } from './SelectArtifact'

interface ProvideManifestProps {
  initialValues: ManifestConfig
  formikProps: FormikProps<SelectArtifactInterface>
}

const ProvideManifestRef = (props: ProvideManifestProps): React.ReactElement => {
  const { getString } = useStrings()
  const { formikProps } = props

  return (
    <Form>
      <Layout.Vertical width={320}>
        <div>
          <FormInput.Text
            name="identifier"
            label={getString('pipeline.manifestType.manifestIdentifier')}
            placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
          />
        </div>

        <div>
          <FormInput.Select
            name="gitFetchType"
            label={getString('pipeline.manifestType.gitFetchTypeLabel')}
            items={gitFetchTypeList}
          />
        </div>
        {formikProps.values?.gitFetchType === GitFetchTypes.Branch ? (
          <FormInput.Text
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            name="branch"
          />
        ) : (
          <FormInput.Text
            label={getString('pipeline.manifestType.commitId')}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            name="commitId"
          />
        )}
        <div>
          <DragnDropPaths
            formik={formikProps}
            expressions={[]}
            allowableTypes={[MultiTypeInputType.FIXED]}
            fieldPath="paths"
            pathLabel={getString('fileFolderPathText')}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
          />
        </div>
        <div>
          <DragnDropPaths
            formik={formikProps}
            fieldPath="valuesPaths"
            pathLabel={getString('pipeline.manifestType.valuesYamlPath')}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            expressions={[]}
            allowableTypes={[MultiTypeInputType.FIXED]}
            defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
          />
        </div>
      </Layout.Vertical>
    </Form>
  )
}

export const ProvideManifest = React.forwardRef(ProvideManifestRef)
