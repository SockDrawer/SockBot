module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	gitclone: {
		docs: {
			options: {
				directory: "docs",
				repository: "https://github.com/SockDrawer/SockBot.git",
				branch: "gh-pages"
			}
		}
	},
	jsdoc : {
        dist : {
            src: ['*.js', 'sock-modules/**/*.js'],
            options: {
                destination: 'docs'
            }
        }
    },
	'gh-pages': {
		options: {
			// The default commit message for the gh-pages branch
			base: 'docs',
			message: 'push documentation automatically',
			repo: 'https://' + process.env.GH_TOKEN + '@github.com/SockDrawer/SockBot'
		},
		src: "**"
	}
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-gh-pages');

  // Default task(s).
  grunt.registerTask('generate-docs', ['jsdoc', 'gh-pages']);
  grunt.registerTask('default', ['jsdoc', 'gh-pages']);

};
