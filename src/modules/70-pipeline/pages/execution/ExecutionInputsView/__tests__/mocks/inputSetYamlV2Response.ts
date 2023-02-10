/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const inputSetYamlResponse = {
  inputSetTemplateYaml:
    'pipeline:\n  identifier: "PL_Cleanup_POC"\n  variables:\n  - name: "Delegate"\n    type: "String"\n    value: "<+input>.allowedValues(pie-play-acc,pl-play-acc,ci-play-accnt,cd-play-acc,ff-play-acc,sto-play-acc,spg-play-acc,scm-play-acc,del-play-acc,gitops-play-acc,ccm-play-acc,chi-play-acc,bt-play-accnt,smp-play-acc,hce-play-acc,plg-play-acc,idp-play-acc,et-play-acc,ssca-play-acc,product-mngt-play-acc)"\n',
  inputSetYaml:
    'pipeline:\n  identifier: "PL_Cleanup_POC"\n  variables:\n  - name: "Delegate"\n    type: "String"\n    value: "chi-play-acc"\n',
  latestTemplateYaml:
    'pipeline:\n  identifier: "PL_Cleanup_POC"\n  variables:\n  - name: "Delegate"\n    type: "String"\n    value: "<+input>.allowedValues(pie-play-acc,pl-play-acc,ci-play-accnt,cd-play-acc,ff-play-acc,sto-play-acc,spg-play-acc,scm-play-acc,del-play-acc,gitops-play-acc,ccm-play-acc,chi-play-acc,bt-play-accnt,smp-play-acc,hce-play-acc,plg-play-acc,idp-play-acc,et-play-acc,ssca-play-acc,product-mngt-play-acc)"\n'
}
