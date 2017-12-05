/**
 * Created by CXS0W3K on 4/4/2016.
 * 
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    es = require('event-stream'),
    streamqueue = require('streamqueue'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    strip = require('gulp-strip-comments'),
    mocha = require('gulp-mocha'),
    scp = require('gulp-scp2'),
    gutil = require('gulp-util'),
    //babel = require("gulp-babel"),
    argv = require('yargs').argv,
    header = require('gulp-header'),
    _ = require('lodash'),
    exec = require('ssh-exec'),
    replace = require('gulp-replace'),
    //ngAnnotate = require('gulp-ng-annotate'),
    config = require('./config.js'),
    jsFrameworkFiles = [
        // jquery framework/plugins
        "frontEnd/assets/libs/jquery/jquery-2.1.4.min.js",
        //"frontEnd/assets/libs/jquery/jquery-ui.min.js",
        //"frontEnd/assets/libs/jquery/notify.min.js",
        "frontEnd/assets/libs/jquery/blockUI.min.js",
        "frontEnd/assets/libs/underscore/underscore.min.js",
        "frontEnd/assets/libs/bootstrap/bootstrap.min.js",

        // angular framework/plugins
        "frontEnd/assets/libs/angular/angular.min.js",
        "frontEnd/assets/libs/angular/angular-animate.min.js",
        "frontEnd/assets/libs/angular/angular-sanitize.min.js",
        "frontEnd/assets/libs/angular/angular-cookies.min.js",
        "frontEnd/assets/libs/angular/angular-ui-router.js",
        "frontEnd/assets/libs/angular/rzslider.min.js",
        "frontEnd/assets/libs/angular/ng-csv.min.js",
        "frontEnd/assets/libs/angular/xeditable.min.js",
        // "frontEnd/assets/libs/angular/ui-bootstrap-tpls-0.14.3.min.js",
        "frontEnd/assets/libs/angular/ui-bootstrap-tpls-1.2.0.min.js",

        //d3 framework/plugins
        "frontEnd/assets/libs/d3/d3.min.js",
        "frontEnd/assets/libs/d3/d3pie.min.js",

        //other frameworks
        "frontEnd/assets/libs/leaflet/leaflet.js",
        "frontEnd/assets/libs/leaflet-boundsawarelayergroup/leaflet.boundsawarelayergroup.min.js",
        //"frontEnd/assets/libs/leaflet/leaflet1rc.min.js",
        "frontEnd/assets/libs/moment/moment.js",
        "frontEnd/assets/libs/lazysizes/lazysizes.min.js",

        //leaflet plugins
		"frontEnd/assets/libs/leaflet-groupedlayercontrol/leaflet.groupedlayercontrol.min.js",
		"frontEnd/assets/libs/Leaflet-IconLayers-master/iconLayers.js",
		"frontEnd/assets/libs/leaflet-heat/leaflet-heat.js",
        "frontEnd/assets/libs/OverlappingMarkerSpiderfier/oms.min.js",
        // "frontEnd/assets/libs/sidebar-v2-master/leaflet-sidebar.js",

        "frontEnd/assets/libs/xmlToJson/xmlToJson.js",

        //paused here
        "frontEnd/other/fci.js",
        "frontEnd/other/hvt.js",
        "frontEnd/other/monitor.js",
        "frontEnd/other/switchingOrders.js"
    ],
    jsInternalFiles = [
        "frontEnd/app/app.setup.js",
        "frontEnd/app/app.routes.js",
        "frontEnd/app/DataModel.js",

        //remove the comments here to allow original to work
        //   "frontEnd/app/mapController.js",
        //   "frontEnd/app/drawFunctions.js",
        //   "frontEnd/app/modalControllers.js",
        //   "frontEnd/app/services.js",
        //   "frontEnd/app/utilityFunctions.js",
        //remove above

        "frontEnd/app/shared/filters/startFrom.filter.js",
        "frontEnd/app/shared/filters/toArray.filter.js",

        "frontEnd/app/shared/services/broker.service.js",
        "frontEnd/app/shared/services/mouse.service.js",
        "frontEnd/app/shared/services/loadScreen.service.js",
        "frontEnd/app/shared/services/dateUtilities.service.js",

        "frontEnd/app/shared/modals/login.controller.js",

        "frontEnd/app/shared/directives/rightClick.directive.js",
        "frontEnd/app/shared/directives/datepickerPopup.directive.js",

        "frontEnd/app/components/login/login.controller.js",

        "frontEnd/app/components/map/directives/leaflet.directive.js",
        "frontEnd/app/components/map/directives/areaDateInvestigationSelection.directive.js",
        "frontEnd/app/components/map/directives/controlPanel.directive.js",
        "frontEnd/app/components/map/directives/areaDateSelectionHeader.directive.js",
        "frontEnd/app/components/map/directives/sidebar.directive.js",

        "frontEnd/app/components/map/DataModel.js",

        "frontEnd/app/components/map/services/stem.service.js",

        "frontEnd/app/components/map/factories/controlPanelSelection.factory.js",
        "frontEnd/app/components/map/factories/palmsBamboos.factory.js",
        "frontEnd/app/components/map/factories/managementArea.factory.js",
        "frontEnd/app/components/map/factories/area.factory.js",
        "frontEnd/app/components/map/factories/troubleTickets.factory.js",
        "frontEnd/app/components/map/factories/equipmentLogs.factory.js",
        "frontEnd/app/components/map/factories/vines.factory.js",
        "frontEnd/app/components/map/factories/knownMomentariesFeederOutages.factory.js",
        "frontEnd/app/components/map/factories/openConditionAssessments.factory.js",
        "frontEnd/app/components/map/factories/lightnings.factory.js",
        "frontEnd/app/components/map/factories/lightningsYTD.factory.js",
        "frontEnd/app/components/map/factories/faults.factory.js",
        "frontEnd/app/components/map/factories/grids.factory.js",
        "frontEnd/app/components/map/factories/grid.factory.js",
        "frontEnd/app/components/map/factories/cme.factory.js",
        "frontEnd/app/components/map/factories/alsEvents.factory.js",
        "frontEnd/app/components/map/factories/map.factory.js",
        "frontEnd/app/components/map/factories/fci.factory.js",
        "frontEnd/app/components/map/factories/feederFailPoint.factory.js",
        "frontEnd/app/components/map/factories/complaints.factory.js",
        "frontEnd/app/components/map/factories/momCount.factory.js",
        "frontEnd/app/components/map/factories/highVoltageTx.factory.js",
        "frontEnd/app/components/map/factories/investigation.factory.js",

        "frontEnd/app/components/map/modals/mit-matrix.controller.js",

        "frontEnd/app/components/home/home.controller.js",
        "frontEnd/app/components/map/map.controller.js"
    ],
    cssFiles = [
        //framework styles
        "frontEnd/assets/libs/bootstrap/bootstrap.min.css",
		"frontEnd/assets/libs/leaflet/leaflet.css",
		"frontEnd/assets/libs/leaflet-groupedlayercontrol/leaflet.groupedlayercontrol.min.js",
		"frontEnd/assets/libs/Leaflet-IconLayers-master/iconLayers.css",
        "frontEnd/assets/libs/angular/rzslider.css",
        "frontEnd/assets/libs/sidebar-v2-master/leaflet-sidebar.css"
    ];
gulp.task('testServices', function () {
    gulp.src('./test/backend.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}))
});
gulp.task('deploy', function() { // ['publish'], function() {
    var arg = argv.server || '';
    if (!arg) {
        console.log('No server argument found. Ex. gulp deploy --server prod1');
        return;
    }
    var srvr = _.find(config.webServers, function (s) { return s.name === arg; });

    if (!srvr) {
        console.log('Unknown server ' + argv.server + '\nYou can deploy to the following webServers from the config file:');
        console.log(_.map(config.webServers, 'name').join('\n'));
        return;
    }

    var cnt = 0;
    return gulp.src([
        '**/*',
        '!bin{,/**}',
        '!node_modules{,/**}',
        '!obj{,/**}',
        '!SQL{,/**}',
        '!frontEnd/**/*.js',
        '!frontEnd/**/*.css}',
        '!**.njsproj',
        '!**.zip',
        '!**.sln',
        '!gonextgrid.sh'
    ])
      .pipe(scp({
            host: srvr.host,
            username: srvr.username,
            password: srvr.password,
            dest: srvr.dest,
            watch: function(client) {
                client.on('write', function (o) {
                    console.log('write %s', o.destination);
                    cnt++;
                });
            }
        }))
        // .on('mkdir', function(dir) {
        //     console.log('Creating directory ' + dir);
        // })
        .on('error', function(err) {
            console.log(err);
        })
        .on('end', function(e) {
            console.log('Deployed ' + cnt + ' files to ' + srvr.host);
            // console.log("Killing and restarting nextgrid process...");
            // var cmd = 'bash ' + srvr.dest + 'killnextgrid.sh';
            // console.log(cmd);
            // exec(cmd, {
            //     user: srvr.username,
            //     host: srvr.host,
            //     //key: myKeyFileOrBuffer,
            //     password: srvr.password }, function (err, stdout, stderr) {
            //         if (err)
            //             console.log(err);
            //         //console.log(err, stdout, stderr);
            //         var cmd2 = 'bash ' + srvr.dest + 'gonextgrid.sh';
            //         console.log('Starting gonextgrid.sh...');
            //         exec(cmd2, {
            //             user: srvr.username,
            //             host: srvr.host,
            //             //key: myKeyFileOrBuffer,
            //             password: srvr.password }, function (err, stdout, stderr) {
            //             if (err)
            //                 console.log('gonextgrid error: ' + err);
            //             console.log(err, stdout, stderr);
            //         });
            //
            //     });
        });
});
gulp.task('write-backend-port', function () {
    var arg = argv.server || '';
    var srvr = {};
    var port = 8080;
    if (arg) {
        srvr = _.find(config.webServers, function (s) {
            return s.name === arg;
        });
        port = srvr.port;
    }
    var lngth = port.toString().length;
    //console.log(lngth);
    gulp.src('config.js')
        .pipe(replace(/NEXTGRID_WEBSERVER_PORT:(.{4})/g, 'NEXTGRID_WEBSERVER_PORT:' + port))
        .pipe(gulp.dest('.'));
});
gulp.task('publish', ['concat-css', 'write-backend-port'], function(){   // 'testServices'
    console.log('-- ');
    console.log('-- ');
    console.log('-- Creating compact nextgrid.min.js file');
    console.log('-- ');
    var arg = argv.server || '';
    var srvr = {};
    var port = 8080;

    if (arg) {
        srvr = _.find(config.webServers, function (s) {
            return s.name === arg;
        });
        port = srvr.port;
    }
    console.log('-- Writing port ' + port);
    // console.log('-- You need to run \'gulp deploy\' to deploy to a server');
    // console.log('\n-- like: gulp deploy --server dev');
    // console.log('-- ');

    // gulp.src('config.js')
    //     .pipe(header('var NEXTGRID_WEBSERVER_PORT=' + (port) + ';'));

    return streamqueue({ objectMode: true},
        compileJSFrameworks(),
        compileJSInternal()
    )

        .pipe(strip())
        //.pipe(babel())
        .pipe(uglify({mangle: false}))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(concat('nextgrid.js'))
        .pipe(header('var NEXTGRID_WEBSERVER_PORT=' + (port) + ';'))
        .pipe(rename({ suffix: '.min'} ))

        .pipe(gulp.dest('build/js'))
});

gulp.task('concat-js', function(){ // running locally on port 80
    return streamqueue({ objectMode: true},
        compileJSFrameworks(),
        compileJSInternal()
    )
        .pipe(sourcemaps.init())
        //.pipe(babel({ presets: ['es2015'] }))
        .pipe(concat('nextgrid.js'))
        .pipe(rename({ suffix: '.min'} ))
        .pipe(header('var NEXTGRID_WEBSERVER_PORT=80;'))
        //.pipe(uglify())
        //.pipe(sourcemaps.write())
        //.pipe(ngAnnotate())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/js'))
});

function compileJSFrameworks() {
    return gulp.src(jsFrameworkFiles)
}

function compileJSInternal(){
    return gulp.src(jsInternalFiles);
}

gulp.task('concat-css', function(){
    return es.merge(compileExternalCSSFrameworks(), compileInternalCSS())
        .pipe(cleanCSS())
        .pipe(concat('nextgrid.css'))
        .pipe(rename({ suffix: '.min'} ))
        .pipe(gulp.dest('build/css'));
});

function compileExternalCSSFrameworks() {
    return gulp.src(cssFiles);
}

function compileInternalCSS() {
    return gulp.src('frontEnd/assets/css/**/*.scss')
        .pipe(sass().on('error', sass.logError));
}

gulp.task('watch', function() {
    // Serve files from the root of this project
    // browserSync.init({
    //     port: 8080,
    //     server: {
    //         baseDir: "./frontEnd",
    //         index: "nextGrid.html"
    //     }
    // });
    gulp.watch(['frontEnd/**/*.html'], ['concat-js', 'concat-css']);
    gulp.watch(['frontEnd/js/**/*.js', 'frontEnd/other/**/*.js', 'frontEnd/assets/libs/**/*.js', 'frontEnd/app/**/*.js'], ['concat-js']);
    gulp.watch(['frontEnd/css/**/*.css', 'frontEnd/assets/css/**/*.scss'], ['concat-css']);
});

gulp.task('default', ['concat-js', 'concat-css', 'watch'], function() {
    console.log('-- Gulp is now watching /frontEnd/js, /frontEnd/css and /frontEnd/other');
    console.log('-- NextGrid runs from /build now');
    console.log('-- ');
    console.log('-- ');
    console.log('-- You need to run \'gulp publish\' before you deploy to a server');
    console.log('-- ');
    //console.log('-- like: gulp publish --server dev');
    console.log('-- ');
});

