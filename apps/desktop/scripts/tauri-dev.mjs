import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { isAbsolute, relative, resolve, sep } from "node:path";

const require = createRequire(import.meta.url);
const tauriCli = require.resolve("@tauri-apps/cli/tauri.js");
const env = { ...process.env };

const applyLinuxSnapWorkaround = () => {
  const snapRootFromPath = (path) => {
    const parts = resolve(path).split(sep);
    const snapIndex = parts.lastIndexOf("snap");

    if (snapIndex === -1 || parts.length <= snapIndex + 2) {
      return undefined;
    }

    return resolve(sep, ...parts.slice(1, snapIndex + 3));
  };

  const snapRoot = env.SNAP
    ? resolve(env.SNAP)
    : [env.GTK_PATH, env.GIO_MODULE_DIR, env.GSETTINGS_SCHEMA_DIR]
        .filter(Boolean)
        .map(snapRootFromPath)
        .find(Boolean);

  if (!snapRoot) {
    return;
  }

  const relativeProject = relative(snapRoot, process.cwd());
  const projectInsideSnap =
    relativeProject === "" ||
    (!relativeProject.startsWith(`..${sep}`) &&
      relativeProject !== ".." &&
      !isAbsolute(relativeProject));

  if (!projectInsideSnap) {
    delete env.GTK_PATH;
    delete env.GIO_MODULE_DIR;
    env.GDK_BACKEND = "x11";
  }
};

if (process.platform === "linux") {
  applyLinuxSnapWorkaround();
}

const child = spawn(
  process.execPath,
  [tauriCli, "dev", ...process.argv.slice(2)],
  {
    env,
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error("Failed to start the Tauri CLI:", error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code ?? 1;
  }
});
