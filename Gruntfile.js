module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        src: {
            js: ['public/scripts/**/*.js']
        },
        test: {
            js: ['test/spec/**/*.js']
        },
        jshint: {
            files:['Gruntfile.js', '<%= src.js %>', '<%= test.js %>'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                unused: false,
                browser: true,
                jquery: true,
                globals: {
                    angular: true,
                    console: true
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    grunt.registerTask('test', [
        'karma',
        'jshint'
    ]);
};
