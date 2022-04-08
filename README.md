# OUI plugin for SPR

Sample SPR plugin in node.js to return oui info for a MAC address prefix

## Add to SPR

checkout the repo & add the `state/plugin-oui` directory for the http socket:

```sh
$ cd super
$ git clone https://github.com/lts-po/plugin-oui.git
$ mkdir state/plugin-oui
```

add the container to docker-compose.yaml:

```yaml
  plugin-oui:
    container_name: super-plugin-oui
    build: plugin-oui
    network_mode: host
    logging: 
      driver: journald
    depends_on:
      - "base"
    volumes:
      - ./state/plugin-oui/:/state/plugin-oui/
```

build and run the container:
```sh
$ ./build_docker_compose.sh plugin-oui
$ docker-compose up -d plugin-oui
```

make sure the api is running:
```sh
$ curl --unix-socket ./state/plugin-oui/oui_plugin http:///localhost/001122
```

### add plugin to API

add the plugin to the api in `state/api/config`
```json
{
  "Plugins" : [
    {
      "Name": "dns-block",
      "URI": "dns/block",
      "UnixPath": "/state/dns/dns_block_plugin"
    },
    {
      "Name": "dns-log",
      "URI": "dns/log",
      "UnixPath": "/state/dns/dns_log_plugin"
    },
    {
      "Name": "oui",
      "URI": "oui",
      "UnixPath": "/state/plugin-oui/oui_plugin"
    }
  ]
}
```

make sure the state directory is mounted:
```
  api:
    container_name: superapi
    build: api
    network_mode: host
    privileged: true
    restart: always
    depends_on:
      - "base"
      - "wifid"
      - "dhcp"
      - "frontend"
    logging:
      driver: journald
    volumes:
      - ./configs/base/:/configs/base/
      - ./configs/devices/:/configs/devices/
      - ./configs/zones/:/configs/zones/
      - ./configs/wifi/:/configs/wifi/
      - ./configs/scripts/:/configs/scripts/
      - ./state/wifi/:/state/wifi/
      - ./state/dhcp/:/state/dhcp/
      - ./state/api/:/state/api/
      - ./state/dns/:/state/dns/
      - ./state/plugin-oui/:/state/plugin-oui/
      - ./frontend/build:/ui/
```


and restart the api:

```sh
$ docker-compose restart api
```

verify the api proxy is working:
```
$ curl -u "admin:$PASS" http://localhost/plugins/oui/001122
```

**NOTE:** For convenience you can share a plugins state directory and only mount it `docker-compose.yaml` under api:
```yaml
      - ./state/plugins/:/state/plugins/
```

## standalone

start the server:
```sh
$ node index
```

testing the api:
```sh
$ curl --unix-socket ./http.sock http:///localhost/001122
{"provider":"CIMSYS Inc","country":"Korea, Republic Of"}
```
