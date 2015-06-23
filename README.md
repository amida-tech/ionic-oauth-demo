## About
=============

Ionic OAuth Demo is a test platform from Amida Technology Solutions.  It acts as an OAuth Client connecting the the Data Reconciliation Engine and also serves as a test bed for possible future integrations (example: HealthKit)

### Installation
==================

In order to get started, cordova and ionic need to be installed.  Do this by running:

``` npm install -g cordova ionic ```

In order to emulate for iOS you will need to have XCode Installed and be using a Mac.

Emulate iOS: `ionic emulate ios`

Emulate Android: `ionic emulate android`

If you'd like to demo the layout, run `ionic serve`, but OAuth Tokens do not work in this mode.

To test on a physical android device, plug in the device and run `ionic run android`.  Make sure USB debugging is enabled on your device.