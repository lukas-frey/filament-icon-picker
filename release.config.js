module.exports = {
    "plugins": [
        ["@semantic-release/commit-analyzer", {
            "preset": "conventionalcommits",
            "releaseRules": [
                {"type": "docs", "scope":"README", "release": "patch"},
                {"type": "refactor", "release": "patch"},
                {"type": "chore", "release": "patch"},
                {"type": "style", "release": "patch"},
                {"type": "test", "release": "patch"},
                {"type": "perf", "release": "patch"}
            ],
            "presetConfig": {
                "types": [
                    {"type": "feat", "section": "Features"},
                    {"type": "fix", "section": "Bug Fixes"},
                    {"type": "chore", "hidden": true},
                    {"type": "docs", "hidden": true},
                    {"type": "style", "hidden": true},
                    {"type": "refactor", "hidden": true},
                    {"type": "perf", "hidden": true},
                    {"type": "test", "hidden": true}
                ]
            }
        }],
        ["@semantic-release/release-notes-generator", {
            "preset": "conventionalcommits"
        }],
        ["@semantic-release/github", {
            "assets": [
                {"path": "dist/plugin.css", "label": "CSS distribution"},
            ]
        }],
        ["@semantic-release/changelog",
            {
                "changelogFile": "CHANGELOG.md"
            }
        ],
        ["@semantic-release/npm", {
            "tarballDir": "release",
            "npmPublish": false
        }],
    ],
    "branches": ["main", "next"],
    "tagFormat": "${version}"
}
