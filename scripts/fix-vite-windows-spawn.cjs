const fs = require('node:fs');
const path = require('node:path');

const targets = [
  path.join(
    process.cwd(),
    'node_modules',
    'astro',
    'node_modules',
    'vite',
    'dist',
    'node',
    'chunks',
    'dep-Dm0c1Wj2.js',
  ),
  path.join(
    process.cwd(),
    'node_modules',
    'astro',
    'node_modules',
    'vite',
    'dist',
    'node-cjs',
    'publicUtils.cjs',
  ),
];

const replacements = [
  {
    from:
      'function optimizeSafeRealPathSync() {\n' +
      '  const nodeVersion = process.versions.node.split(".").map(Number);\n' +
      '  if (nodeVersion[0] < 18 || nodeVersion[0] === 18 && nodeVersion[1] < 10) {\n' +
      '    safeRealpathSync = fs__default.realpathSync;\n' +
      '    return;\n' +
      '  }\n' +
      '  try {\n' +
      '    fs__default.realpathSync.native(path$b.resolve("./"));\n' +
      '  } catch (error) {\n' +
      '    if (error.message.includes("EISDIR: illegal operation on a directory")) {\n' +
      '      safeRealpathSync = fs__default.realpathSync;\n' +
      '      return;\n' +
      '    }\n' +
      '  }\n' +
      '  exec("net use", (error, stdout) => {\n' +
      '    if (error) return;\n' +
      '    const lines = stdout.split("\\n");\n' +
      '    for (const line of lines) {\n' +
      '      const m = parseNetUseRE.exec(line);\n' +
      '      if (m) windowsNetworkMap.set(m[2], m[1]);\n' +
      '    }\n' +
      '    if (windowsNetworkMap.size === 0) {\n' +
      '      safeRealpathSync = fs__default.realpathSync.native;\n' +
      '    } else {\n' +
      '      safeRealpathSync = windowsMappedRealpathSync;\n' +
      '    }\n' +
      '  });\n' +
      '}',
    to:
      'function optimizeSafeRealPathSync() {\n' +
      '  safeRealpathSync = fs__default.realpathSync.native;\n' +
      '}',
  },
  {
    from:
      'function optimizeSafeRealPathSync() {\n' +
      '  const nodeVersion = process.versions.node.split(".").map(Number);\n' +
      '  if (nodeVersion[0] < 18 || nodeVersion[0] === 18 && nodeVersion[1] < 10) {\n' +
      '    safeRealpathSync = fs$1.realpathSync;\n' +
      '    return;\n' +
      '  }\n' +
      '  try {\n' +
      '    fs$1.realpathSync.native(path$1.resolve("./"));\n' +
      '  } catch (error) {\n' +
      '    if (error.message.includes("EISDIR: illegal operation on a directory")) {\n' +
      '      safeRealpathSync = fs$1.realpathSync;\n' +
      '      return;\n' +
      '    }\n' +
      '  }\n' +
      '  exec("net use", (error, stdout) => {\n' +
      '    if (error) return;\n' +
      '    const lines = stdout.split("\\n");\n' +
      '    for (const line of lines) {\n' +
      '      const m = parseNetUseRE.exec(line);\n' +
      '      if (m) windowsNetworkMap.set(m[2], m[1]);\n' +
      '    }\n' +
      '    if (windowsNetworkMap.size === 0) {\n' +
      '      safeRealpathSync = fs$1.realpathSync.native;\n' +
      '    } else {\n' +
      '      safeRealpathSync = windowsMappedRealpathSync;\n' +
      '    }\n' +
      '  });\n' +
      '}',
    to:
      'function optimizeSafeRealPathSync() {\n' +
      '  safeRealpathSync = fs$1.realpathSync.native;\n' +
      '}',
  },
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    continue;
  }

  let source = fs.readFileSync(target, 'utf8');
  let changed = false;

  for (const replacement of replacements) {
    if (source.includes(replacement.from)) {
      source = source.replace(replacement.from, replacement.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(target, source, 'utf8');
    console.log(`patched ${path.relative(process.cwd(), target)}`);
  }
}
