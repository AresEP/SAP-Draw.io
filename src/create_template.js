import { appendFile, cp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import {setOutput } from '@actions/core';
import {parse, toMd} from 'md-2-json'
/**
 *Json structure of pull request
 *  {
  Title: { raw: 'Principal Propagation\n\n\n' },
  Description: { raw: 'Example for principal propagation\n\n' },
  Image: { raw: '![Principal Propagation](./principalpropagation.png)' }
}
 */
async function main() {
  const body =  process.env.Body
  // const body = await readFile('./test/PR.txt', 'utf-8')

const jsonBody = parse(body)
// console.log(jsonBody)
const templateName = jsonBody.Title.raw.replace(/\s/g, "")
const rawName = jsonBody.Title.raw.replace(/\n/g, "");
const files = await readdir("./upload/", { withFileTypes: true, encoding: 'utf-8'})
const regex = /\.xml$/
if (files.length !== 2 || (!regex.test(files[0].name) && !regex.test(files[1].name))){
  throw new Error("File isn't uploaded into the upload directory or file is not XML")
} else {
  try {
  const filename = files.find((file) => file.name.includes("xml"))?.name
  const path = './src/templates/' +templateName
  const mdFilePath = `./src/templates/${templateName}/${templateName}.md`

  await mkdir(path)
  await cp('./upload/' +filename, path +"/" +filename)
    await writeFile(mdFilePath,body)
  await appendFile(mdFilePath, `\n\n
  [Open Diagram](https://app.diagrams.net/?create=https://raw.githubusercontent.com/${process.env.Repo}/main/src/templates/${templateName}/${filename}&clibs=Uhttps://raw.githubusercontent.com/mauriciolauffer/sap_btp_icons_drawio_lib/main/libs/SAP_BTP_Service_Icons_latest.xml)`)

  await appendFile(mdFilePath, `\n\n## Desktop Client Draw.io\n\n
  To use in desktop client use the following link and import with template url: \n
  https://raw.githubusercontent.com/${process.env.Repo}/main/src/templates/${templateName}/${filename}&clibs=Uhttps://raw.githubusercontent.com/mauriciolauffer/sap_btp_icons_drawio_lib/main/libs/SAP_BTP_Service_Icons_latest.xml)`)

  await rm('./upload/' +filename)
  const summary = await readFile('./src/SUMMARY.md', 'utf-8')
  let summaryBody = parse(summary)
  summaryBody.Templates.raw = summaryBody.Templates.raw +`- [${rawName}](templates/${templateName}/${templateName}.md)\n\n`
  await writeFile('./src/SUMMARY.md', toMd(summaryBody))

  }
  catch (e) {
    console.log(e)
    throw new Error('Something went wrong!')
  }
}
 

}



main();
