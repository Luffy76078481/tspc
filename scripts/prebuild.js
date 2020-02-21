
//replace(" ","")
var fs = require("fs"); //获取fs模块
var glob = require("glob") // 遍歷
// 获取 package.json 环境变量
var isRunStart = process.env.isRunStart;

if(isRunStart){
  console.log("启动中： ( 九山八海、为一世界，聚千界则成‘小千世界’，此界乘三，无我不断者，三刀流奥义，一大‧三千‧大千世界 )"+
  "启动中： ( 九山八海、为一世界，聚千界则成‘小千世界’，此界乘三，无我不断者，三刀流奥义，一大‧三千‧大千世界 )"+
  "启动中： ( 九山八海、为一世界，聚千界则成‘小千世界’，此界乘三，无我不断者，三刀流奥义，一大‧三千‧大千世界 )"+
  "启动中： ( 九山八海、为一世界，聚千界则成‘小千世界’，此界乘三，无我不断者，三刀流奥义，一大‧三千‧大千世界 )")
}else{
  console.log(' 打包中 ( 小姐，可以看看你的内裤吗？ ) '+'打包中 ( 小姐，可以看看你的内裤吗？ )'+'打包中 ( 小姐，可以看看你的内裤吗？ )')
}

var config = readConfig("src/config/projectConfig.ts");  //读取配置文件
//替换原有config文件
changeConfig(
  init=function(){
    var shouldConfiguredFiles = ['src/common/LoadComponentAsync.tsx','src/common/LC.tsx'];
    shouldConfiguredFiles.forEach(function(item){
      writeFile(
          item, 
          replaceVariables( readFile(item),"model" )
      );       
    })
  }
);

// 讀取文件
function readFile(path) {
  return fs.readFileSync(path).toString();
}
// 寫入文件 - 寫入的文件路徑 寫入的内容
function writeFile(path, content) {
  fs.writeFileSync(path, content, {
    encoding: "utf8", // 可选值，默认 ‘utf8′
    flag: "w" // 默认值 ‘w'
  });
}
// 讀取Config配置文件
function readConfig(str) {
  var configContent = readFile(str);
  var i = configContent.indexOf("{"); // 開始
  configContent = configContent.substring(i); // 獲取整個config對象
  return JSON.parse(configContent); // 轉換
}

// 替換内容
function replaceVariables(content,replaceWho) {
  var tag = false;
  var ret = "";
  var off = 0;
  var startTag = "//__start";
  var endTag = "//__end";
  while (true) {
    var i = content.indexOf(startTag, off);//__start下标
    if (i < 0) {
      if (tag) {
        ret += content.substring(off); // 连接end之后
        return ret;
      } else {
        return false;
      }
    } else {
      tag = true;
    }
    // 处理end以前
    var j = content.indexOf("\n", i + startTag.length) // 换行符下标
    var tem = content.substring(i + startTag.length, j).trim(); // 修改内容
    // 替换api 或者 spec 
    if(replaceWho=="api"){
      tem = tem.replace("#{spec}",config.api)
    }else if(replaceWho=="model"){
      tem = tem.replace("#{spec}",config.model)
    }else{
      tem = tem.replace("#{spec}", config.spec)
    }
    var k = content.indexOf(endTag, j); //__end下标
    // 連接 
    ret += content.substring(off, j) + "\n";
    ret += tem + "\n";
    off = k;// 重新找__start
  }
}

// configData=>配置config文件
function changeConfig(init) {
  var configData = readFile("src/config/configData.js")
  var end = 0;
  var startIndex = configData.indexOf("//〓〓〓" + config.spec + "〓〓〓");
  if (startIndex == -1) {
    console.error(" 错误配置 ")
  }else{
    startIndex = configData.indexOf("export", startIndex);
    end = configData.indexOf("//〓〓〓End〓〓〓", startIndex);
    var newConfigData = configData.substring(startIndex, end);
    writeFile("src/config/projectConfig.ts", newConfigData);
    config = readConfig("src/config/projectConfig.ts");  //读取修改后的配置文件
    // 打包和啓動的不同處理
    if(isRunStart) {
      var webpackConfig = readFile("src/setupProxy.js");
      webpackConfig = replaceVariables(webpackConfig,"api");//替换API
      writeFile("src/setupProxy.js", webpackConfig);
    }else{
      newConfigData = readConfig('src/config/projectConfig.ts');
      newConfigData.devImgUrl = "";
      newConfigData = JSON.stringify(newConfigData)
      newConfigData = "export const config =" + newConfigData;
      writeFile("src/config/projectConfig.ts", newConfigData);
    }
    config = readConfig("src/config/projectConfig.ts");  //读取修改后的配置文件
  }
  init();
}