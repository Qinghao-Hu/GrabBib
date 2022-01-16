document.addEventListener('DOMContentLoaded', function () {
    const host = window.location.host
    switch (true) {
        case host.indexOf('usenix') > -1:
            usenixPro()
            break
        case host.indexOf('acm.org') > -1:
            acm()
            break
        case host.indexOf('ieee.org') > -1:
            ieee()
            break
        case host.indexOf('arxiv.org') > -1:
            arxiv()
            break
        case host.indexOf('nips') > -1:
            neurips()
            break
        case host.indexOf('neurips') > -1:
            neurips()
            break
        case host.indexOf('mlr.press') > -1:
            icml()
            break
        case host.indexOf('openreview') > -1:
            iclr()
            break
        case host.indexOf('aaai.org') > -1:
            aaai()
            break
        case host.indexOf('thecvf') > -1:
            cvpr()
            break
        case host.indexOf('mlsys') > -1:
            mlsys()
            break

        default:
            return
    }
})

function usenix() {
    let bib = document.getElementsByClassName(
        'bibtex-text-entry bibtex-accordion-text-entry'
    )[0].innerHTML
    let rawStr = bib
    /**
     * remove redundant info
     */
    rawStr = rawStr.split('<br>').join('')
    const removeArr = ['isbn', 'url']
    for (let i of removeArr) {
        let startIdx = rawStr.indexOf(i)
        let endIdx = rawStr.indexOf(',', startIdx)
        rawStr = rawStr.replace(rawStr.substring(startIdx, endIdx + 3), '')
    }

    let title = rawStr.substring(
        rawStr.indexOf('title') + 9,
        rawStr.indexOf('booktitle') - 4
    )
    rawStr = replaceBibKey(title, rawStr)

    /**
     * identify YEAR & FLAG
     */
    let yearIdx = rawStr.indexOf('year')
    const YEAR = rawStr.substring(yearIdx + 10, yearIdx + 12)
    const usenixFlagMap = {
        '{OSDI}': 'OSDI',
        '{NSDI}': 'NSDI',
        '{FAST}': 'FAST',
        '{USENIX} {ATC}': 'ATC',
        '{USENIX} Security': 'Security'
    }
    let FLAG
    for (let i in usenixFlagMap) {
        if (rawStr.indexOf(i) > -1) {
            FLAG = usenixFlagMap[i]
        }
    }

    let titleReplaceFlag, seriesReplaceItem
    if (FLAG === 'OSDI' || FLAG === 'NSDI' || FLAG === 'FAST') {
        titleReplaceFlag = ` ({${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {${FLAG} '${YEAR}},`
    } else if (FLAG === 'ATC') {
        titleReplaceFlag = ` ({USENIX} {${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {{USENIX} {${FLAG}} '${YEAR}},`
    } else if (FLAG === 'Security') {
        titleReplaceFlag = ` ({USENIX} ${FLAG} ${YEAR})`
        seriesReplaceItem = `series = {{USENIX} ${FLAG} '${YEAR}},`
    }
    const replaceFlagArr = ['month', titleReplaceFlag]
    const replaceItemArr = [seriesReplaceItem, '},']
    for (let i = 0; i < 2; i++) {
        let startIdx = rawStr.indexOf(replaceFlagArr[i])
        let endIdx = rawStr.indexOf(',', startIdx)
        rawStr = rawStr.replace(
            rawStr.substring(startIdx, endIdx + 1),
            replaceItemArr[i]
        )
    }
    navigator.clipboard.writeText(rawStr)
}

function usenixPro() {
    let bib = document.getElementsByClassName(
        'bibtex-text-entry bibtex-accordion-text-entry'
    )[0].innerHTML
    let rawStr = bib
    rawArr = rawStr.split('<br>')
    rawArr = rawArr.splice(0, rawArr.length - 2)
    let resArr = [rawArr.shift()]

    const targetKey = ['author', 'title', 'booktitle', 'year', 'pages', 'publisher', 'series']
    let rawObj = {}
    let rawSeries = ''
    rawArr.map(line => {
        const flag = ' = {'
        const key = line.substring(2, line.indexOf(flag))
        let value = line.substring(line.indexOf(flag) + flag.length, line.length - 2)
        if (key === 'booktitle') {
            rawSeries = value.substring(value.lastIndexOf('(') + 1, value.lastIndexOf(')'))
            value = value.substring(0, value.lastIndexOf('(')).trim()
        }
        if (targetKey.includes(key)) {
            rawObj[key] = value
        }
    })
    let bibkey = grabBibKey(rawObj['title'], rawObj['year'])
    resArr[0] = `@inproceedings {${bibkey},`

    const usenixFlagMap = {
        'OSDI': 'OSDI',
        'NSDI': 'NSDI',
        'FAST': 'FAST',
        '{USENIX} {ATC}': 'ATC',
        '{USENIX} Security': 'Security'
    }
    for (let key in usenixFlagMap) {
        if (rawSeries.indexOf(usenixFlagMap[key]) > -1) {
            rawObj['series'] = `${key} '${rawObj['year'].substring(2)}`
        }
    }
    targetKey.map(item => {
        resArr.push(`\n\t${item} = {${rawObj[item]}},`)
    })
    resArr.push("\n}")
    // console.log(resArr.join(''))
    navigator.clipboard.writeText(resArr.join(''))
}


function acm() {
    let ajax = new XMLHttpRequest()
    /**
     * get dois from URL
     */
    const url = window.location.pathname
    let diosIdx
    for (let i = 0; i < url.length; i++) {
        let reg = /^[0-9]+.?[0-9]*$/
        if (reg.test(parseInt(url[i]))) {
            diosIdx = i
            break
        }
    }
    let dois = window.location.pathname.substring(
        diosIdx,
        window.location.pathname.length
    )
    let targetFile = 'custom-bibtex'
    let format = 'bibTex'
    ajax.open(
        'get',
        `${window.location.origin}/action/exportCiteProcCitation?dois=${dois}&targetFile=${targetFile}&format=${format}`
    )
    ajax.send(null)
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            /**
             * process raw data
             */
            let rawStr = ajax.response
            let idx = rawStr.indexOf('"contentType":"Application/x-bibtex","items":')
            rawStr = rawStr.substring(
                idx + '"contentType":"Application/x-bibtex","items":'.length,
                rawStr.length - 1
            )

            let rawJSON = JSON.parse(rawStr)
            let rawObj = rawJSON[0][dois]
            let resArr = []
            /**
             * process common data
             */
            let authorArr = []
            for (const i of rawObj.author) {
                authorArr.push(`${i.family}, ${i.given}`)
            }

            /**
             * process unique data
             */
            if (rawObj.type === 'PAPER_CONFERENCE' || rawObj.type === 'CHAPTER') {
                let arr = document.getElementsByClassName('article__tocHeading')
                const series = document.getElementsByClassName('article__tocHeading')[
                    arr.length - 2
                ].innerHTML
                let key = grabBibKey(rawObj.title, `${series.match(/\d+(.\d+)?/g)}`)
                resArr.push(`@inproceedings{${key},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`booktitle = {${rawObj['container-title']}},\n`)
                resArr.push(`publisher = {${rawObj.publisher}},\n`)
                resArr.push(`year = {20${series.match(/\d+(.\d+)?/g)}},\n`)
                resArr.push(`series = {${series}}\n`)
            }
            if (rawObj.type === 'ARTICLE') {
                let key = grabBibKey(
                    rawObj.title,
                    `${rawObj.issued['date-parts'][0][0]}`
                )
                resArr.push(`@article{${key},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`journal = {${rawObj['container-title']}},\n`)
                resArr.push(`volume = {${rawObj.volume}},\n`)
                resArr.push(`pages = {${rawObj.page}},\n`)
                resArr.push(`year = {${rawObj.issued['date-parts'][0][0]}}\n`)
            }
            resArr.push('}')
            resArr = resArr.join('')
            resArr = resArr.replace('Proc. VLDB Endow.', 'Proceedings of the VLDB Endowment')
            navigator.clipboard.writeText(resArr)
        }
    }
}

function arxiv() {
    let ajax = new XMLHttpRequest()
    /**
     * get dois from URL
     */
    const url = window.location.pathname
    let diosIdx
    for (let i = 0; i < url.length; i++) {
        let reg = /^[0-9]+.?[0-9]*$/
        if (reg.test(parseInt(url[i]))) {
            diosIdx = i
            break
        }
    }
    let dois = window.location.pathname.substring(
        diosIdx,
        window.location.pathname.length
    )
    ajax.open('get', `${window.location.origin}/bibtex/${dois}`)
    ajax.send(null)
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let rawStr = ajax.response
            let title = rawStr.substring(
                rawStr.indexOf('title') + 7,
                rawStr.indexOf('}')
            )
            rawStr = replaceBibKey(title, rawStr)
            rawStr = rawStr.replace('misc', 'article')
            rawStr = rawStr.split('eprint').join('journal = {CoRR},\n      volume')
            let startIdx = rawStr.indexOf('volume={')
            let endIdx = rawStr.indexOf('},', startIdx)
            rawStr = rawStr.replace(
                rawStr.substring(startIdx + 'volume={'.length, endIdx),
                url.substring(1, url.length)
            )
            const removeArr = ['archivePrefix', 'primaryClass']
            for (let i of removeArr) {
                let idx1 = rawStr.indexOf(i)
                let idx2 = rawStr.indexOf('\n', idx1)
                rawStr = rawStr.replace(rawStr.substring(idx1, idx2 + 3), '')
            }
            let idx3 = rawStr.lastIndexOf(',')
            rawStr = rawStr.replace(rawStr.substring(idx3, rawStr.length), '\n}')
            navigator.clipboard.writeText(rawStr)
        }
    }
}

function neurips() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return
    }

    let resArr = []
    let authorArr = []
    let rawDOM = document.getElementsByName('citation_author')
    let year = document.getElementsByName('citation_publication_date')[0].content
    let title = document.getElementsByTagName('title')[0].innerHTML
    let key = grabBibKey(title, year)

    for (let i of rawDOM) {
        authorArr.push(`${i.content}`)
    }

    resArr.push(`@inproceedings{${key},\n`)
    resArr.push(`title = {${title}},\n`)
    resArr.push(`author = {${authorArr.join(' and ')}},\n`)
    resArr.push(
        `booktitle = {${document.getElementsByName('citation_journal_title')[0].content
        }},\n`
    )
    resArr.push(`year = {${year}},\n`)
    resArr.push(`series = {NeurIPS '${year.slice(2, 4)}}\n`)
    resArr.push('}')

    navigator.clipboard.writeText(resArr.join(''))
}

function icml() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return
    }

    let bib = document.getElementsByClassName('citecode')[0].innerHTML
    bib = bib.replace(bib.substring(bib.indexOf('volume')), '')
    let year = bib.substring(bib.indexOf('year') + 10, bib.indexOf('year') + 14)
    let title = bib.substring(bib.indexOf('title') + 11, bib.indexOf('}'))
    let key = grabBibKey(title, year)

    bib = bib.replace(
        bib.substring(bib.indexOf('{') + 1, bib.indexOf(',') + 1),
        `${key},`
    )
    bib = bib.replace(
        bib.substring(bib.indexOf('editor'), bib.lastIndexOf(',') + 1),
        `series = {ICML '${year.slice(2, 4)}}\n}`
    )
    pasteStrToClipboard(bib)
}

function iclr() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return
    }

    let bib = []
    let authors = []
    let year = document.getElementsByName('citation_online_date')[0].content.slice(0, 4)
    let title = document.getElementsByName('citation_title')[0].content
    let author_num = document.getElementsByName('citation_author').length

    for (let i = 0; i < author_num; i++) {
        let author = document.getElementsByName('citation_author')[i].content
        authors[i] = author
    }
    let author = authors.join(" and ")
    // let author = document.getElementsByName('citation_authors')[0].content.replace(/;/g, ' and')

    let key = grabBibKey(title, year)

    bib.push(`@inproceedings{${key},\n`)
    bib.push(`title = {${title}},\n`)
    bib.push(`author = {${author}},\n`)
    bib.push(`booktitle = {International Conference on Learning Representations},\n`)
    bib.push(`year = {${year}},\n`)
    bib.push(`series = {ICLR '${year.slice(2, 4)}}\n`)
    bib.push('}')
    navigator.clipboard.writeText(bib.join(''))
}

function ieee() {
    // let url = window.location.href
    // if (grabBibFromPDF(url)) {
    //     return;
    // }

    const url = window.location.pathname
    let diosIdx
    for (let i = 0; i < url.length; i++) {
        let reg = /^[0-9]+.?[0-9]*$/
        if (reg.test(parseInt(url[i]))) {
            diosIdx = i
            break
        }
    }
    let dois = window.location.pathname.substring(
        diosIdx,
        window.location.pathname.length
    )
    let ajax = new XMLHttpRequest()
    ajax.open(
        'get',
        `${window.location.origin}/rest/search/citation/format?recordIds=${dois}&download-format=download-bibtex&lite=true`
    )
    ajax.send(null)
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let bib = ajax.response
            bib = bib.substring(bib.indexOf('@'), bib.length - 6)
            bib = bib.replace(/\\r\\n/g, '\n')

            let title = bib.substring(bib.lastIndexOf('title') + 7, bib.indexOf('year') - 9)
            let year = bib.substring(bib.lastIndexOf('year') + 6, bib.lastIndexOf('year') + 10)
            let key = grabBibKey(title, year)
            bib = bib.replace(bib.substring(bib.indexOf('{') + 1, bib.indexOf(',')), key)
            // console.log(bib)
            navigator.clipboard.writeText(bib)
        }
    }
}


function aaai() {
    let bib = []
    let author = []
    let year = document.getElementsByName('citation_date')[0].content.slice(0, 4)
    let title = document.getElementsByName('citation_title')[0].content
    let author_list = document.getElementsByName('citation_author')
    let key = grabBibKey(title, year)

    for (let i of author_list) {
        author.push(`${i.content}`)
    }

    bib.push(`@inproceedings{${key},\n`)
    bib.push(`title = {${title}},\n`)
    bib.push(`author = {${author.join(' and ')}},\n`)
    bib.push(`booktitle = {Proceedings of the AAAI Conference on Artificial Intelligence},\n`)
    bib.push(`year = {${year}},\n`)
    bib.push(`series = {AAAI '${year.slice(2, 4)}}\n`)
    bib.push('}')
    navigator.clipboard.writeText(bib.join(''))
}


function cvpr() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return
    }

    let bib = document.getElementsByClassName('bibref')[0].innerHTML
    let year = document.getElementsByName('citation_publication_date')[0].content
    let title = document.getElementsByName('citation_title')[0].content
    let key = grabBibKey(title, year)

    bib = bib.split('<br>').join('')
    bib = bib.replace(' (CVPR)', '')
    bib = bib.replace(bib.substring(bib.indexOf('{') + 1, bib.indexOf(',')), key)
    bib = bib.replace(bib.substring(bib.lastIndexOf('}')), `}, \nseries = {CVPR '${year.slice(2, 4)}}\n`)
    navigator.clipboard.writeText(bib)
}

function mlsys() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return
    }

    let bib = []
    let author = []
    let year = document.getElementsByName('citation_publication_date')[0].content.slice(0, 4)
    let title = document.getElementsByName('citation_title')[0].content
    let author_list = document.getElementsByName('citation_author')
    let key = grabBibKey(title, year)

    for (let i of author_list) {
        author.push(`${i.content}`)
    }

    bib.push(`@inproceedings{${key},\n`)
    bib.push(`title = {${title}},\n`)
    bib.push(`author = {${author.join(' and ')}},\n`)
    bib.push(`booktitle = {Proceedings of Machine Learning and Systems},\n`)
    bib.push(`year = {${year}},\n`)
    bib.push(`series = {MLSys '${year.slice(2, 4)}}\n`)
    bib.push('}')
    navigator.clipboard.writeText(bib.join(''))
}
