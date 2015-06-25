## About

Ionic OAuth Demo is a test platform from Amida Technology Solutions.  It acts as an OAuth Client connecting the the Data Reconciliation Engine and also serves as a test bed for possible future integrations (example: HealthKit)

### Installation

In order to get started, cordova and ionic need to be installed.  Do this by running:

```
npm install -g cordova ionic

npm install
```

Add the devices you want:

```
ionic platform add ios

ionic platform add android
```

And then...

```
bower install
```


#### iOS

DRE is currently setup for http NOT https... iOS doesn't like that (for good reason).  Currently a workaround until DRE adds https is to... go and modify your IonicApp-Info.plist file located at `platforms/ios/IonicApp/IonicApp-Info.plist` and add this to it:

```
<key>NSAppTransportSecurity</key>
    <dict>
      <key>NSAllowsArbitraryLoads</key>
      <true/>
    </dict>
```

For HealthKit, add this file `platforms/ios/IonicApp/IonicApp.entitlements` :

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.healthkit</key>
	<true/>
</dict>
</plist>
```

### Emulating

In order to emulate for iOS you will need to have XCode Installed and be using a Mac.

Emulate iOS: `ionic emulate ios`

Emulate Android: `ionic emulate android`

If you'd like to demo the layout, run `ionic serve`, but OAuth Tokens do not work in this mode.

To test on a physical android device, plug in the device and run `ionic run android`.  Make sure USB debugging is enabled on your device.