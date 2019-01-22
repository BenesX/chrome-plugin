function getQueryByName (name, url) {
    if (!url) url = window.location.href;
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function setLoadStatus (status) {
    document.querySelector('body').setAttribute('isLoadExcel', status);
}
function getLoadStatus () {
    return document.querySelector('body').getAttribute('isLoadExcel');
}
function collectData () {
    if (getLoadStatus() === 'true') return;
    const BASE_URL = 'https://sycm.taobao.com/mc/industry';
    let now = new Date();
    let dateRange = getQueryByName('dateRange');
    let cateId = getQueryByName('cateId');
    let dateType = getQueryByName('dateType');
    let device = getQueryByName('device');
    let dressType = document.querySelectorAll('.common-menu')[0].querySelector('.active').textContent;
    const urls = [
        `${BASE_URL}/searchWord.json?dateRange=${dateRange}&dateType=${dateType}&pageSize=100&page=1&order=desc&orderBy=seIpvUvHits&cateId=${cateId}&device=${device}&indexCode=hotSearchRank%2CseIpvUvHits%2CclickHits%2CclickRate%2CpayRate&_=1547451945987&token=bdc55d908`,
        `${BASE_URL}/tailWord.json?dateRange=${dateRange}&dateType=${dateType}&pageSize=100&page=1&order=desc&orderBy=seIpvUvHits&cateId=${cateId}&device=${device}&indexCode=hotSearchRank%2CseIpvUvHits%2CclickHits%2CclickRate%2CpayRate&_=1547451939916&token=bdc55d908`,
        `${BASE_URL}/brandWord.json?dateRange=${dateRange}&dateType=${dateType}&pageSize=100&page=1&order=desc&orderBy=avgWordSeIpvUvHits&cateId=${cateId}&device=${device}&indexCode=hotSearchRank%2CrelSeWordCnt%2CavgWordSeIpvUvHits%2CavgWordClickHits%2CavgWordClickRate%2CavgWordPayRate&_=1547200977390&token=bdc55d908`,
        `${BASE_URL}/coreWord.json?dateRange=${dateRange}&dateType=${dateType}&pageSize=100&page=1&order=desc&orderBy=avgWordSeIpvUvHits&cateId=${cateId}&device=${device}&indexCode=hotSearchRank%2CrelSeWordCnt%2CavgWordSeIpvUvHits%2CavgWordClickHits%2CavgWordClickRate%2CavgWordPayRate&_=1547452094008&token=bdc55d908`,
        `${BASE_URL}/attrWord.json?dateRange=${dateRange}&dateType=${dateType}&pageSize=10&page=1&order=desc&orderBy=avgWordSeIpvUvHits&cateId=${cateId}&device=${device}&indexCode=hotSearchRank%2CrelSeWordCnt%2CavgWordSeIpvUvHits%2CavgWordClickHits%2CavgWordClickRate%2CavgWordPayRate&_=1547452132203&token=bdc55d908`
    ]
    setLoadStatus(true);
    Promise.all(urls.map(url =>
        fetch(url).then(resp => resp.text())
    )).then(texts => {
        if (JSON.parse(texts[0]).code == 5810) {
            alert('刷新页面，重新登录！');
            setLoadStatus(false);
            console.warn('taobao err:', JSON.parse(texts[0]).msg);
            return;
        }
        const data = {
            keyword: JSON.parse(texts[0]).data,
            longtail: JSON.parse(texts[1]).data,
            brand: JSON.parse(texts[2]).data,
            core: JSON.parse(texts[3]).data,
            decorate: JSON.parse(texts[4]).data
        }
        fetch('https://api.benes.live/magic/toexcel', { 
            method: 'POST', 
            body: `data=${JSON.stringify(data)}`,
            mode: 'cors',
            credentials: 'include',
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(resp => {
            return resp.blob();
        }).then(data => {
            setLoadStatus(false);
            let url = window.URL.createObjectURL(new Blob([data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            let fileName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 1}-${dressType}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link)
            link.click();
        }).catch(err => {
            setLoadStatus(false);
            alert('出错了，稍后再试');
            console.warn('error:', err);
        })
    });
}