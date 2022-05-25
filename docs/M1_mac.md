## Additional Installation Steps for M1-based Macs

When following the README there are additional steps required for users with a M1 Mac. Please see below:

### Step 1: Install Chromium

Chromium is required and should be installed prior to installing Harness Core UI. On Mac, one way to install Chromium is via Homebrew.

`brew install chromium`

If you want to check which Chromium your M1 Mac is using, type the following command:

`which chromium`

The Chromium should in the homebrew binary directory, as such:

`/opt/homebrew/bin/chromium`

### Step 2 (Optional/Not Required): Allow Chromium to open on your M1 Mac

If your M1 Mac doesn’t allow third party apps to be open, you may need to give Chromium permission to do so.

