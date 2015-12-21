// Karma configuration
// Generated on Sat Dec 19 2015 12:50:43 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],


    // list of files / patterns to load in the browser
    files: [
      'test/specs/*.js',
      {pattern: 'test/assets/*.*', watched: false, included: false, served: true, nocache: false}
    ],

    proxies: {
      '/assets/': '/base/test/assets/'
    },


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/specs/*.js': [ 'browserify' ]
    },

    browserify: {
      debug: true,
      transform: [
        ['stringify', {'extensions': ['.vert', '.frag']}]
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],//, 'Firefox', 'Safari'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,


    // SL and travis config
    sauceLabs: {
      startConnect: true,
      testName: 'eagl unit tests'
    },

    // define SL browsers
    customLaunchers: {

      // OSX Maverick

      // 'SL_Chrome44_OSX10_10': {
      //   base: 'SauceLabs',
      //   browserName: 'chrome',
      //   version: '44',
      //   platform: 'OS X 10.10'
      // },
      // 'SL_Firefox38_OSX10_10': {
      //   base: 'SauceLabs',
      //   browserName: 'firefox',
      //   version: '38',
      //   platform: 'OS X 10.10'
      // },
      // 'SL_Firefox42_OSX10_10': {
      //   base: 'SauceLabs',
      //   browserName: 'firefox',
      //   version: '42',
      //   platform: 'OS X 10.10'
      // },
      // 'SL_Safari': {
      //   base: 'SauceLabs',
      //   browserName: 'safari',
      //   platform: 'OS X 10.10',
      //   version: '8'
      // },

      // //Win 8.1
      // 'SL_Chrome44_WIN81': {
      //   base: 'SauceLabs',
      //   browserName: 'chrome',
      //   version: '44',
      //   platform: 'Windows 8.1'
      // },

      // 'SL_Firefox_WIN81': {
      //   base: 'SauceLabs',
      //   browserName: 'firefox',
      //   version: '27',
      //   platform: 'Windows 8.1'
      // },

      //Linux
      // 'SL_Chrome_NIX': {
      //   base: 'SauceLabs',
      //   browserName: 'chrome',
      //   version: '32',
      //   platform: 'Linux'
      // },
      // 'SL_Firefox_NIX': {
      //   base: 'SauceLabs',
      //   browserName: 'firefox',
      //   version: '27',
      //   platform: 'Linux'
      // },
      'SL_Chrome_OSX9': {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '31',
        platform: 'OS X 10.9'
      },
      'SL_win10_Edge': {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '20.10240'
      },
    },
  });

  if( process.env.TRAVIS ) {

    var browsers = [];
    for( var browser in config.customLaunchers ){
      browsers.push( browser );
    }
    config.browsers = browsers;

    config.autoWatch = false;
    config.singleRun = true;

  }
};
