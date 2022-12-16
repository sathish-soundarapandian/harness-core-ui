#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

NGINX_CONFIG_FILE="/etc/nginx/nginx.conf"

if [[ "$ENABLE_IPV6" == "true" ]]
then
  NGINX_CONFIG_FILE="/etc/nginx/nginx-ipv6-only.conf"
fi

sed -i "s|<\!-- apiurl -->|<script>window.apiUrl = '$API_URL'</script>|" index.html
sed -i "s|HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|$HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|" index.html
sed -i "s|HARNESS_BROWSER_ROUTER_ENABLED|$HARNESS_BROWSER_ROUTER_ENABLED|" index.html
sed -i "s|HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|$HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|$HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_CDN_PLACEHOLDER|$HARNESS_ENABLE_CDN_PLACEHOLDER|" index.html
sed -i "s|BROWSER_ROUTER_ENABLED_PLACEHOLDER|$BROWSER_ROUTER_ENABLED_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_SABER_PLACEHOLDER|$HARNESS_ENABLE_SABER_PLACEHOLDER|" index.html
sed -i "s|<\!-- segmentToken -->|<script>window.segmentToken = '$SEGMENT_TOKEN'</script>|" index.html
sed -i "s|<\!-- bugsnagToken -->|<script>window.bugsnagToken = '$BUGSNAG_TOKEN'</script>|" index.html
sed -i "s|<\!-- appDyEUMToken -->|<script>window.appDyEUMToken = '$APPDY_EUM_TOKEN'</script>|" index.html
sed -i "s|<\!-- deploymentType -->|<script>window.deploymentType = '$DEPLOYMENT_TYPE'</script>|" index.html
sed -i "s|<\!-- refinerProjectToken -->|<script>window.refinerProjectToken = '$REFINER_PROJECT_TOKEN'</script>|" index.html
sed -i "s|<\!-- refinerFeedbackToken -->|<script>window.refinerFeedbackToken = '$REFINER_FEEDBACK_TOKEN'</script>|" index.html
sed -i "s|<\!-- saberToken -->|<script>window.saberToken = '$SABER_TOKEN'</script>|" index.html
sed -i "s|<\!-- helpPanelAccessToken -->|<script>window.helpPanelAccessToken = '$HELP_PANEL_ACCESS_TOKEN'</script>|" index.html
sed -i "s|<\!-- helpPanelSpace -->|<script>window.helpPanelSpace = '$HELP_PANEL_SPACE'</script>|" index.html
sed -i "s|<\!-- helpPanelEnvironment -->|<script>window.helpPanelEnvironment = '$HELP_PANEL_ENVIRONMENT'</script>|" index.html
sed -i "s|<\!-- newNavContentfulAccessToken -->|<script>window.newNavContentfulAccessToken = '$NEW_NAV_CONTENTFUL_ACCESS_TOKEN'</script>|" index.html
sed -i "s|<\!-- newNavContetfulSpace -->|<script>window.newNavContetfulSpace = '$NEW_NAV_CONTENTFUL_SPACE'</script>|" index.html
sed -i "s|<\!-- newNavContentfulEnvironment -->|<script>window.newNavContentfulEnvironment = '$NEW_NAV_CONTENTFUL_ENVIRONMENT'</script>|" index.html
sed -i "s|<\!-- harnessNameSpacePlaceHolder -->|<script>window.harnessNameSpace = '$HARNESS_NAME_SPACE'</script>|" index.html
sed -i "s|<\!-- stripeApiKey -->|<script>window.stripeApiKey = '$STRIPE_API_KEY'</script>|" index.html

sed -i "s|USE_LEGACY_FEATURE_FLAGS_PLACEHOLDER|$USE_LEGACY_FEATURE_FLAGS|" index.html
sed -i "s|HARNESS_FF_SDK_BASE_URL_PLACEHOLDER|$HARNESS_FF_SDK_BASE_URL|" index.html
sed -i "s|HARNESS_FF_SDK_ENABLE_STREAM_PLACEHOLDER|$HARNESS_FF_SDK_ENABLE_STREAM|" index.html
sed -i "s|HARNESS_FF_SDK_KEY_PLACEHOLDER|$HARNESS_FF_SDK_KEY|" index.html

if [ "$HARNESS_ENABLE_CDN_PLACEHOLDER" = "true" ]
then
  sed -i "s|\"static\/main\.\(.*\)\.js\"|\"//static.harness.io/ng-static/main.\1.js\"|" index.html
  sed -i "s|\"static\/styles\.\(.*\)\.css\"|\"//static.harness.io/ng-static/styles.\1.css\"|" index.html
fi

if [ "$DEPLOYMENT_TYPE" != "ON_PREM" ]
then
  sed -i "s|<\!-- externalFontsForSaaS -->|<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600\&display=swap' rel='stylesheet' /><link href='https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;700\&display=swap' rel='stylesheet' /><link href='https://fonts.googleapis.com/css2?family=Reenie+Beanie\&display=swap' rel='stylesheet' />|" index.html
fi

echo "Using $NGINX_CONFIG_FILE for nginx"
nginx -c $NGINX_CONFIG_FILE -g 'daemon off;'
