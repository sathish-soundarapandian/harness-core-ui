import type { IconProps } from '@harness/icons'
import { Color } from '@harness/design-system'

import css from './PluginsPanel.module.scss'

export interface PluginInterface {
  name: string
  description: string
  pluginIcon: IconProps
  publisherIcon: string
  isInstalled: boolean
  className?: string
}

export const Plugins: PluginInterface[] = [
  {
    name: 'Bash/ Shell script',
    description: 'Run a script on macOS, Linux, or Windows',
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'ci-main',
    isInstalled: true
  },
  {
    name: 'Test Intelligence',
    description: 'Run tests as part of your pipeline',
    pluginIcon: { name: 'test-verification', color: Color.PRIMARY_7 },
    publisherIcon: 'ci-main',
    isInstalled: true,
    className: css.padding2
  },
  {
    name: 'SonarQube',
    description: 'Scan your code using SonarQube',
    pluginIcon: { name: 'SonarQube' },
    publisherIcon: 'ci-main',
    isInstalled: false,
    className: css.padding1
  },
  {
    name: 'Codecov',
    description: 'Pushing test coverage results to Codecove',
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'ci-main',
    isInstalled: false
  },
  {
    name: 'slack-send',
    description: 'Send data into Slack',
    pluginIcon: { name: 'service-slack' },
    publisherIcon: 'github-actions',
    isInstalled: false
  },
  {
    name: 'Xcode build-for-test',
    description: "Performs xcodebuild's build-for-testing action",
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'bitrise',
    isInstalled: false
  },
  {
    name: 'Unity - Builder',
    description: 'Build Unity projects',
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'github-actions',
    isInstalled: false
  },
  {
    name: 'Sign apk',
    description: 'Signs your APK or Android App Bundle before uploading it to Google Play Store',
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'bitrise',
    isInstalled: false
  },
  {
    name: 'Bluepill build-test-for-ios',
    description: "Build and run parallel UI/Unit tests for iOS using LinkedIn's bluepill testing tool",
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'bitrise',
    isInstalled: false
  },
  {
    name: 'Cache Intelligence',
    description: 'Cache packages and dependancies to run your pipeline faster',
    pluginIcon: { name: 'plugin-step' },
    publisherIcon: 'ci-main',
    isInstalled: false
  }
]
