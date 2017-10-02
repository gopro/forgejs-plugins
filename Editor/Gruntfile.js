module.exports = function(grunt)
{
    var sourceFiles =
    [
        "src/Editor.js",
        "src/EditorHistory.js",
        "src/EditorUI.js",
        "src/EditorUIPanel.js",
        "src/EditorUIItem.js",
        "src/EditorUIGroup.js",
        "src/EditorUIVector3.js",
        "src/EditorUINumber.js",
        "src/EditorUITransformButton.js",
        "src/EditorButtonPanel.js",
        "src/EditorHierarchyPanel.js",
        "src/EditorHistoryPanel.js",
        "src/EditorTransformHelper.js",
        "src/EditorTransformInspector.js",
        "src/EditorTransformPanel.js",
        "src/EditorGeometryPanel.js",
        "src/EditorHUD.js",
        "src/EditorDialogBox.js"
    ];

    grunt.initConfig(
    {
        pkg: grunt.file.readJSON("package.json"),

        clean:
        {
            build: ["build/*"]
        },

        concat:
        {
            options: {},

            build:
            {
                src: sourceFiles,
                dest: "build/forge.editor.js"
            }
        },

        uglify:
        {
            options:
            {
                mangle: false
            },

            build:
            {
                files: { "build/forge.editor.min.js": ["build/forge.editor.js"] }
            }
        },

        watch:
        {
            build:
            {
                files:
                [
                    "src/*",
                    "Gruntfile.js"
                ],

                tasks: ["build"]
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Main build task
    grunt.registerTask("build",
    [
        "clean:build",
        "concat:build",
        "uglify:build"
    ]);

    grunt.registerTask("default", ["build"]);
};
