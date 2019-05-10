import { GithublintSchemaJson } from "../types/schema"

export const defaultConfig: GithublintSchemaJson = {
  $schema: "../schema/githublint.schema.json#",
  github: {
    enabled: true
  },
  owners: [
    {
      name: "*",
      repositories: [
        {
          name: "*",
          branches: [
            {
              name: "*",
              content: [
                {
                  name: "AWS CodeBuild Configuration",
                  filter: { path: "buildspec.yml" },
                  disposition: "required"
                },
                {
                  name: "Travis CI Configuration",
                  filter: { path: "travis.yml" },
                  disposition: "required"
                },
                {
                  name: "Readme Markdown",
                  filter: { path: "README.md" },
                  disposition: "required"
                },
                {
                  name: "SonarQube Configuration",
                  filter: { path: "sonar-project.properties" },
                  disposition: "required"
                },
                {
                  name: "GuthubLint Configuration",
                  filter: { path: "githublint.json" },
                  disposition: "optional"
                }
              ]
            },
            {
              name: "master"
            }
          ]
        }
      ],
      languages: [
        {
          name: "typescript",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                    {
                      name: "Typescript Configuration",
                      filter: { path: "tsconfig.json" },
                      disposition: "required",
                      detection: true
                    },
                    {
                      name: "TSLint Configuration",
                      filter: { path: "tslint.json" },
                      disposition: "required",
                      detection: true
                    },
                    {
                      name: "Yarn Lock File",
                      filter: { path: "yarn.lock" },
                      disposition: "required"
                    },
                    {
                      name: "NPM Package Configuration",
                      filter: { path: "package.json" },
                      disposition: "required"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "kotlin",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                    {
                      name: "Gradle w/Kotlin",
                      filter: "build.gradle",
                      disposition: "required",
                      detection: true,
                      innertext: "org.jetbrains.kotlin:kotlin-gradle-plugin"
                    },
                    {
                      name: "Gradle Configuration",
                      filter: { path: "settings.gradle" },
                      disposition: "required"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "swift",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                    {
                      name: "Pod Configuration",
                      filter: { path: "Podfile" },
                      disposition: "required"
                    },
                    {
                      name: "Pod Lock File",
                      filter: { path: "Podfile.lock" },
                      disposition: "required"
                    },
                    {
                      name: "Gem Configuration",
                      filter: { path: "Gemfile" },
                      disposition: "required"
                    },
                    {
                      name: "Gem Lock File",
                      filter: { path: "Gemfile.lock" },
                      disposition: "required"
                    },
                    {
                      name: "XCode Workspace",
                      filter: { path: ".xcworkspace$" },
                      disposition: "required",
                      detection: true,
                      folder: true
                    },
                    {
                      name: "XCode Project",
                      filter: { path: ".xcodeproj$" },
                      disposition: "required",
                      detection: true,
                      folder: true
                    },
                    {
                      name: "Fastlane Configuration",
                      filter: { path: "^fastlane$" },
                      disposition: "required",
                      folder: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "android",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                    {
                      name: "Gradle w/Android",
                      filter: { path: "build.gradle" },
                      disposition: "required",
                      detection: true,
                      innertext: "com.android.tools.build:gradle"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "gradle",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                    {
                      name: "Gradle Configuration",
                      filter: { path: "build.gradle" },
                      disposition: "required",
                      detection: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "react",
          repositories: [
            {
              name: "*",
              branches: [
                {
                  name: "*",
                  content: [
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
