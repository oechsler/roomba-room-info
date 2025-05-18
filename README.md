# Roomba Room Info

This tool extracts structured map and room/zone information from your Roomba by listening for a `start` cleaning command and outputting relevant values in Home Assistant–friendly YAML format. It is useful if you want to automate zone or room-based cleaning using the Roomba's `cleanRoom()` interface.

## Purpose

This script was specifically created for Home Assistant users to simplify the process of gathering the required parameters to send the Roomba to clean specific rooms or zones. These parameters include the `pmap_id`, `user_pmapv_id`, and the `region_id`s for rooms or zones. Since iRobot changes the internal `user_pmapv_id` (a map timestamp/version) whenever the map is edited or updated in the app, this script helps keep your automations up-to-date without manually inspecting app traffic or state dumps.

## Features

* Authenticates with your iRobot account via the official cloud API
* Retrieves credentials (blid + password) required for local MQTT connection
* Connects locally to your Roomba and listens for the `start` command
* Extracts `pmap_id`, `user_pmapv_id`, and `regions[]` from the command
* Outputs YAML suitable for use in Home Assistant

## Example Output

```yaml
---
pmap_id: HClobeEtRH6Jl78zo3Gktw
regions:
  - region_id: "1"
    type: rid
user_pmapv_id: 250518T100807
```

## Quickstart (via Docker)

### 1. Clone the repository

```bash
git clone https://github.com/oechsler/roomba-room-info.git
cd roomba-room-info
```

### 2. Build the Docker image

```bash
docker build -t roomba-room-info .
```

### 3. Run the script

```bash
docker run --rm -it \
  -e ROOMBA_EMAIL='your@email.com' \
  -e ROOMBA_PASSWORD='yourCloudPassword' \
  -e ROOMBA_IP='192.168.1.x' \
  roomba-room-info
```

The script will connect to the local MQTT interface and wait for a cleaning command (`start`) to appear. Once detected, it prints the relevant values and exits.

> Note: Start a room/zone clean from the iRobot app before running the script to ensure data is available.

## Credit / License

This project is based in part on the `getPasswordCloud.js` code from the [dorita980](https://github.com/koalazak/dorita980) project by [@koalazak](https://github.com/koalazak).

* Source: [https://github.com/koalazak/dorita980/blob/master/bin/getPasswordCloud.js](https://github.com/koalazak/dorita980/blob/master/bin/getPasswordCloud.js)

MIT License.
