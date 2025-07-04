import fs from "fs-extra"; //操作文件，fs 的扩展
import { execa } from "execa"; // 在子进程中运行脚本
import { globbySync } from "globby";
import { orderBy } from "lodash-es";

const MD_HEADER = `# FE-MindMap

千浔的前端知识图谱（用思维导图的方式总结个人所学知识），如有引用请标注原作者

## 预览地址

## 目录

`;
const MD_FOOTER = `\n`;

function getXmindList(directory = "") {
  return globbySync(`${directory}/**/*.(xmind)`, {
    objectMode: true,
  }).map(({ name, path }) =>
    execa("git", ["log", "--pretty=format:%ad", "--date=short", path]).then((res) => {
      const time = res.stdout.split("\n");
      return {
        name: name.replace(".xmind", ""),
        path,
        updateTime: time.at(0),
        createdTime: time.at(-1),
      };
    })
  );
}

function generateList(list) {
  if (!list.length) {
    return "";
  }

  return orderBy(
    list.filter((item) => item.updateTime),
    ["updateTime"],
    ["desc"]
  )
    .map(
      (item) =>
        `- [x] [${
          item.name
        } <img alt="" height="16" src="https://img.shields.io/github/size/maomao1996/FE-MindMap/${encodeURI(
          item.path
        )}" align="center" />](/${encodeURI(item.path)})
  - 创建时间: ${item.createdTime}
  - 更新时间: ${item.updateTime}`
    )
    .join("\n");
}

try {
  // 组装 MD 头部
  let md = MD_HEADER;

  // 组装列表数据
  const result = await Promise.all(getXmindList("xmind"));
  md += generateList(result);

  // 组装 MD 尾部
  md += MD_FOOTER;

  // 写入 README.md 文件
  fs.writeFile("README.md", md, "utf8")
    .then(() => {
      console.log("README.md 文件创建成功");
    })
    .catch(() => {
      console.log("README.md 文件创建失败");
    });
} catch (error) {
  console.log("catch error :>> ", error);
}
