// 下载基金经理
import fetch from 'node-fetch';
import vm from 'vm'
import fs from 'fs'
import cheerio from 'cheerio'

// 获取五年，三年，二年，1年的收益排名
async function getYearsRank(fundId){
    let url = `http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jdzf&code=${fundId}&rt=0.012464315608267995`
    let ranks = []
    let res = await fetch(url, {
        method: "GET"
    })
    let text  = await res.text()
    vm.runInThisContext(text);
    let htmlString = apidata.content
    const $ = cheerio.load(htmlString);
    $('.tlpm').each((index, element) =>{
        if(index > 8){
            return 
        }
        console.log(index)
        let rankStr = $(element).text()
        if(rankStr === "---"){
            ranks.push(0)
        }else{
            let rankT = rankStr.split('|')
            // 计算排名的百分位
            let rankRate = (parseInt(rankT[0])*100/parseInt(rankT[1])).toFixed(2)
            ranks.push(rankRate)
        }
    })

    return ranks
}

// 获取最近五年，每年的收益排名
async function getOneYearRank(fundId){
    let url = `http://fund.eastmoney.com/${fundId}.html`
    let ranks = []
    let res = await fetch(url, {
        method: "GET"
    })
    let htmlString  = await res.text()
    const $ = cheerio.load(htmlString);
   $('td', 'li[class="increaseAmount"]').slice(118, 124).each((index, element) => {
        let rankStr = $(element).text()
        if(rankStr === '-- | --'){
            ranks.push("--")
            return
        }
        let rankT = rankStr.split('|')
        // 计算排名的百分位
        let rankRate = (parseInt(rankT[0])*100/parseInt(rankT[1])).toFixed(2)

        console.log(rankStr)
        console.log(rankRate)
        ranks.push(rankRate)
    })
    // console.log(a)

    return ranks
}




async function getManager(fundId) {
    let res = await fetch(`http://fund.eastmoney.com/pingzhongdata/${fundId}.js?v=20220119104147`, {
        method: "GET"
    })
    let text  = await res.text()
    vm.runInThisContext(text);
    return Data_currentFundManager
}

async function writeHeader(){
    const header = "代码,名称,拼音,类型,今年来,近1周,近1月,近3月,近6月,近1年,近2年,近3年,近5年,未知,未知,日期,净值,日增长率,未知,手续费,购买起点,未知,原价,手续费,成立来,经理,星级,得分,工作年限,基金规模,今年来百分位,1周百分位,1月百分位,3月百分位,6月百分位,1年百分位,2年百分位,3年百分位,5年百分位,2021,2020,2019,2018,2017,2016"
    await fs.promises.appendFile('test.csv', header, function () {
        console.log(`写入header`)
    });
}


async function getFundList(){
    let res = await fetch('https://fund.eastmoney.com/data/FundGuideapi.aspx?dt=4&ft=gp,hh&sd=&ed=&rt=sz,5_zs,5_ja,5&se=50&nx=51&sc=ln&st=desc&pi=1&pn=500&zf=diy&sh=list&rnd=0.8487240580875139', {
        method: "GET"
    })
    let jsCode = await res.text()
    vm.runInThisContext(jsCode);
    await writeHeader()
    let basicInfo = new Map()
    let managerInfo = new Map()
    let yearsRankInfo = new Map()
    let oneYearRankInfo = new Map()
    let fundList = rankData.datas
    for (let i=0; i < fundList.length - 1; i++ ){
        let fundStr = fundList[i]
        let fundRecord = fundStr.split(",")
        let fundId = fundRecord[0]
        basicInfo.set(fundId, fundStr)
        
        let managers = await getManager(fundId)
        if(managers.length === 1){
            let manager = managers[0]
            let managerDetail = []
            managerDetail.push(manager.name)
            managerDetail.push(manager.star)
            managerDetail.push(manager.power.avr)
            managerDetail.push(manager.workTime)
            managerDetail.push(manager.fundSize)
            managerInfo.set(fundId, managerDetail.join(","))
        }else{
            console.log(`${fundRecord[1]} 有多名基金经理`)
        }

        let yearnsRankData = await getYearsRank(fundId)
        yearsRankInfo.set(fundId, yearnsRankData.join(","))

        let oneYearRankData = await getOneYearRank(fundId)
        oneYearRankInfo.set(fundId, oneYearRankData.join(","))


    }


    for (let [fundId, managerStr] of managerInfo) {
        let fundStr = `\n${basicInfo.get(fundId)},${managerStr},${yearsRankInfo.get(fundId)},${oneYearRankInfo.get(fundId)}`
        fs.appendFile('test.csv', fundStr, function () {
            console.log(fundStr)
        });
    }


    
}




getFundList()
// let ranks = await getOneYearRank('000991')
// console.log(ranks)