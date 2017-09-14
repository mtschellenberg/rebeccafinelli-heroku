#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        self.port = process.env.PORT || 8080;
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/finearts/*'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/medical/*'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/download/:siteFolder/:file?'] = function(req, res) {
            var path = './data/' + req.params.siteFolder + '/' + req.params.file;
            res.download(path);
        };

        self.routes['/folder/:siteFolder/:dataFolder?'] = function(req, res) {
            console.log('folder / ' + req.params.siteFolder + ' / ' + req.params.dataFolder);
            var path = './data/' + req.params.siteFolder + (req.params.dataFolder ? '/' + req.params.dataFolder : '');
            fs.readdir(path, function(error, files) {
                res.setHeader('Content-Type', 'text/html');
                if(req.params.dataFolder) {
                  console.log('  return ' + files);
                  res.send(files);
                }
                else {
                  console.log('  only directories');
                  var folders = (files || []).filter(function(file) {
                      var stat = fs.statSync(path + '/' + file);
                      console.log('  file ' + file + ' is directory? ' + stat.isDirectory());
                      return stat.isDirectory();
                  });
                  console.log('  return ' + folders);
                  res.send(folders);
                }
            });
        };

        self.routes['/read/:siteFolder/:fileOrFolder/:lastFile?'] = function(req, res) {
            console.log('read / ' + req.params.siteFolder + ' / ' + req.params.fileOrFolder + ' / ' + req.params.lastFile);
            var path = './data/' + req.params.siteFolder + '/' + req.params.fileOrFolder + (req.params.lastFile ? '/' + req.params.lastFile : '');
            fs.readFile(path, function(error, data) {
                res.setHeader('Content-Type', 'text/html');
                console.log('  return ' + data);
                res.send(data);
            });
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        /*
        self.app.configure(function () {
          self.app.use(express.bodyParser());
          self.app.use(express.methodOverride());
          self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        });
        */

        self.app.use('/data', express.static(__dirname + '/data'));
        self.app.use('/images', express.static(__dirname + '/images'));
        self.app.use('/src', express.static(__dirname + '/src'));
        self.app.use('/style', express.static(__dirname + '/style'));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            console.log('Adding route ' + r);
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

