// 1 这个地方填写自己的智选服务订单号
// 2 登录懒投资
// 3 然后复制黏贴这个文件全文到chrome的console里面执行就行了
const contractIds = [333, 444]

require.config({
    paths: {
        "FileSaver": "https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.21.15/plugins/export/libs/FileSaver.js/FileSaver.min"
    }
});

const getPdfBlob = (url) => {
    return new Promise((resolve, reject)=> {
        let xhr = new XMLHttpRequest()
        xhr.open('get', url+'?t='+Math.random(), true);
        xhr.setRequestHeader('Content-Type', `application/pdf`);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (this.status == 200) {
                //接受二进制文件流
                var blob = this.response;
                resolve(blob);
            }
        }
        xhr.send();
    })
}

var total = 0

async function downloadPdf(contractId, amount, id) {
    console.log(`url: https://lantouzi.com/user/smartbid/contract?id=${id}&type=p`)
    let filename = `${contractId}_${amount.padStart(8, '0')}_${id}.pdf`
    let url = `https://lantouzi.com/user/smartbid/contract?id=${id}&type=p`
    getPdfBlob(url).then(blob => {
        saveAs(blob, filename);// 拿到 blob 并下载 pdf
    })
}

async function download(id) {
    var formData = new FormData();
    formData.append("id", id)
    formData.append("smb_type", 0)
    formData.append("page", 1)

    res = await fetch('https://lantouzi.com/api/smartbid/user/order/buy_prj_relation', {
        body: formData,
        method: "POST",
    })
    jsonData = await res.json()
    jsonData.data.items.forEach((item) => {
        item.details.forEach((ct) => {
            var fileId = ct.efile_id
            var amount = ct.amount
            total += parseInt(amount)
            console.log(`累计金额: ${total}`)
            downloadPdf(id, amount, fileId)
        })
    })
}

const sleep = (timeountMS) => new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
  });

require(['FileSaver'], function () {
    contractIds.forEach((id)=>{
        download(id)
        sleep(5000)
    })
    
});


