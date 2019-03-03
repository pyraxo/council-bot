const xlsx = require('xlsx')
const db = require('./db')

const checkRI = /^\d{2}[Yy]\w{4}\d{3}\w{1}$/.test

const workbook = xlsx.readFile(`${process.cwd()}/assets/pin_test.xlsx`)

const checkAllPINs = async () => {
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  let pinList = []
  for (const ref in sheet) {
    if (!ref.startsWith('B')) continue
    if (ref === 'B1') continue
    pinList.push(sheet[ref].v)
  }
  const multi = db.multi()
  for (const val of pinList) {
    const key = `pin:${val.toLowerCase()}`
    const keyExists = await db.exists(key)
    if (!keyExists) multi.set(key, 0)
  }
  const reply = await multi.exec()
  return reply.filter(resp => !!resp).length
}

module.exports = {
  checkAllPINs,
  checkRI
}