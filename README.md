
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Dashboard

This plugin provides a dashboard that can be configured easily. It displays all homebridge devices and makes it possible 
to control them through the web panel.

## Supported devices

This plugin has been tested with following devices:

- Tapo P100
- [Security System Plugin](https://www.npmjs.com/package/homebridge-securitysystem)
- [TP Link Camera Plugin](https://github.com/kopiro/homebridge-tapo-camera)

But even if the amount of tested devices is not that big, many devices should be supported in theory.
Just give it a try and try it out yourself.

## Installation

NOTE: You will need to have `ffmpeg` installed if you want to use the camera streaming feature.

If you are using [config-ui-x](https://github.com/homebridge/homebridge-config-ui-x) you can just install
this extension through the admin panel.
If you are installing your plugins through a cli just use

```bash
npm i -g homebridge-dashboard
```

## Configuration

| Parameter | description                                                                                             | format  | default |
|-----------|---------------------------------------------------------------------------------------------------------|---------|---------|
| port      | The port that the web panel runs on. Using a port lower than 10000 could cause the system to not start. | integer | 18081   |
| pin       | The pin of the Homekit bridge                                                                           | string  | `null`  |
| tabs      | Tabs are shown in the frontend. They are used to sort all devices.                                      | array   | []      |


## Node versions

The system is tested on following node versions:
- 15.x
- 16.x
- 17.x
- 18.x
