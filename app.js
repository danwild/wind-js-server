var express = require("express");
var moment = require("moment");
var http = require('http');
var fs = require('fs');
var Q = require('q');

var app = express();
var port = process.env.PORT || 3000;

var baseDir ='http://nomads.ncep.noaa.gov/';
var defaultParams ='cgi-bin/filter_gfs_1p00.pl?' +
	'file=gfs.t12z.pgrb2.1p00.f000&' +
	'lev_10_m_above_ground=on&' +
	'lev_surface=on&var_TMP=on&' +
	'var_UGRD=on&' +
	'var_VGRD=on&' +
	'leftlon=0&' +
	'rightlon=360&' +
	'toplat=90&' +
	'bottomlat=-90&' +
	'dir=%2Fgfs.';

app.listen(port, function(err){
    console.log("running server on port "+ port);
});

app.get('/', function(req, res){
    res.send('hello wind-js-server..');
});

app.get('/latest', function(req, res){
	sendLatest(moment().utc());
});

/**
 *
 * Finds and returns the latest 6 hourly pre-parsed JSON data
 *
 * @param targetMoment
 */
function sendLatest(targetMoment){

	var stamp = moment(targetMoment).format('YYYYMMDD') + roundHours(moment(targetMoment).hour(), 6);
	var fileName = __dirname +"/json-data/"+ stamp +".json";
	res.setHeader('Content-Type', 'application/json');
	res.sendFile(fileName, {}, function (err) {
		if (err) {
			console.log(err + stamp);
			sendLatest(moment(targetMoment).subtract(6, 'hours'));
		}
	});
}

/**
 *
 * Every 6 hours we pull in grib data and archive as json
 *
 */
setInterval(function(){

	latestQuery().then(function(response){

		// run grib2json
		convertGribToJson(response.stamp);

	});

}, 8000);


function convertGribToJson(stamp){

	console.log('convertGribToJson');

	var exec = require('child_process').exec, child;
	child = exec('converter/bin/grib2json --data --output json-data/'+stamp+'.json --names --compact grib-data/'+stamp+'.t12z.pgrb2.1p00.f000',
	    {maxBuffer: 500*1024},
	    function (error, stdout, stderr){

	        if(error){
	            console.log('exec error: ' + error);
		    }

	        else {
		        console.log("converted..");

		        // TODO delete GRIB file...

		        var exec = require( 'child_process' ).exec;
		        var path = __dirname+'/grib-data/';

		        exec( 'rm * ' + path);
	        }
	    });
}


/**
 *
 * Finds and returns the latest 6 hourly GRIB2 data from NOAAA
 *
 * @returns {*|promise}
 */
function latestQuery(){

	var deferred = Q.defer();

	// create latest datetime stamp, e.g. 2016040612
	var targetMoment = moment().utc();


	function runQuery(targetMoment){

		var stamp = moment(targetMoment).format('YYYYMMDD') + roundHours(moment(targetMoment).hour(), 6);
		var query = baseDir + defaultParams + stamp;
		console.log('QUERY: '+query);

		var file = fs.createWriteStream("grib-data/"+stamp+".t12z.pgrb2.1p00.f000");
		http.get(query, function(response) {

			console.log('Got response: '+ response.statusCode);

			if(response.statusCode != 200){
				runQuery(moment(targetMoment).subtract(6, 'hours'));
			}
			else {
				console.log('piping...');
				response.pipe(file);

				file.on('finish', function() {
					file.close();
					deferred.resolve({stamp: stamp});
				});

			}
		});

	}

	runQuery(targetMoment);
	return deferred.promise;
}

/**
 *
 * Round hours to expected interval, e.g. we're currently using 6 hourly interval
 * so round to 00 || 06 || 12 || 18
 *
 * @param hours
 * @param interval
 * @returns {String}
 */
function roundHours(hours, interval){
	if(interval > 0){
		var result = (Math.floor(hours / interval) * interval);
		return result < 10 ? '0' + result.toString() : result;
	}
}