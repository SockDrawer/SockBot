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
	githubPages: {
		docs: {
			options: {
				// The default commit message for the gh-pages branch
				commitMessage: 'push documentation automatically'
			},
			// The folder where your gh-pages repo is
			src: 'docs'
		}
	}
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-github-pages');

  // Default task(s).
  grunt.registerTask('generate-docs', ['gitclone:docs', 'jsdoc', 'githubPages:docs']);

};