// scripts/syncStatic.mjs
import fs from 'fs';
import path from 'path';

const srcStaticDir = path.join(process.cwd(), 'static');
const destStaticDir = path.join(process.cwd(), 'public', 'static');

try {
  // 1. 古い public/static を一度きれいに削除
  if (fs.existsSync(destStaticDir)) {
    fs.rmSync(destStaticDir, { recursive: true, force: true });
  }
  // 2. ルート直下の static フォルダを public/static へ丸ごとコピー
  if (fs.existsSync(srcStaticDir)) {
    fs.cpSync(srcStaticDir, destStaticDir, { recursive: true });
    console.log('✅ static フォルダを public/static へコピーしました。');
  }
} catch (err) {
  console.error('フォルダのコピーに失敗しました:', err);
  process.exit(1);
}

// 3. コピーされた最新のフォルダから files.json を作成
const staticFilesJson = getStaticFilesJson();
fs.writeFileSync(path.join(destStaticDir, 'files.json'), staticFilesJson, 'utf8');
console.log('✅ public/static/files.json を正常に生成しました。');

function collectStaticFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectStaticFiles(entryPath, files);
    } else if (entry.isFile()) {
      files.push(normalizePath(path.relative(process.cwd(), entryPath)));
    }
  }
  return files;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function getStaticFilesJson() {
  const staticFiles = { bots: {}, wordTags: [] };

  // スキャン対象は新しくコピーされた public/static/bots
  const botsDir = path.join(process.cwd(), 'public', 'static', 'bots');
  if (fs.existsSync(botsDir)) {
    for (const entry of fs.readdirSync(botsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const botName = entry.name;
      const partPaths = [];
      collectStaticFiles(path.join(botsDir, botName), partPaths);

      const normalizedPartPaths = partPaths
        .map((filePath) => {
          const urlPath = `/${normalizePath(filePath)}`;
          return urlPath.replace(/^\/public\/static\//, '/static/');
        })
        .filter((urlPath) => urlPath.startsWith(`/static/bots/${botName}/`) && /\.(episode|orchestrator)\.json$/i.test(urlPath))
        .sort();

      if (normalizedPartPaths.length > 0) {
        console.log(botName, normalizedPartPaths);
        staticFiles.bots[botName] = normalizedPartPaths;
      }
    }
  }

  const tagsDir = path.join(process.cwd(), 'public', 'static', 'tags');
  if (fs.existsSync(tagsDir)) {
    const tagFiles = [];
    collectStaticFiles(tagsDir, tagFiles);
    staticFiles.wordTags = tagFiles
      .map((filePath) => {
        const urlPath = `/${normalizePath(filePath)}`;
        return urlPath.replace(/^\/public\/static\//, '/static/');
      })
      .filter((urlPath) => /(^|\/)[^/]+\.json$/i.test(urlPath))
      .sort();
  }

  return JSON.stringify(staticFiles);
}
