module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        src: {
            js: ['public/scripts/**/*.js']
        },
        jshint: {
            files:['Gruntfile.js', '<%= src.js %>'],
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
        }
    });

    grunt.registerTask('test', [
        'jshint'
    ]);
};
