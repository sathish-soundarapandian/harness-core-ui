export const dashboardsAPI =
  '/cv/api/stackdriver/dashboards?routingId=accountId&accountId=accountId&projectIdentifier=project1&orgIdentifier=default&connectorIdentifier=gcpqatarget&pageSize=7&offset=0&tracingId=*'

export const dashboardsResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 7,
    content: [
      {
        name: 'TestDashboard',
        path: 'projects/145904791365/dashboards/59a9ca97-65f5-45ef-a270-da71e3b6704c'
      },
      {
        name: 'Watcher Logs',
        path: 'projects/145904791365/dashboards/7f53f35a-0e3d-4e53-95c8-d745b08ea920'
      },
      {
        name: 'New Dashboard - Jun 25, 2021 4:47 PM',
        path: 'projects/145904791365/dashboards/c81a0234-46c6-4fb3-a0f9-fc5182b11bbf'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'f2d12fcf-cddc-4ac6-b8b6-85569d8ec6c3'
}

export const metricPackAPI =
  '/cv/api/metric-pack?routingId=accountId&projectIdentifier=project1&orgIdentifier=default&accountId=accountId&dataSourceType=STACKDRIVER'

export const metricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: 'TqJJf6ehQJqJ8E0jrDghAg',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'my_project_x',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [
        {
          name: 'Errors',
          type: 'ERROR',
          path: null,
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    },
    {
      uuid: '-yTHTBt5QbKJ5WDcXY3GrA',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'my_project_x',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Infrastructure',
      category: 'Infrastructure',
      metrics: [
        {
          name: 'Infrastructure',
          type: 'INFRA',
          path: null,
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    },
    {
      uuid: 'VK6UxtZbS1uZOXCzrlb3rQ',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'my_project_x',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Throughput',
          type: 'THROUGHPUT',
          path: null,
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Response Time',
          type: 'RESP_TIME',
          path: null,
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Other',
          type: 'ERROR',
          path: null,
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

export const sampleDataAPI =
  '/cv/api/stackdriver/sample-data?routingId=accountId&orgIdentifier=default&projectIdentifier=project1&accountId=accountId&tracingId=*&connectorIdentifier=gcpqatarget'

export const sampleDataResponse = {
  metaData: {},
  data: [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    }
  ]
}

export const logIndexAPI =
  'cv/api/elk/indices?routingId=accountId&projectIdentifier=project1&orgIdentifier=default&accountId=accountId&connectorIdentifier=elasticSearchApi&tracingId=*'

export const logApiData = {
  status: 'SUCCESS',
  data: [
    'filebeat-6.8.8-2022.09.28',
    'filebeat-6.8.8-2022.10.12',
    'filebeat-6.8.8-2022.10.14',
    'integration-test',
    '.kibana',
    'integration-test1',
    'filebeat-6.8.8-2022.08.28',
    'filebeat-6.8.8-2022.10.06',
    'filebeat-6.8.8-2022.09.14'
  ],
  correlationId: '5fe0d823-a25f-4fa4-9101-3076a6048f97'
}

export const timeStampApi = '/cv/api/health/time-format?routingId=accountId'
export const timeStampData = {
  status: 'SUCCESS',
  data: [
    'MMM dd HH:mm:ss',
    'yy-MM-dd HH:mm:ss',
    'yy/MM/dd HH:mm:ss',
    'yyMMdd HH:mm:ss',
    'yyyyMMdd HH:mm:ss.SSS',
    'HH:mm:ss',
    'HH:mm:ss.SSS',
    'HH:mm:ss,SSS',
    'dd/MMM HH:mm:ss,SSS',
    'dd/MMM/yyyy:HH:mm:ss',
    'dd-MMM-yyyy HH:mm:ss',
    'dd-MMM-yyyy HH:mm:ss.SSS',
    'dd MMM yyyy HH:mm:ss',
    'dd MMM yyyy HH:mm:ss*SSS',
    'MMdd_HH:mm:ss'
  ],
  correlationId: '096e7004-8dc7-4ea3-9ace-a8986ab4eafb'
}

export const logSampleDataAPI =
  '/cv/api/stackdriver-log/sample-data?routingId=accountId&accountId=accountId&projectIdentifier=project1&orgIdentifier=default&tracingId=*&connectorIdentifier=gcpqatarget'

export const elkSampleDataAPI =
  '/cv/api/elk/sample-data?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1&connectorIdentifier=elasticSearchApi&tracingId=*&index=integration-test'

export const logSampleDataResponse = {
  status: 'SUCCESS',
  data: [
    {
      logName: 'projects/qa-target/logs/kubelet',
      resource: {
        type: 'k8s_node',
        labels: {
          cluster_name: 'qa-stress-target',
          project_id: 'qa-target',
          node_name: 'gke-qa-stress-target-pool-1-b86f8feb-2j93',
          location: 'us-central1-a'
        }
      },
      jsonPayload: {
        _SYSTEMD_INVOCATION_ID: '28252fe1733b4773a1668e477138383f',
        _PID: '3991',
        _CAP_EFFECTIVE: '3fffffffff',
        PRIORITY: '6',
        _SYSTEMD_CGROUP: '/system.slice/kubelet.service',
        _GID: '0',
        _MACHINE_ID: '54903c026f58df3bf3fa175e7b9d7a15',
        MESSAGE:
          'E0211 07:49:20.886822    3991 kuberuntime_manager.go:835] container &Container{Name:harness-example-datadog-dummy,Image:index.docker.io/harness/todolist:latest,Command:[],Args:[],WorkingDir:,Ports:[]ContainerPort{},Env:[]EnvVar{},Resources:ResourceRequirements{Limits:ResourceList{cpu: {{1 0} {<nil>} 1 DecimalSI},memory: {{1610612736 0} {<nil>}  BinarySI},},Requests:ResourceList{cpu: {{1 0} {<nil>} 1 DecimalSI},memory: {{1610612736 0} {<nil>}  BinarySI},},},VolumeMounts:[]VolumeMount{VolumeMount{Name:default-token-kgc7j,ReadOnly:true,MountPath:/var/run/secrets/kubernetes.io/serviceaccount,SubPath:,MountPropagation:nil,SubPathExpr:,},},LivenessProbe:nil,ReadinessProbe:nil,Lifecycle:nil,TerminationMessagePath:/dev/termination-log,ImagePullPolicy:Always,SecurityContext:nil,Stdin:false,StdinOnce:false,TTY:false,EnvFrom:[]EnvFromSource{EnvFromSource{Prefix:,ConfigMapRef:&ConfigMapEnvSource{LocalObjectReference:LocalObjectReference{Name:harness-example-datadog-dummy-config-37,},Optional:nil,},SecretRef:nil,},},TerminationMessagePolicy:File,VolumeDevices:[]VolumeDevice{},StartupProbe:nil,} start failed in pod harness-example-datadog-dummy-deployment-956bbb4cd-d8khh_default(2e83daf4-4a06-40a7-b2f6-def959a39cf3): CreateContainerConfigError: configmap "harness-example-datadog-dummy-config-37" not found',
        _COMM: 'kubelet',
        _STREAM_ID: '53223c6535ff41d3bd5e97c588e49d08',
        _BOOT_ID: 'eb17b72682be4b60b0adbc9a533247d6',
        _TRANSPORT: 'stdout',
        _SYSTEMD_UNIT: 'kubelet.service',
        _CMDLINE:
          '/home/kubernetes/bin/kubelet --v=2 --experimental-check-node-capabilities-before-mount=true --cloud-provider=gce --experimental-mounter-path=/home/kubernetes/containerized_mounter/mounter --cert-dir=/var/lib/kubelet/pki/ --cni-bin-dir=/home/kubernetes/bin --kubeconfig=/var/lib/kubelet/kubeconfig --image-pull-progress-deadline=5m --max-pods=110 --non-masquerade-cidr=0.0.0.0/0 --network-plugin=kubenet --volume-plugin-dir=/home/kubernetes/flexvolume --bootstrap-kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig --node-status-max-images=25 --registry-qps=10 --registry-burst=20 --config /home/kubernetes/kubelet-config.yaml --pod-sysctls=net.core.somaxconn=1024,net.ipv4.conf.all.accept_redirects=0,net.ipv4.conf.all.forwarding=1,net.ipv4.conf.all.route_localnet=1,net.ipv4.conf.default.forwarding=1,net.ipv4.ip_forward=1,net.ipv4.tcp_fin_timeout=60,net.ipv4.tcp_keepalive_intvl=60,net.ipv4.tcp_keepalive_probes=5,net.ipv4.tcp_keepalive_time=300,net.ipv4.tcp_rmem=4096 87380 6291456,net.ipv4.tcp_syn_retries=6,net.ipv4.tcp_tw_reuse=0,net.ipv4.tcp_wmem=4096 16384 4194304,net.ipv4.udp_rmem_min=4096,net.ipv4.udp_wmem_min=4096,net.ipv6.conf.all.disable_ipv6=1,net.ipv6.conf.default.accept_ra=0,net.ipv6.conf.default.disable_ipv6=1,net.netfilter.nf_conntrack_generic_timeout=600,net.netfilter.nf_conntrack_tcp_be_liberal=1,net.netfilter.nf_conntrack_tcp_timeout_close_wait=3600,net.netfilter.nf_conntrack_tcp_timeout_established=86400',
        SYSLOG_IDENTIFIER: 'kubelet',
        _SYSTEMD_SLICE: 'system.slice',
        SYSLOG_FACILITY: '3',
        _UID: '0',
        _HOSTNAME: 'gke-qa-stress-target-pool-1-b86f8feb-2j93',
        _EXE: '/home/kubernetes/bin/kubelet'
      },
      receiveTimestamp: '2022-02-11T07:49:23.032535268Z',
      insertId: '1zjrfsr76zr382z4',
      timestamp: '2022-02-11T07:49:20.886869Z'
    },
    {
      logName: 'projects/qa-target/logs/kubelet',
      resource: {
        type: 'k8s_node',
        labels: {
          cluster_name: 'qa-stress-target',
          project_id: 'qa-target',
          node_name: 'gke-qa-stress-target-pool-1-b86f8feb-tsvz',
          location: 'us-central1-a'
        }
      },
      jsonPayload: {
        _PID: '4008',
        _SYSTEMD_INVOCATION_ID: 'ec49ae7898af4d1eabc113333f73b372',
        _CAP_EFFECTIVE: '3fffffffff',
        PRIORITY: '6',
        _SYSTEMD_CGROUP: '/system.slice/kubelet.service',
        _GID: '0',
        _MACHINE_ID: '0614b2582c03f1b94e850beaae6a8c3e',
        _COMM: 'kubelet',
        MESSAGE:
          'E0211 07:49:19.512153    4008 kuberuntime_manager.go:835] container &Container{Name:gcp-fbe9c439-d162-3f2a-92b3-86763257f683,Image:index.docker.io/library/nginx:1.21.3-perl,Command:[],Args:[],WorkingDir:,Ports:[]ContainerPort{},Env:[]EnvVar{},Resources:ResourceRequirements{Limits:ResourceList{},Requests:ResourceList{},},VolumeMounts:[]VolumeMount{VolumeMount{Name:default-token-8jlx4,ReadOnly:true,MountPath:/var/run/secrets/kubernetes.io/serviceaccount,SubPath:,MountPropagation:nil,SubPathExpr:,},},LivenessProbe:nil,ReadinessProbe:nil,Lifecycle:nil,TerminationMessagePath:/dev/termination-log,ImagePullPolicy:IfNotPresent,SecurityContext:nil,Stdin:false,StdinOnce:false,TTY:false,EnvFrom:[]EnvFromSource{EnvFromSource{Prefix:,ConfigMapRef:&ConfigMapEnvSource{LocalObjectReference:LocalObjectReference{Name:gcp-fbe9c439-d162-3f2a-92b3-86763257f683-8,},Optional:nil,},SecretRef:nil,},EnvFromSource{Prefix:,ConfigMapRef:nil,SecretRef:&SecretEnvSource{LocalObjectReference:LocalObjectReference{Name:gcp-fbe9c439-d162-3f2a-92b3-86763257f683-8,},Optional:nil,},},},TerminationMessagePolicy:File,VolumeDevices:[]VolumeDevice{},StartupProbe:nil,} start failed in pod gcp-fbe9c439-d162-3f2a-92b3-86763257f683-deployment-5bfbcdv92t8_harness(4226562d-dce4-4393-b2f1-bb4c424c6259): CreateContainerConfigError: configmap "gcp-fbe9c439-d162-3f2a-92b3-86763257f683-8" not found',
        _STREAM_ID: '6cf3247461194be2be4361cfc54d25b4',
        _BOOT_ID: '71692e657e3a4124b16b264f12814ddb',
        _TRANSPORT: 'stdout',
        _SYSTEMD_UNIT: 'kubelet.service',
        _CMDLINE:
          '/home/kubernetes/bin/kubelet --v=2 --experimental-check-node-capabilities-before-mount=true --cloud-provider=gce --experimental-mounter-path=/home/kubernetes/containerized_mounter/mounter --cert-dir=/var/lib/kubelet/pki/ --cni-bin-dir=/home/kubernetes/bin --kubeconfig=/var/lib/kubelet/kubeconfig --image-pull-progress-deadline=5m --max-pods=110 --non-masquerade-cidr=0.0.0.0/0 --network-plugin=kubenet --volume-plugin-dir=/home/kubernetes/flexvolume --bootstrap-kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig --node-status-max-images=25 --registry-qps=10 --registry-burst=20 --config /home/kubernetes/kubelet-config.yaml --pod-sysctls=net.core.somaxconn=1024,net.ipv4.conf.all.accept_redirects=0,net.ipv4.conf.all.forwarding=1,net.ipv4.conf.all.route_localnet=1,net.ipv4.conf.default.forwarding=1,net.ipv4.ip_forward=1,net.ipv4.tcp_fin_timeout=60,net.ipv4.tcp_keepalive_intvl=60,net.ipv4.tcp_keepalive_probes=5,net.ipv4.tcp_keepalive_time=300,net.ipv4.tcp_rmem=4096 87380 6291456,net.ipv4.tcp_syn_retries=6,net.ipv4.tcp_tw_reuse=0,net.ipv4.tcp_wmem=4096 16384 4194304,net.ipv4.udp_rmem_min=4096,net.ipv4.udp_wmem_min=4096,net.ipv6.conf.all.disable_ipv6=1,net.ipv6.conf.default.accept_ra=0,net.ipv6.conf.default.disable_ipv6=1,net.netfilter.nf_conntrack_generic_timeout=600,net.netfilter.nf_conntrack_tcp_be_liberal=1,net.netfilter.nf_conntrack_tcp_timeout_close_wait=3600,net.netfilter.nf_conntrack_tcp_timeout_established=86400',
        SYSLOG_IDENTIFIER: 'kubelet',
        _SYSTEMD_SLICE: 'system.slice',
        SYSLOG_FACILITY: '3',
        _UID: '0',
        _HOSTNAME: 'gke-qa-stress-target-pool-1-b86f8feb-tsvz',
        _EXE: '/home/kubernetes/bin/kubelet'
      },
      receiveTimestamp: '2022-02-11T07:49:22.490671446Z',
      insertId: 'doyog5gygf9v8zkw',
      timestamp: '2022-02-11T07:49:19.512194Z'
    },
    {
      severity: 'INFO',
      logName: 'projects/qa-target/logs/stdout',
      resource: {
        type: 'k8s_container',
        labels: {
          cluster_name: 'qa-target',
          container_name: 'harness-delegate-instance',
          project_id: 'qa-target',
          location: 'us-central1-c',
          pod_name: 'cdc-pre-qa-delegate-rxuxvb-1',
          namespace_name: 'pre-qa-automationfour-delegate'
        }
      },
      textPayload:
        '2022-02-11 07:49:18,460 \u001b[34m[1.0.10051-000]\u001b[0;39m \u001b[1;32m3141509\u001b[0;39m \u001b[32m[task-exec-26]\u001b[0;39m \u001b[34mINFO \u001b[0;39m \u001b[36mRestClient\u001b[0;39m - Rest Client Result: {"expand":"renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations,customfield_10602.requestTypePractice","id":"221680","self":"https://harness.atlassian.net/rest/api/latest/issue/221680","key":"TJI-97765","fields":{"customfield_10870":null,"resolution":null,"customfield_10872":null,"customfield_10630":null,"customfield_10751":{"self":"https://harness.atlassian.net/rest/api/2/customFieldOption/10556","value":"No ","id":"10556"},"customfield_10752":null,"customfield_10873":null,"customfield_10863":"1|hztqin:","customfield_10621":null,"customfield_10500":null,"customfield_10622":null,"customfield_10501":null,"customfield_10864":null,"customfield_10865":null,"customfield_10623":null,"customfield_10866":null,"customfield_10624":null,"customfield_10867":null,"customfield_10625":null,"customfield_10747":null,"customfield_10626":null,"customfield_10868":null,"customfield_10627":null,"customfield_10869":null,"customfield_10748":null,"customfield_10749":null,"lastViewed":null,"customfield_10860":null,"customfield_10861":null,"customfield_10862":null,"customfield_10620":null,"labels":["${test}"],"customfield_10852":null,"customfield_10610":null,"customfield_10731":null,"customfield_10853":null,"customfield_10611":null,"customfield_10732":null,"customfield_10612":"2021-07-26T22:00:00.000-0700","customfield_10733":null,"customfield_10854":null,"customfield_10855":null,"customfield_10734":null,"customfield_10613":null,"aggregatetimeoriginalestimate":0,"customfield_10735":null,"customfield_10856":null,"customfield_10614":null,"customfield_10736":null,"customfield_10857":null,"customfield_10615":null,"customfield_10737":null,"customfield_10616":null,"customfield_10858":null,"customfield_10738":null,"customfield_10617":null,"customfield_10859":null,"customfield_10618":null,"customfield_10619":null,"issuelinks":[],"assignee":{"self":"https://harness.atlassian.net/rest/api/2/user?accountId=5a34ab64e973bb380bdc4660","accountId":"5a34ab64e973bb380bdc4660","emailAddress":"rishi@harness.io","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/80470115156879d3669f5328dc65691e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FRS-6.png","24x24":"https://secure.gravatar.com/avatar/80470115156879d3669f5328dc65691e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FRS-6.png","16x16":"https://secure.gravatar.com/avatar/80470115156879d3669f5328dc65691e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FRS-6.png","32x32":"https://secure.gravatar.com/avatar/80470115156879d3669f5328dc65691e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FRS-6.png"},"displayName":"Rishi Singh","active":true,"timeZone":"America/Los_Angeles","accountType":"atlassian"},"components":[],"customfield_10850":null,"customfield_10851":null,"customfield_10730":"Customer Success, please add details.","customfield_10841":null,"customfield_10842":null,"customfield_10600":null,"customfield_10601":"2021-07-26","customfield_10843":null,"customfield_10602":null,"customfield_10844":null,"customfield_10603":[],"customfield_10845":null,"customfield_10846":null,"customfield_10604":null,"customfield_10847":null,"customfield_10605":null,"customfield_10606":null,"customfield_10727":null,"customfield_10728":null,"customfield_10607":null,"customfield_10729":null,"customfield_10608":null,"customfield_10609":null,"subtasks":[],"reporter":{"self":"https://harness.atlassian.net/rest/api/2/user?accountId=5c47fbc4d8bbb7445c0a358d","accountId":"5c47fbc4d8bbb7445c0a358d","emailAddress":"jirauser@harness.io","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","24x24":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","16x16":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","32x32":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png"},"displayName":"jira user","active":true,"timeZone":"America/Los_Angeles","accountType":"atlassian"},"customfield_10840":null,"customfield_10830":null,"customfield_10831":null,"customfield_10832":null,"customfield_10834":null,"customfield_10835":null,"customfield_10836":null,"customfield_10837":null,"customfield_10838":null,"customfield_10718":{"self":"https://harness.atlassian.net/rest/api/2/customFieldOption/10405","value":"No","id":"10405"},"progress":{"progress":0,"total":0},"customfield_10839":null,"votes":{"self":"https://harness.atlassian.net/rest/api/2/issue/TJI-97765/votes","votes":0,"hasVoted":false},"customfield_10719":"You can now create/remove/update/delete [...]. This will help you:\\r\\n- [use case 1]\\r\\n- [use case 2]\\r\\nHere\'s an example:\\r\\n[screen shot, video, gif]\\r\\nSee [doc link].\\r\\nThis might impact users who have [...].\\r\\nTips on writing Release Note summaries: https://harness.atlassian.net/wiki/spaces/DOCS/pages/1689845830/Release+Notes+Summary+Do+s+and+Don+ts","worklog":{"startAt":0,"maxResults":20,"total":0,"worklogs":[]},"issuetype":{"self":"https://harness.atlassian.net/rest/api/2/issuetype/10103","id":"10103","description":"A problem which impairs or prevents the functions of the product.","iconUrl":"https://harness.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10618?size=medium","name":"Bug","subtask":false,"avatarId":10618,"hierarchyLevel":0},"project":{"self":"https://harness.atlassian.net/rest/api/2/project/10204","id":"10204","key":"TJI","name":"Test - JIRA Integration","projectTypeKey":"software","simplified":false,"avatarUrls":{"48x48":"https://harness.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10324","24x24":"https://harness.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10324?size=small","16x16":"https://harness.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10324?size=xsmall","32x32":"https://harness.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10324?size=medium"}},"customfield_10820":null,"customfield_10821":null,"customfield_10822":null,"customfield_10823":null,"customfield_10824":null,"resolutiondate":null,"customfield_10825":null,"customfield_10826":null,"customfield_10827":null,"customfield_10828":null,"customfield_10829":null,"customfield_10709":null,"watches":{"self":"https://harness.atlassian.net/rest/api/2/issue/TJI-97765/watchers","watchCount":1,"isWatching":false},"customfield_10810":null,"customfield_10811":null,"customfield_10812":null,"customfield_10814":null,"customfield_10815":null,"customfield_10816":null,"customfield_10817":null,"customfield_10818":null,"customfield_10819":null,"updated":"2021-07-26T22:53:48.570-0700","timeoriginalestimate":0,"description":"${test}","timetracking":{"originalEstimate":"0m","remainingEstimate":"0m","originalEstimateSeconds":0,"remainingEstimateSeconds":0},"customfield_10006":null,"customfield_10007":{"hasEpicLinkFieldDependency":false,"showField":false,"nonEditableReason":{"reason":"EPIC_LINK_SHOULD_BE_USED","message":"To set an epic as the parent, use the epic link instead"}},"customfield_10801":null,"customfield_10802":null,"customfield_10803":null,"customfield_10804":null,"customfield_10805":null,"customfield_10807":null,"customfield_10808":null,"customfield_10809":null,"summary":"${test}","customfield_10000":"{}","customfield_10001":null,"customfield_10002":null,"environment":null,"duedate":null,"customfield_10914":null,"customfield_10915":null,"customfield_10916":null,"customfield_10917":null,"comment":{"comments":[],"self":"https://harness.atlassian.net/rest/api/2/issue/221680/comment","maxResults":0,"total":0,"startAt":0},"customfield_10918":null,"statuscategorychangedate":"2021-07-26T22:53:46.194-0700","customfield_10104":"0|i0z1l3:","customfield_10900":null,"customfield_10901":null,"customfield_10902":null,"customfield_10903":null,"customfield_10905":null,"customfield_10909":null,"customfield_10100":null,"priority":{"self":"https://harness.atlassian.net/rest/api/2/priority/2","iconUrl":"https://harness.atlassian.net/secure/viewavatar?size=xsmall&avatarId=10634&avatarType=issuetype","name":"P1","id":"2"},"customfield_10101":null,"customfield_10102":null,"customfield_10103":null,"timeestimate":0,"status":{"self":"https://harness.atlassian.net/rest/api/2/status/10000","description":"","iconUrl":"https://harness.atlassian.net/","name":"To Do","id":"10000","statusCategory":{"self":"https://harness.atlassian.net/rest/api/2/statuscategory/2","id":2,"key":"new","colorName":"blue-gray","name":"To Do"}},"customfield_10687":null,"customfield_10688":null,"customfield_10689":null,"aggregatetimeestimate":0,"creator":{"self":"https://harness.atlassian.net/rest/api/2/user?accountId=5c47fbc4d8bbb7445c0a358d","accountId":"5c47fbc4d8bbb7445c0a358d","emailAddress":"jirauser@harness.io","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","24x24":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","16x16":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png","32x32":"https://secure.gravatar.com/avatar/030edb77bf554d70eb86e9c32f3289aa?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJU-6.png"},"displayName":"jira user","active":true,"timeZone":"America/Los_Angeles","accountType":"atlassian"},"customfield_10680":null,"aggregateprogress":{"progress":0,"total":0},"customfield_10683":null,"customfield_10797":null,"customfield_10677":null,"customfield_10678":null,"customfield_10799":null,"customfield_10679":null,"timespent":null,"customfield_10790":null,"customfield_10670":null,"customfield_10791":null,"customfield_10792":null,"customfield_10671":null,"customfield_10793":null,"customfield_10672":null,"aggregatetimespent":null,"customfield_10673":null,"customfield_10794":null,"customfield_10674":null,"customfield_10675":null,"customfield_10302":"2021-07-27","customfield_10786":"5208h","customfield_10666":null,"customfield_10304":null,"customfield_10789":null,"customfield_10669":[{"self":"https://harness.atlassian.net/rest/api/2/customFieldOption/10514","value":"No ","id":"10514"}],"workratio":0,"issuerestriction":{"issuerestrictions":{},"shouldDisplay":false},"created":"2021-07-05T07:07:22.863-0700","customfield_10780":null,"customfield_10781":null,"customfield_10660":null,"customfield_10782":null,"customfield_10661":null,"customfield_10662":null,"customfield_10783":null,"customfield_10784":null,"customfield_10785":null,"customfield_10775":null,"customfield_10896":null,"customfield_10897":null,"customfield_10655":null,"customfield_10898":null,"customfield_10777":null,"customfield_10899":null,"customfield_10778":"h3. *Description (what):*\\r\\n\\r\\n{color:#707070}Explain the use-case/challenge that the customer is facing or trying to do. Focus on the scenario and not the feature/solution (try not to use any Harness terminology or model)\\r\\n(For example: \\"Customer would like to automatically start a deployment when CI build finish\\" vs. \\"customer need API/CLI to start CD pipeline\\"){color}\\r\\n\\r\\nh3. *Motivation (why):*\\r\\n\\r\\n{color:#707070}Explain why the customer needs this use case to be supported. It would be best if you articulated the full e2e use case that this requirement will be part of.\\r\\n(For example: \\"Customer would like to have full CI/CD automation with as little manual intervention as needed. This approach will help to push changes faster to production\\"){color}\\r\\n\\r\\nh3. *What does the customer do now?*\\r\\n\\r\\n{color:#707070}Explain what is the workaround customer is doing or current behavior \\r\\n(For example: \\"Customer get a notification that CI build finished and then kick off deployment in Harness manually\\"){color}\\r\\n\\r\\nh3. *Impact:*\\r\\n\\r\\nExplain what will happen if we will not deliver this feature- how adoption/perception of Harness will be affected. \\r\\n\\r\\nh3. *Provide links to the following resources:*\\r\\n\\r\\n{color:#707070}The functional gap here\\r\\nSFDC opp (if expansion/renewal is dependant on this request){color}\\r\\n\\r\\n{color:#707070}(For example: \\"The lack of this use-case supported, is preventing developers from using Harness as part of their development process as it slows releases to production. \\"){color}\\r\\n\\r\\n\\r\\nh3. *Suggest a solution (optional):*\\r\\n\\r\\n{color:#707070}If an optional solution was discussed with the customer, you could summarise it here.\\r\\n(For example: \\"Customer would prefer Harness to provide a secure API to kick off a deployment. the API will be called as a CI build finished){color}\\r\\n\\r\\nh3. *Adoption Timeline:*\\r\\n\\r\\n{color:#707070}Establishing a rough timeline for adoption, when a feature is picked up we the PM team have the sizing. We can possibly prepare the customer with a rough estimate so when we ship around that time we can ensure adoption of the feature and continue the momentum. {color}","customfield_10890":null,"customfield_10891":null,"customfield_10770":null,"customfield_10892":null,"customfield_10893":null,"customfield_10773":null,"customfield_10894":null,"customfield_10895":null,"customfield_10774":null,"customfield_10643":null,"customfield_10764":null,"customfield_10885":null,"customfield_10765":null,"customfield_10644":null,"customfield_10886":null,"security":null,"customfield_10887":null,"customfield_10646":null,"customfield_10888":null,"customfield_10647":null,"customfield_10768":null,"customfield_10889":null,"attachment":[],"customfield_10769":null,"customfield_10649":null,"customfield_10880":null,"customfield_10881":null,"customfield_10640":null,"customfield_10882":null,"customfield_10761":null,"customfield_10641":null,"customfield_10883":null,"customfield_10762":[{"self":"https://harness.atlassian.net/rest/api/2/customFieldOption/10599","value":"No","id":"10599"}],"customfield_10884":null,"customfield_10642":null,"customfield_10763":null,"customfield_10753":null,"customfield_10874":null,"customfield_10754":null,"customfield_10875":null,"customfield_10633":{"self":"https://harness.atlassian.net/rest/api/2/user?accountId=5e70ee6ce3a02f0c43eacc9d","accountId":"5e70ee6ce3a02f0c43eacc9d","emailAddress":"haribabu.padmanaban@harness.io","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/b2e683ebe95c066710d710bec9a9bb83?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FHP-3.png","24x24":"https://secure.gravatar.com/avatar/b2e683ebe95c066710d710bec9a9bb83?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FHP-3.png","16x16":"https://secure.gravatar.com/avatar/b2e683ebe95c066710d710bec9a9bb83?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FHP-3.png","32x32":"https://secure.gravatar.com/avatar/b2e683ebe95c066710d710bec9a9bb83?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FHP-3.png"},"displayName":"Haribabu Padmanaban","active":true,"timeZone":"America/Los_Angeles","accountType":"atlassian"},"customfield_10755":null,"customfield_10756":null,"customfield_10635":null,"customfield_10877":null,"customfield_10757":null,"customfield_10878":null,"customfield_10879":null,"customfield_10637":null,"customfield_10758":5.0,"customfield_10638":null,"customfield_10759":{"self":"https://harness.atlassian.net/rest/api/2/customFieldOption/10578","value":"No","id":"10578"}}} \u001b[33m[accountId=rXUXvbFqRr2XwcjBu3Oq-Q, taskId=KBU0nhXcQgeS5uhPCXfCPg]\u001b[0;39m \n',
      receiveTimestamp: '2022-02-11T07:49:20.668731948Z',
      insertId: '4g4nyvg9yge83vk1',
      timestamp: '2022-02-11T07:49:18.964145998Z',
      labels: {
        'k8s-pod/harness_io/name': 'cdc-pre-qa-delegate',
        'compute.googleapis.com/resource_name': 'gke-qa-target-qa-target-del-pool-c30fdabe-xggp',
        'k8s-pod/statefulset_kubernetes_io/pod-name': 'cdc-pre-qa-delegate-rxuxvb-1',
        'k8s-pod/harness_io/app': 'harness-delegate',
        'k8s-pod/harness_io/account': 'rxuxvb',
        'k8s-pod/controller-revision-hash': 'cdc-pre-qa-delegate-rxuxvb-8fff669c7'
      }
    },
    {
      severity: 'INFO',
      logName: 'projects/qa-target/logs/stdout',
      resource: {
        type: 'k8s_container',
        labels: {
          cluster_name: 'qa-target',
          container_name: 'delegate',
          project_id: 'qa-target',
          location: 'us-central1-c',
          namespace_name: 'harness-delegate-prod',
          pod_name: 'qa-target-cluster-wfhxhd-757ddf75f-rr4gj'
        }
      },
      textPayload:
        'ERROR [2022-02-11 07:49:18,061] io.harness.perpetualtask.artifact.ArtifactRepositoryServiceImpl: Exception in processing BuildSource task [{}]\n',
      receiveTimestamp: '2022-02-11T07:49:20.364479884Z',
      insertId: 'ymjjh0ai9xcojdbs',
      timestamp: '2022-02-11T07:49:18.061437320Z',
      labels: {
        'k8s-pod/harness_io/name': 'qa-target-cluster',
        'compute.googleapis.com/resource_name': 'gke-qa-target-qa-target-del-pool-c30fdabe-50jn',
        'k8s-pod/pod-template-hash': '757ddf75f'
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          '@type': 'k8s.io/Patch',
          subjects: [
            {
              kind: 'User',
              name: 'system:controller:glbc'
            }
          ]
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'rbac.authorization.k8s.io/v1/clusterrolebindings/system:controller:glbc',
            permission: 'io.k8s.authorization.rbac.v1.clusterrolebindings.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            uid: '9e3111b8-3cdf-42f9-a18a-861093e05f8b',
            resourceVersion: '527',
            creationTimestamp: '2020-04-07T21:02:19Z',
            name: 'system:controller:glbc',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1","kind":"ClusterRoleBinding","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"system:controller:glbc"},"roleRef":{"apiGroup":"rbac.authorization.k8s.io","kind":"ClusterRole","name":"system:controller:glbc"},"subjects":[{"kind":"User","name":"system:controller:glbc"}]}\n'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile'
            },
            selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/system%3Acontroller%3Aglbc'
          },
          apiVersion: 'rbac.authorization.k8s.io/v1',
          '@type': 'rbac.authorization.k8s.io/v1.ClusterRoleBinding',
          kind: 'ClusterRoleBinding',
          subjects: [
            {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: 'system:controller:glbc'
            }
          ],
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'system:controller:glbc'
          }
        },
        methodName: 'io.k8s.authorization.rbac.v1.clusterrolebindings.patch',
        resourceName: 'rbac.authorization.k8s.io/v1/clusterrolebindings/system:controller:glbc',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:17.811220454Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: '01d3c579-6310-49c9-a960-fac8526d8b98',
        first: true
      },
      insertId: '01d3c579-6310-49c9-a960-fac8526d8b98',
      timestamp: '2022-02-11T07:49:14.814568Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'authorization.k8s.io/reason': ''
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          '@type': 'k8s.io/Patch',
          subjects: [
            {
              kind: 'User',
              name: 'system:controller:glbc'
            }
          ]
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'rbac.authorization.k8s.io/v1/namespaces/kube-system/rolebindings/system:controller:glbc',
            permission: 'io.k8s.authorization.rbac.v1.rolebindings.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            uid: '57a23705-801d-4894-8c64-b5c68ded8763',
            resourceVersion: '524',
            creationTimestamp: '2020-04-07T21:02:18Z',
            name: 'system:controller:glbc',
            namespace: 'kube-system',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1","kind":"RoleBinding","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"system:controller:glbc","namespace":"kube-system"},"roleRef":{"apiGroup":"rbac.authorization.k8s.io","kind":"Role","name":"system:controller:glbc"},"subjects":[{"kind":"User","name":"system:controller:glbc"}]}\n'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile'
            },
            selfLink: '/apis/rbac.authorization.k8s.io/v1/namespaces/kube-system/rolebindings/system:controller:glbc'
          },
          apiVersion: 'rbac.authorization.k8s.io/v1',
          '@type': 'rbac.authorization.k8s.io/v1.RoleBinding',
          kind: 'RoleBinding',
          subjects: [
            {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: 'system:controller:glbc'
            }
          ],
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'Role',
            name: 'system:controller:glbc'
          }
        },
        methodName: 'io.k8s.authorization.rbac.v1.rolebindings.patch',
        resourceName: 'rbac.authorization.k8s.io/v1/namespaces/kube-system/rolebindings/system:controller:glbc',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:18.610832617Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: '46e154db-7077-49a3-b181-6c7b5cce462c',
        first: true
      },
      insertId: '46e154db-7077-49a3-b181-6c7b5cce462c',
      timestamp: '2022-02-11T07:49:14.809106Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'authorization.k8s.io/reason': ''
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          metadata: {
            annotations: {
              'components.gke.io/component-version': null,
              'components.gke.io/layer': null,
              'components.gke.io/component-name': null,
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1beta1","kind":"ClusterRoleBinding","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"master-monitoring-role-binding"},"roleRef":{"apiGroup":"rbac.authorization.k8s.io","kind":"ClusterRole","name":"system:master-monitoring-role"},"subjects":[{"kind":"User","name":"system:master-prom-to-sd-monitor"}]}\n'
            }
          },
          '@type': 'k8s.io/Patch',
          subjects: [
            {
              kind: 'User',
              name: 'system:master-prom-to-sd-monitor'
            }
          ]
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'rbac.authorization.k8s.io/v1beta1/clusterrolebindings/master-monitoring-role-binding',
            permission: 'io.k8s.authorization.rbac.v1beta1.clusterrolebindings.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            uid: '3e28db9e-d314-49cc-a3c4-aa8ab4c90b24',
            resourceVersion: '328258843',
            creationTimestamp: '2020-04-07T21:02:16Z',
            name: 'master-monitoring-role-binding',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1beta1","kind":"ClusterRoleBinding","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"master-monitoring-role-binding"},"roleRef":{"apiGroup":"rbac.authorization.k8s.io","kind":"ClusterRole","name":"system:master-monitoring-role"},"subjects":[{"kind":"User","name":"system:master-prom-to-sd-monitor"}]}\n'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile'
            },
            selfLink: '/apis/rbac.authorization.k8s.io/v1beta1/clusterrolebindings/master-monitoring-role-binding'
          },
          apiVersion: 'rbac.authorization.k8s.io/v1beta1',
          '@type': 'rbac.authorization.k8s.io/v1beta1.ClusterRoleBinding',
          kind: 'ClusterRoleBinding',
          subjects: [
            {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: 'system:master-prom-to-sd-monitor'
            }
          ],
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'system:master-monitoring-role'
          }
        },
        methodName: 'io.k8s.authorization.rbac.v1beta1.clusterrolebindings.patch',
        resourceName: 'rbac.authorization.k8s.io/v1beta1/clusterrolebindings/master-monitoring-role-binding',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:18.411263616Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: '0b936467-9ba2-402d-89f7-8cf288b745b4',
        first: true
      },
      insertId: '0b936467-9ba2-402d-89f7-8cf288b745b4',
      timestamp: '2022-02-11T07:49:14.769456Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'k8s.io/removed-release': '1.22',
        'k8s.io/deprecated': 'true',
        'authorization.k8s.io/reason': ''
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          metadata: {
            annotations: {
              'components.gke.io/component-version': null,
              'components.gke.io/layer': null,
              'components.gke.io/component-name': null,
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1","kind":"ClusterRole","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"system:master-monitoring-role"},"rules":[{"nonResourceURLs":["/metrics","/metrics/*"],"verbs":["get"]}]}\n'
            }
          },
          '@type': 'k8s.io/Patch'
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'rbac.authorization.k8s.io/v1/clusterroles/system:master-monitoring-role',
            permission: 'io.k8s.authorization.rbac.v1.clusterroles.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            uid: '63155e3e-3343-4ed4-a271-1586f9a878b2',
            resourceVersion: '328258842',
            creationTimestamp: '2020-04-07T21:02:16Z',
            name: 'system:master-monitoring-role',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"rbac.authorization.k8s.io/v1","kind":"ClusterRole","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"system:master-monitoring-role"},"rules":[{"nonResourceURLs":["/metrics","/metrics/*"],"verbs":["get"]}]}\n'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile'
            },
            selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/system%3Amaster-monitoring-role'
          },
          apiVersion: 'rbac.authorization.k8s.io/v1',
          '@type': 'rbac.authorization.k8s.io/v1.ClusterRole',
          kind: 'ClusterRole',
          rules: [
            {
              verbs: ['get'],
              nonResourceURLs: ['/metrics', '/metrics/*']
            }
          ]
        },
        methodName: 'io.k8s.authorization.rbac.v1.clusterroles.patch',
        resourceName: 'rbac.authorization.k8s.io/v1/clusterroles/system:master-monitoring-role',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:18.811059798Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: '2d485b50-3b18-421a-9ac0-ef62b08da67a',
        first: true
      },
      insertId: '2d485b50-3b18-421a-9ac0-ef62b08da67a',
      timestamp: '2022-02-11T07:49:14.762918Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'authorization.k8s.io/reason': ''
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          '@type': 'k8s.io/Patch',
          spec: {
            template: {
              spec: {
                '$setElementOrder/containers': [
                  {
                    name: 'kube-proxy'
                  }
                ],
                containers: [
                  {
                    '$setElementOrder/volumeMounts': [
                      {
                        mountPath: '/var/log'
                      },
                      {
                        mountPath: '/run/xtables.lock'
                      },
                      {
                        mountPath: '/lib/modules'
                      }
                    ],
                    name: 'kube-proxy',
                    volumeMounts: [
                      {
                        mountPath: '/var/log',
                        readOnly: false
                      },
                      {
                        mountPath: '/run/xtables.lock',
                        readOnly: false
                      }
                    ]
                  }
                ]
              }
            }
          }
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'apps/v1/namespaces/kube-system/daemonsets/kube-proxy',
            permission: 'io.k8s.apps.v1.daemonsets.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            generation: 24,
            uid: '549ced1b-a88c-450a-a0f3-aad7dc63d96b',
            resourceVersion: '326290186',
            creationTimestamp: '2020-06-12T15:54:37Z',
            name: 'kube-proxy',
            namespace: 'kube-system',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"apps/v1","kind":"DaemonSet","metadata":{"annotations":{},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile","k8s-app":"kube-proxy"},"name":"kube-proxy","namespace":"kube-system"},"spec":{"selector":{"matchLabels":{"k8s-app":"kube-proxy"}},"template":{"metadata":{"labels":{"k8s-app":"kube-proxy"}},"spec":{"containers":[{"command":["/bin/sh","-c","kube-proxy --cluster-cidr=10.44.0.0/14 --oom-score-adj=-998 --v=2 --feature-gates=DynamicKubeletConfig=false,ServiceLoadBalancerFinalizer=true --iptables-sync-period=1m --iptables-min-sync-period=10s --ipvs-sync-period=1m --ipvs-min-sync-period=10s --detect-local-mode=NodeCIDR 1\\u003e\\u003e/var/log/kube-proxy.log 2\\u003e\\u00261"],"env":[{"name":"KUBERNETES_SERVICE_HOST","value":"172.16.205.2"}],"image":"gke.gcr.io/kube-proxy-amd64:v1.19.15-gke.1801","name":"kube-proxy","resources":{"requests":{"cpu":"100m"}},"securityContext":{"privileged":true},"volumeMounts":[{"mountPath":"/var/log","name":"varlog","readOnly":false},{"mountPath":"/run/xtables.lock","name":"xtables-lock","readOnly":false},{"mountPath":"/lib/modules","name":"lib-modules","readOnly":true}]}],"hostNetwork":true,"nodeSelector":{"kubernetes.io/os":"linux","node.kubernetes.io/kube-proxy-ds-ready":"true"},"priorityClassName":"system-node-critical","serviceAccountName":"kube-proxy","tolerations":[{"effect":"NoExecute","operator":"Exists"},{"effect":"NoSchedule","operator":"Exists"}],"volumes":[{"hostPath":{"path":"/var/log"},"name":"varlog"},{"hostPath":{"path":"/run/xtables.lock","type":"FileOrCreate"},"name":"xtables-lock"},{"hostPath":{"path":"/lib/modules"},"name":"lib-modules"}]}},"updateStrategy":{"rollingUpdate":{"maxUnavailable":"10%"},"type":"RollingUpdate"}}}\n',
              'deprecated.daemonset.template.generation': '24'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile',
              'k8s-app': 'kube-proxy'
            },
            selfLink: '/apis/apps/v1/namespaces/kube-system/daemonsets/kube-proxy'
          },
          apiVersion: 'apps/v1',
          '@type': 'apps.k8s.io/v1.DaemonSet',
          kind: 'DaemonSet',
          spec: {
            template: {
              metadata: {
                creationTimestamp: null,
                labels: {
                  'k8s-app': 'kube-proxy'
                }
              },
              spec: {
                dnsPolicy: 'ClusterFirst',
                terminationGracePeriodSeconds: 30,
                hostNetwork: true,
                serviceAccountName: 'kube-proxy',
                priorityClassName: 'system-node-critical',
                volumes: [
                  {
                    name: 'varlog',
                    hostPath: {
                      path: '/var/log',
                      type: ''
                    }
                  },
                  {
                    name: 'xtables-lock',
                    hostPath: {
                      path: '/run/xtables.lock',
                      type: 'FileOrCreate'
                    }
                  },
                  {
                    name: 'lib-modules',
                    hostPath: {
                      path: '/lib/modules',
                      type: ''
                    }
                  }
                ],
                serviceAccount: 'kube-proxy',
                securityContext: {},
                restartPolicy: 'Always',
                nodeSelector: {
                  'kubernetes.io/os': 'linux',
                  'node.kubernetes.io/kube-proxy-ds-ready': 'true'
                },
                tolerations: [
                  {
                    effect: 'NoExecute',
                    operator: 'Exists'
                  },
                  {
                    effect: 'NoSchedule',
                    operator: 'Exists'
                  }
                ],
                containers: [
                  {
                    image: 'gke.gcr.io/kube-proxy-amd64:v1.19.15-gke.1801',
                    imagePullPolicy: 'IfNotPresent',
                    terminationMessagePolicy: 'File',
                    terminationMessagePath: '/dev/termination-log',
                    name: 'kube-proxy',
                    resources: {
                      requests: {
                        cpu: '100m'
                      }
                    },
                    securityContext: {
                      privileged: true
                    },
                    env: [
                      {
                        name: 'KUBERNETES_SERVICE_HOST',
                        value: '172.16.205.2'
                      }
                    ],
                    command: [
                      '/bin/sh',
                      '-c',
                      'kube-proxy --cluster-cidr=10.44.0.0/14 --oom-score-adj=-998 --v=2 --feature-gates=DynamicKubeletConfig=false,ServiceLoadBalancerFinalizer=true --iptables-sync-period=1m --iptables-min-sync-period=10s --ipvs-sync-period=1m --ipvs-min-sync-period=10s --detect-local-mode=NodeCIDR 1>>/var/log/kube-proxy.log 2>&1'
                    ],
                    volumeMounts: [
                      {
                        mountPath: '/var/log',
                        name: 'varlog'
                      },
                      {
                        mountPath: '/run/xtables.lock',
                        name: 'xtables-lock'
                      },
                      {
                        mountPath: '/lib/modules',
                        name: 'lib-modules',
                        readOnly: true
                      }
                    ]
                  }
                ],
                schedulerName: 'default-scheduler'
              }
            },
            updateStrategy: {
              type: 'RollingUpdate',
              rollingUpdate: {
                maxUnavailable: '10%'
              }
            },
            revisionHistoryLimit: 10,
            selector: {
              matchLabels: {
                'k8s-app': 'kube-proxy'
              }
            }
          },
          status: {
            numberMisscheduled: 0,
            numberReady: 0,
            currentNumberScheduled: 0,
            desiredNumberScheduled: 0,
            observedGeneration: 24
          }
        },
        methodName: 'io.k8s.apps.v1.daemonsets.patch',
        resourceName: 'apps/v1/namespaces/kube-system/daemonsets/kube-proxy',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:18.894613169Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: 'e55fb003-b0fd-4940-84bf-42b8304a429e',
        first: true
      },
      insertId: 'e55fb003-b0fd-4940-84bf-42b8304a429e',
      timestamp: '2022-02-11T07:49:14.729517Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'authorization.k8s.io/reason': ''
      }
    },
    {
      logName: 'projects/qa-target/logs/cloudaudit.googleapis.com%2Factivity',
      resource: {
        type: 'k8s_cluster',
        labels: {
          cluster_name: 'qa-target-free-sample',
          project_id: 'qa-target',
          location: 'us-central1-a'
        }
      },
      protoPayload: {
        requestMetadata: {
          callerSuppliedUserAgent: 'kubectl/v1.13.2 (linux/amd64) kubernetes/cff46ab',
          callerIp: '::1'
        },
        request: {
          '@type': 'k8s.io/Patch',
          spec: {
            preserveUnknownFields: false
          }
        },
        authenticationInfo: {
          principalEmail: 'system:addon-manager'
        },
        authorizationInfo: [
          {
            resource: 'apiextensions.k8s.io/v1/customresourcedefinitions/storagestates.migration.k8s.io',
            permission: 'io.k8s.apiextensions.v1.customresourcedefinitions.patch',
            granted: true
          }
        ],
        '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
        response: {
          metadata: {
            generation: 2,
            uid: 'ad84c619-181a-4293-b35a-5282d29b9edd',
            resourceVersion: '203080420',
            creationTimestamp: '2020-04-07T21:02:10Z',
            name: 'storagestates.migration.k8s.io',
            annotations: {
              'components.gke.io/component-version': '0.0.2',
              'components.gke.io/component-name': 'storageversionmigrator-crd',
              'kubectl.kubernetes.io/last-applied-configuration':
                '{"apiVersion":"apiextensions.k8s.io/v1","kind":"CustomResourceDefinition","metadata":{"annotations":{"api-approved.kubernetes.io":"https://github.com/kubernetes/enhancements/pull/747","components.gke.io/component-name":"storageversionmigrator-crd","components.gke.io/component-version":"0.0.2"},"labels":{"addonmanager.kubernetes.io/mode":"Reconcile"},"name":"storagestates.migration.k8s.io"},"spec":{"group":"migration.k8s.io","names":{"kind":"StorageState","listKind":"StorageStateList","plural":"storagestates","singular":"storagestate"},"preserveUnknownFields":false,"scope":"Cluster","versions":[{"name":"v1alpha1","schema":{"openAPIV3Schema":{"description":"The state of the storage of a specific resource.","properties":{"apiVersion":{"description":"APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources","type":"string"},"kind":{"description":"Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds","type":"string"},"metadata":{"properties":{"name":{"description":"The name must be \\"\\u003c.spec.resource.resouce\\u003e.\\u003c.spec.resource.group\\u003e\\".","type":"string"}},"type":"object"},"spec":{"description":"Specification of the storage state.","properties":{"resource":{"description":"The resource this storageState is about.","properties":{"group":{"description":"The name of the group.","type":"string"},"resource":{"description":"The name of the resource.","type":"string"}},"type":"object"}},"type":"object"},"status":{"description":"Status of the storage state.","properties":{"currentStorageVersionHash":{"description":"The hash value of the current storage version, as shown in the discovery document served by the API server. Storage Version is the version to which objects are converted to before persisted.","type":"string"},"lastHeartbeatTime":{"description":"LastHeartbeatTime is the last time the storage migration triggering controller checks the storage version hash of this resource in the discovery document and updates this field.","format":"date-time","type":"string"},"persistedStorageVersionHashes":{"description":"The hash values of storage versions that persisted instances of spec.resource might still be encoded in. \\"Unknown\\" is a valid value in the list, and is the default value. It is not safe to upgrade or downgrade to an apiserver binary that does not support all versions listed in this field, or if \\"Unknown\\" is listed. Once the storage version migration for this resource has completed, the value of this field is refined to only contain the currentStorageVersionHash. Once the apiserver has changed the storage version, the new storage version is appended to the list.","items":{"type":"string"},"type":"array"}},"type":"object"}},"type":"object"}},"served":true,"storage":true,"subresources":{"status":{}}}]}}\n',
              'api-approved.kubernetes.io': 'https://github.com/kubernetes/enhancements/pull/747'
            },
            labels: {
              'addonmanager.kubernetes.io/mode': 'Reconcile'
            },
            selfLink: '/apis/apiextensions.k8s.io/v1/customresourcedefinitions/storagestates.migration.k8s.io'
          },
          apiVersion: 'apiextensions.k8s.io/v1',
          '@type': 'apiextensions.k8s.io/v1.CustomResourceDefinition',
          kind: 'CustomResourceDefinition',
          spec: {
            names: {
              listKind: 'StorageStateList',
              plural: 'storagestates',
              kind: 'StorageState',
              singular: 'storagestate'
            },
            versions: [
              {
                schema: {
                  openAPIV3Schema: {
                    description: 'The state of the storage of a specific resource.',
                    type: 'object',
                    properties: {
                      metadata: {
                        type: 'object',
                        properties: {
                          name: {
                            description: 'The name must be "<.spec.resource.resouce>.<.spec.resource.group>".',
                            type: 'string'
                          }
                        }
                      },
                      apiVersion: {
                        description:
                          'APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources',
                        type: 'string'
                      },
                      kind: {
                        description:
                          'Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds',
                        type: 'string'
                      },
                      spec: {
                        description: 'Specification of the storage state.',
                        type: 'object',
                        properties: {
                          resource: {
                            description: 'The resource this storageState is about.',
                            type: 'object',
                            properties: {
                              resource: {
                                description: 'The name of the resource.',
                                type: 'string'
                              },
                              group: {
                                description: 'The name of the group.',
                                type: 'string'
                              }
                            }
                          }
                        }
                      },
                      status: {
                        description: 'Status of the storage state.',
                        type: 'object',
                        properties: {
                          currentStorageVersionHash: {
                            description:
                              'The hash value of the current storage version, as shown in the discovery document served by the API server. Storage Version is the version to which objects are converted to before persisted.',
                            type: 'string'
                          },
                          persistedStorageVersionHashes: {
                            description:
                              'The hash values of storage versions that persisted instances of spec.resource might still be encoded in. "Unknown" is a valid value in the list, and is the default value. It is not safe to upgrade or downgrade to an apiserver binary that does not support all versions listed in this field, or if "Unknown" is listed. Once the storage version migration for this resource has completed, the value of this field is refined to only contain the currentStorageVersionHash. Once the apiserver has changed the storage version, the new storage version is appended to the list.',
                            type: 'array',
                            items: {
                              type: 'string'
                            }
                          },
                          lastHeartbeatTime: {
                            format: 'date-time',
                            description:
                              'LastHeartbeatTime is the last time the storage migration triggering controller checks the storage version hash of this resource in the discovery document and updates this field.',
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                },
                served: true,
                name: 'v1alpha1',
                subresources: {
                  status: {}
                },
                storage: true
              }
            ],
            scope: 'Cluster',
            conversion: {
              strategy: 'None'
            },
            group: 'migration.k8s.io'
          },
          status: {
            storedVersions: ['v1alpha1'],
            conditions: [
              {
                reason: 'NoConflicts',
                lastTransitionTime: '2020-04-07T21:02:10Z',
                message: 'no conflicts found',
                type: 'NamesAccepted',
                status: 'True'
              },
              {
                reason: 'InitialNamesAccepted',
                lastTransitionTime: null,
                message: 'the initial names have been accepted',
                type: 'Established',
                status: 'True'
              },
              {
                reason: 'ApprovedAnnotation',
                lastTransitionTime: '2021-07-08T03:20:34Z',
                message: 'approved in https://github.com/kubernetes/enhancements/pull/747',
                type: 'KubernetesAPIApprovalPolicyConformant',
                status: 'True'
              }
            ],
            acceptedNames: {
              listKind: 'StorageStateList',
              plural: 'storagestates',
              kind: 'StorageState',
              singular: 'storagestate'
            }
          }
        },
        methodName: 'io.k8s.apiextensions.v1.customresourcedefinitions.patch',
        resourceName: 'apiextensions.k8s.io/v1/customresourcedefinitions/storagestates.migration.k8s.io',
        serviceName: 'k8s.io',
        status: {
          code: 0
        }
      },
      receiveTimestamp: '2022-02-11T07:49:18.894613169Z',
      operation: {
        last: true,
        producer: 'k8s.io',
        id: '143ce348-a404-4afc-8f6e-22fe6dc8fac0',
        first: true
      },
      insertId: '143ce348-a404-4afc-8f6e-22fe6dc8fac0',
      timestamp: '2022-02-11T07:49:14.615184Z',
      labels: {
        'authorization.k8s.io/decision': 'allow',
        'authorization.k8s.io/reason': ''
      }
    }
  ],
  metaData: null,
  correlationId: 'af878454-a4bf-4cfe-810a-9c0eb91b466f'
}

export const jsonMetricDefinition = {
  dataSets: [
    {
      timeSeriesQuery: {
        timeSeriesFilter: {
          filter: 'metric.type="kubernetes.io/container/restart_count" resource.type="k8s_container"',
          aggregation: {
            perSeriesAligner: 'ALIGN_RATE',
            crossSeriesReducer: 'REDUCE_SUM'
          }
        }
      }
    }
  ]
}

export const monitoredService = {
  status: 'SUCCESS',
  data: {
    createdAt: 1642157779711,
    lastModifiedAt: 1643278935584,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'Google Cloud Operations',
            identifier: 'Google_Cloud_Operations',
            type: 'StackdriverLog',
            spec: {
              connectorRef: 'gcpqatarget',
              feature: 'Cloud Logs',
              queries: [
                {
                  name: 'GCO Logs Query',
                  query: '{}',
                  messageIdentifier: 'resource.labels.cluster_name',
                  serviceInstanceIdentifier: 'logName'
                }
              ]
            }
          },
          {
            name: 'GCO Dashboard',
            identifier: 'GCO_Dashboard',
            type: 'Stackdriver',
            spec: {
              connectorRef: 'gcpqatarget',
              metricDefinitions: [
                {
                  identifier: 'kubernetes.io/container/restart_count',
                  metricName: 'kubernetes.io/container/restart_count',
                  riskProfile: {
                    category: 'Errors',
                    metricType: 'ERROR',
                    thresholdTypes: []
                  },
                  analysis: {
                    liveMonitoring: {
                      enabled: false
                    },
                    deploymentVerification: {
                      enabled: false,
                      serviceInstanceFieldName: null,
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: {
                      category: 'Errors',
                      metricType: 'ERROR',
                      thresholdTypes: []
                    }
                  },
                  sli: {
                    enabled: true
                  },
                  dashboardName: 'TestDashboard',
                  dashboardPath: 'projects/145904791365/dashboards/59a9ca97-65f5-45ef-a270-da71e3b6704c',
                  jsonMetricDefinition: {
                    dataSets: [
                      {
                        timeSeriesQuery: {
                          timeSeriesFilter: {
                            filter: 'metric.type="kubernetes.io/container/restart_count" resource.type="k8s_container"',
                            aggregation: {
                              perSeriesAligner: 'ALIGN_RATE',
                              crossSeriesReducer: 'REDUCE_SUM'
                            }
                          }
                        }
                      }
                    ]
                  },
                  metricTags: ['Restart count - Works'],
                  serviceInstanceField: null,
                  isManualQuery: false
                }
              ]
            }
          },
          {
            name: 'GCO Metric',
            identifier: 'GCO_Metric',
            type: 'Stackdriver',
            spec: {
              connectorRef: 'Google_Cloud_Operations_project',
              metricDefinitions: [
                {
                  identifier: 'test',
                  metricName: 'test',
                  riskProfile: {
                    category: 'Errors',
                    metricType: null,
                    thresholdTypes: []
                  },
                  analysis: {
                    liveMonitoring: {
                      enabled: false
                    },
                    deploymentVerification: {
                      enabled: false,
                      serviceInstanceFieldName: null,
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: {
                      category: 'Errors',
                      metricType: null,
                      thresholdTypes: []
                    }
                  },
                  sli: {
                    enabled: true
                  },
                  dashboardName: '',
                  dashboardPath: '',
                  jsonMetricDefinition,
                  metricTags: ['test'],
                  serviceInstanceField: null,
                  isManualQuery: true
                }
              ]
            }
          },
          {
            name: 'es1',
            identifier: 'es1',
            type: 'ElasticSearch',
            spec: {
              connectorRef: 'elastic-search-api',
              feature: 'ElasticSearch Logs',
              queries: [
                {
                  name: 'ElasticSearch Logs Query',
                  query: '*',
                  index: 'integration-test',
                  serviceInstanceIdentifier: 'logName',
                  timeStampIdentifier: 'timestamp',
                  timeStampFormat: 'MMM dd HH:mm:ss',
                  messageIdentifier: 'cluster_name'
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'f3cdbd07-e92d-4162-854e-c6aac938d0c0'
}

export const dashboardDetailsAPI =
  '/cv/api/stackdriver/dashboard-detail?routingId=accountId&projectIdentifier=project1&orgIdentifier=default&accountId=accountId&connectorIdentifier=gcpqatarget&tracingId=*&dashboardId=projects%2F145904791365%2Fdashboards%2F59a9ca97-65f5-45ef-a270-da71e3b6704c&path=projects%2F145904791365%2Fdashboards%2F59a9ca97-65f5-45ef-a270-da71e3b6704c'

export const dashboardDetailsResponse = {
  status: 'SUCCESS',
  data: [
    {
      widgetName: 'Restart count - Works',
      dataSetList: [
        {
          timeSeriesQuery: {
            dataSets: [
              {
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter: 'metric.type="kubernetes.io/container/restart_count" resource.type="k8s_container"',
                    aggregation: {
                      perSeriesAligner: 'ALIGN_RATE',
                      crossSeriesReducer: 'REDUCE_SUM'
                    }
                  }
                }
              }
            ]
          },
          metricName: 'kubernetes.io/container/restart_count'
        }
      ]
    },
    {
      widgetName: 'Kubernetes Container - Memory usage ',
      dataSetList: [
        {
          timeSeriesQuery: {
            dataSets: [
              {
                timeSeriesQuery: {
                  unitOverride: 'By',
                  timeSeriesFilter: {
                    filter: 'metric.type="kubernetes.io/container/memory/used_bytes" resource.type="k8s_container"',
                    aggregation: {
                      perSeriesAligner: 'ALIGN_MEAN',
                      crossSeriesReducer: 'REDUCE_MEAN'
                    }
                  }
                }
              }
            ]
          },
          metricName: 'kubernetes.io/container/memory/used_bytes'
        }
      ]
    }
  ],
  metaData: null,
  correlationId: 'dd0c649b-1bdf-46ae-82e3-eb83488d1d3a'
}
