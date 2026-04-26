import * as fs from 'fs-extra';
import * as path from 'path';
import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });

const visited = new Set<string>();
const filesToBundle = new Set<string>();

const aliasRoot = path.resolve('./src');
const srcRoot = path.resolve('./src');
const outDir = path.resolve('./npm-package/constants');

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveImportPath(moduleSpec: string, currentFile: string): string | null {
  if (moduleSpec.startsWith('@/')) {
    return path.resolve(aliasRoot, moduleSpec.slice(2));
  }
  if (moduleSpec.startsWith('.')) {
    return path.resolve(path.dirname(currentFile), moduleSpec);
  }
  return null;
}

function collectWithDeps(filePath: string) {
  const resolved = path.resolve(filePath);
  if (visited.has(resolved)) return;
  visited.add(resolved);

  const sourceFile = project.addSourceFileAtPath(resolved);
  filesToBundle.add(resolved);

  const declarations = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile.getExportDeclarations(),
  ];

  for (const decl of declarations) {
    const moduleSpec = decl.getModuleSpecifierValue?.();
    if (!moduleSpec || (!moduleSpec.startsWith('.') && !moduleSpec.startsWith('@/'))) continue;

    const depFile = decl.getModuleSpecifierSourceFile();
    if (depFile) {
      collectWithDeps(String(depFile.getFilePath()));
      continue;
    }

    const basePath = resolveImportPath(moduleSpec, resolved);
    if (!basePath) continue;

    const candidates = [
      basePath,
      ...['ts', 'tsx', 'js'].flatMap((ext) => [
        `${basePath}.${ext}`,
        path.join(basePath, `index.${ext}`),
      ]),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        collectWithDeps(candidate);
        break;
      }
    }
  }
}

function getOutputPath(filePath: string, constantFiles: Set<string>): string {
  if (constantFiles.has(filePath)) {
    return path.join(outDir, path.basename(filePath));
  }
  return path.join(outDir, path.relative(srcRoot, filePath));
}

function rewriteImports(
  content: string,
  sourceFile: ReturnType<typeof project.getSourceFile>,
  destPath: string,
  constantFiles: Set<string>,
): string {
  for (const importDecl of sourceFile!.getImportDeclarations()) {
    const moduleSpec = importDecl.getModuleSpecifierValue();
    if (!moduleSpec.startsWith('.') && !moduleSpec.startsWith('@/')) continue;

    const depFile = importDecl.getModuleSpecifierSourceFile();
    if (!depFile) continue;

    const depDest = getOutputPath(String(depFile.getFilePath()), constantFiles);
    let rel = path.relative(path.dirname(destPath), depDest).replace(/\.tsx?$/, '');
    if (!rel.startsWith('.')) rel = './' + rel;

    content = content.replace(
      new RegExp(`(['"])(${escapeRegex(moduleSpec)})(['"])`, 'g'),
      `$1${rel}$3`,
    );
  }
  return content;
}

function bundleConstants() {
  const constantFiles = new Set(
    project
      .getSourceFiles()
      .map((f) => String(f.getFilePath()))
      .filter((p) => p.endsWith('.constants.ts')),
  );

  if (constantFiles.size === 0) {
    console.error('No *.constants.ts files found. Check tsconfig paths.');
    process.exit(1);
  }

  console.log(`Found ${constantFiles.size} constants files, resolving dependencies...`);
  for (const filePath of constantFiles) {
    collectWithDeps(filePath);
  }

  const depFiles = [...filesToBundle].filter((f) => !constantFiles.has(f));
  if (depFiles.length > 0) {
    console.log(`Pulling in ${depFiles.length} dependent file(s)`);
  }

  fs.emptyDirSync(outDir);

  for (const file of filesToBundle) {
    const dest = getOutputPath(file, constantFiles);
    fs.ensureDirSync(path.dirname(dest));

    const sourceFile = project.getSourceFile(file)!;
    const content = rewriteImports(fs.readFileSync(file, 'utf-8'), sourceFile, dest, constantFiles);

    fs.writeFileSync(dest, content, 'utf-8');
  }

  console.log(`Bundled ${filesToBundle.size} file(s) to ./npm-package/constants/`);
}

bundleConstants();
