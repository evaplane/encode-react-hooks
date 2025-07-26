const commonConfig = require('../../gulpfile');
const gulp = require('gulp')
const fs = require('fs')
const fse = require('fs-extra')
const fg = require('fast-glob') // 找到指定文件/目录，获取里面的内容 
const gm = require('gray-matter'); // 解析文件内容

function generateDesc(mdPath){
	// 没有markdown路径就不生成
	if(!fs.existsSync(mdPath)){
		return;
	}

	const mdFile = fs.readFileSync(mdPath, 'utf8');

	const {content} = gm(mdFile);
	// 1、确保换行符统一为\n
	// # 标题符号 \w+匹配标题中的单词
	// [\s\n]+ 匹配标题中的空白符号或者换行
	// (.+?) 要提取的描述文本
	// /m 多行模式
	// [] 如果match返回null，就用[]空数组避免报错
	// [1]捕获第一个组，若无则返回字符串
	/**
	 * # Project Name
	 * This is a description, with some details.
	 * 最终返回This is a description
	 */
	let description =
    (content.replace(/\r\n/g, '\n').match(/# \w+[\s\n]+(.+?)(?:, |\. |\n|\.\n)/m) || [])[1] || '';
	description.trim();
	return description;
}

function getMetaData(){
	const metadata = {
        functions: []
    }
    // 1. fetch all function directories
	const hooks = fg.sync('src/use*', {
        onlyDirectories: true
    }).map(hook => hook.replace('src/', ''))

	return hooks.map((hook) => {
		const description = generateDesc(`src/${hook}/index.md`);
		return {
			name: hook,
            description
		}
	})
    
}

gulp.task('metadata', async () => {
	// 1.generate metadata
	const metadata = getMetaData();
	// 2. write metadata to a file
	fse.writeJson('metadata.json', metadata, {spaces: 2});
})

exports.default = gulp.series(commonConfig.default,'metadata')