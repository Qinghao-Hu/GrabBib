var hashWeb

function grabBibKey(title, year) {
    /**
     * neurips acm ieee
     */
    let key
    if (title.indexOf(':') > -1) {
        key = title.substring(0, title.indexOf(':'))
        key = key.replace(/ /g, '')
    } else {
        key = title.substring(0, title.indexOf(' '))
        key = `${key}${year.substring(year.length - 2)}`
    }
    key = key.replace(/{/g, '')
    key = key.replace(/}/g, '')
    return key
}

function replaceBibKey(title, rawStr) {
    /**
     * arxiv, usenix
     */
    if (title.indexOf(':') > -1) {
        let originKey = rawStr.substring(
            rawStr.indexOf('{') + 1,
            rawStr.indexOf(',')
        )
        console.log(originKey)
        let key = title.substring(0, title.indexOf(':'))
        key = key.replace(' ', '')
        key = key.replace('{', '')
        key = key.replace('}', '')
        rawStr = rawStr.replace(originKey, key)
    }

    return rawStr
}


function grabBibFromPDF(url) {
    if (url.indexOf('pdf') > -1) {
        if (url.indexOf('nips') > -1 || url.indexOf('neurips') > -1 || url.indexOf('mlsys') > -1) {
            url = url.replace('file', 'hash')
            url = url.replace('Paper.pdf', 'Abstract.html')
        }
        if (url.indexOf('mlr.press') > -1) {
            url = url.replace(url.substring(url.lastIndexOf('/')), '.html')
        }
        if (url.indexOf('openreview') > -1) {
            url = url.replace('pdf', 'forum')
        }
        if (url.indexOf('thecvf') > -1) {
            url = url.replace('papers', 'html')
            url = url.replace('pdf', 'html')
        }
        console.log(url)
        hashWeb = window.open(url)
        setTimeout(function () {
            hashWeb.close()
        }, 2000)
        return 1
    }
    return 0
}

function pasteStrToClipboard(str) {
    const protocol = window.location.protocol
    if (protocol === 'https:') {
        navigator.clipboard.writeText(str)
    } else {
        document.addEventListener('copy', async (e) => {
            e.preventDefault()
            e.clipboardData.setData('text/plain', str)
        })
    }
}
