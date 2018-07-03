# wind-js-server [![NPM version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]

Simple demo rest service to expose [GRIB2](http://en.wikipedia.org/wiki/GRIB) wind forecast data 
(1 degree, 6 hourly from [NOAA](http://nomads.ncep.noaa.gov/)) as JSON. <br/>

Consumed in [leaflet-velocity](https://github.com/danwild/leaflet-velocity).
Contains a pre-packaged copy of [grib2json](https://github.com/cambecc/grib2json) for conversion.

Data Vis demo here: http://danwild.github.io/leaflet-velocity

Note that this is intended as a crude demonstration, not intended for production use.
To get to production; you should improve upon this or build your own.

## install, run:

(assumes you have node and npm installed)

```bash
# from project root:
npm install
npm start
```

## endpoints
- **/latest** returns the most up to date JSON data available
- **/nearest** returns JSON data nearest to requested
	- $GET params:
		- `timeIso` an ISO timestamp for temporal target
		- `searchLimit` number of days to search beyond the timeIso (will search backwards, then forwards)
- **/alive** health check url, returns simple message

## License
MIT License (MIT)

[npm-image]: https://badge.fury.io/js/wind-js-server.svg
[npm-url]: https://www.npmjs.com/package/wind-js-server
[npm-downloads-image]: https://img.shields.io/npm/dt/wind-js-server.svg