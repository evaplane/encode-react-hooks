const commonConfig = require('../../gulpfile');
const gulp = require('gulp');
const fs = require('fs');
const fse = require('fs-extra');
const fg = require('fast-glob');
const gm = require('gray-matter');
const { log } = require('console');

async function genDesc(mdPath) {
  if (!fs.existsSync(mdPath)) {
    return;
  }
  const mdFile = fs.readFileSync(mdPath, 'utf8');
  
  const { content } = gm(mdFile);
  let description =
    (content.replace(/\r\n/g, '\n').match(/# \w+[\s\n]+(.+?)(?:, |\. |\n|\.\n)/m) || [])[1] || '';

  description = description.trim();
  console.log('description:', description)
  description = description.charAt(0).toLowerCase() + description.slice(1);
  return description;
}

async function genMetaData() {
  const metadata = {
    functions: [],
  };
  const hooks = fg
    .sync('src/use*', {
      onlyDirectories: true,
    })
    .map((hook) => hook.replace('src/', ''))
    .sort();
  console.log('hooks:', hooks)
  await Promise.allSettled(
    hooks.map(async (hook) => {
      const description = await genDesc(`src/${hook}/index.md`);
      return {
        name: hook,
        description,
      };
    }),
  ).then((res) => {
    metadata.functions = res.map((item) => {
      if (item.status === 'fulfilled') {
        return item.value;
      }
      return null;
    });
  });
  return metadata;
}

gulp.task('metadata', async function () {
  const metadata = await genMetaData();
  await fse.writeJson('metadata.json', metadata, { spaces: 2 });
});

exports.default = gulp.series(commonConfig.default, 'metadata');
