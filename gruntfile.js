module.exports = function (grunt) {

    grunt.initConfig({
        less: {
            default: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "res/smarthome.min.css": "client/less/main.less"
                }
            }
        },

        handlebars: {
            default: {
                options: {
                    namespace: 'Smarthome.Templates',
                    processName: function (filePath) {
                        var pieces = filePath.split("/");
                        console.log(filePath);
                        return pieces[pieces.length - 1].replace(/\.hbs$/, '');
                    }
                },
                files: {
                    "client/js/templates.js": ["client/templates/*.hbs"]
                }
            }
        },

        uglify: {
            default: {
                screwIE8: true,
                files: {
                    'res/smarthome.min.js': [
                        'client/js/jquery-2.1.1.js',
                        'client/js/jgestures.js',
                        'client/js/handlebars-runtime.js',
                        'client/js/templates.js',
                        'client/js/moment.min.js',
                        'client/js/highcharts.js',
                        'client/js/smarthome.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-handlebars');

    grunt.registerTask('default', ['handlebars', 'less', 'uglify']);

};