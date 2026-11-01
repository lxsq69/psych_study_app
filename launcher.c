#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <libgen.h>
#include <limits.h>

int main(int argc, char *argv[]) {
    char exe_path[PATH_MAX];
    ssize_t len = readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
    
    char app_dir[PATH_MAX];
    if (len != -1) {
        exe_path[len] = '\0';
        char *dir = dirname(exe_path);
        strncpy(app_dir, dir, sizeof(app_dir) - 1);
        app_dir[sizeof(app_dir) - 1] = '\0';
    } else {
        // Fallback default
        strncpy(app_dir, "/home/val/psych_study_app", sizeof(app_dir) - 1);
    }

    // Change current directory to app_dir so all relative paths resolve
    if (chdir(app_dir) != 0) {
        perror("Failed to change directory to app directory");
    }

    char script_path[PATH_MAX];
    snprintf(script_path, sizeof(script_path), "%s/launcher.py", app_dir);

    // Prepare execution arguments: python3 <script_path> [extra args...]
    char *new_argv[argc + 3];
    new_argv[0] = "python3";
    new_argv[1] = script_path;
    for (int i = 1; i < argc; i++) {
        new_argv[i + 1] = argv[i];
    }
    new_argv[argc + 1] = NULL;

    // Replace current process with python3 running the launcher
    execvp("/usr/bin/python3", new_argv);

    // Fallback if /usr/bin/python3 is not direct path
    execvp("python3", new_argv);

    perror("Failed to execute launcher.py with python3");
    return 1;
}
