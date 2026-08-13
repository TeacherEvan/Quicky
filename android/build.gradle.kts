allprojects {
    repositories {
        google()
        mavenCentral()
    }
    // Force the Kotlin Gradle Plugin to 2.0.0 (Flutter 3.44.9's bundled version)
    // for every subproject's buildscript classpath. Quicky's plugins
    // (camera_android_camerax 0.7.4+5, image_picker_android, installed_apps) hardcode
    // kotlin 2.2.x/2.3.x via `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$v")`,
    // which crashes the Kotlin compiler under AGP 9.0.1 ("Internal compiler error").
    // 2.0.0 is stable with AGP 9 + Flutter 3.44. Scoped to this build only, so Flutter's
    // own flutter_tools/gradle (kotlin-dsl 6.2.0) is left untouched.
    buildscript {
        configurations.all {
            resolutionStrategy {
                force("org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.0")
            }
        }
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
