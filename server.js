import express from 'express'
import fsExtra from 'fs-extra'
import path from 'path'
import { handleErrors,logActions,confirmAction } from './middleware/middleware.js';
import { tryCatch } from './utils/tryCatch.js';
import { PrivateErrors } from './utils/privateErrors.js';
import {getAllfiles,filterFilesByName,filterByCreationDate,getFilesStat, writeFileController,checkFile, readAndCompress, downloadStream} from './utils/filesController.js'
import { decrypt, encrypt } from './utils/crypto.js';
const app = express()
app.use(express.json(({ extended: false, limit: '2mb' })))
app.use(express.text(({ extended: false, limit: '2mb' })))
app.set('view engine','ejs')
app.use('/public',express.static('public'))

app.get('/',
    tryCatch
    (async (req,res)=>{
        const searchValue = req.query.searchValue
        const files = await getAllfiles('data')
        if(searchValue){
            const filesWithStat = await getFilesStat(files)
            const filterdFilesByName = filterFilesByName(filesWithStat,searchValue)
            const filterdFilesByDate = filterByCreationDate(filesWithStat,searchValue)
            const results = filterdFilesByName.concat(filterdFilesByDate)
            results.sort((a,b)=>b[4]-a[4])
            return res.render('index',{results})
        }else{
            const filesWithStat = await getFilesStat(files)
            let results = filesWithStat.sort((a,b)=>b[4]-a[4])
            return res.render('index',{results})
        }})
    )
//modify route to modify a file
app.get('/modify',tryCatch(
    async (req,res)=>{
        const file = req.query.filePath
        if(!file) throw new PrivateErrors(600,"Bad Path",404)
        let {name:fileName,ext:fileExt} = path.parse(file)
        const data = await fsExtra.readFile(file)
        res.render('modify',{fileName,fileExt,data})
    })
)
//detail route to read the file
app.get('/detail',
    tryCatch
        (async (req,res)=>{
        const filePath = req.query.filePath
        // private Errors are thrown when bad path is given to redirect to home page
        if(!filePath) throw new PrivateErrors(600,"Bad Path on detail",400)
        // extract file name and ext from the path
        const {name:fileName,ext:fileExt,base:fileBase} = path.parse(filePath)
        let data = await fsExtra.readFile(filePath, 'utf-8')
        /////////// hide this
        // data = decrypt(data,'password')
        const newdata = data.split("\n")
        return res.render('detail',{newdata,fileName,fileExt,filePath,fileBase})})
    )
//
app.get('/create',async (req,res)=>{
    try {
        return res.render('create')
    } catch (error) {
        return res.sendStatus(404)
    }
})
////////////////////////////////////////////


///////////////////////////////////////////////
//create or edit file
//create new file

// 
app.post('/create',[logActions('Create File')],tryCatch(async (req,res)=>{
    let {data,fileName,type,autherName} = req.body
    if(!(data&&fileName&&type&&autherName))throw new PrivateErrors(601,'missing info',400)
    // if name already exist to prevent overwrite
    if(await checkFile(`data/${fileName}${type}`))throw new PrivateErrors(602,'file already exists coming from create post',400)
    // if every thing is ok write the file
    // data = encrypt(data,'password')
    await writeFileController(`data/${fileName}${type}`,data)
    confirmAction(req.id,'Create File',autherName,fileName,type,'Creating')
    return res.sendStatus(200)

}))

//edit existing file
app.put('/create',logActions('Edit File'),
tryCatch(async (req,res)=>{
    const {data,originalName,fileName,type,autherName} = req.body
            if(!(data&&originalName&&fileName&&type&&autherName))throw new Error(601,'missing info',400)
            // if other file exists with the same new name
            if(fileName!==originalName&&(await fsExtra.exists(`data/${fileName}${type}`))){
                throw new PrivateErrors(602,"file already exists coming from create put",400)
            } 
            await fsExtra.writeFile(`data/${originalName}${type}`,data)
            if(fileName)await fsExtra.rename(`data/${originalName}${type}`,`data/${fileName}${type}`)
            confirmAction(req.id,'Edit File',autherName,fileName,type,fileName===originalName?'edit':`edit/rename ${originalName}`)
            return res.sendStatus(200)
}))
///////////////////////////////////////////////


///////////////////////////////////////////////
//delete file by name
app.delete('/delete',logActions('Delete File'),tryCatch(async (req,res)=>{
        await fsExtra.remove(req.query.filePath)
        return res.sendStatus(200)
}))
///////////////////////////////////////////////
app.get('/downFile',async (req,res)=>{
    const filePath = req.query.filePath
    const compress = req.query.compress
    if(compress)return readAndCompress(filePath,res)
    let data = await fsExtra.readFile(filePath, 'utf-8')
    // 
    // data = decrypt(data,'password')
    return res.send(data)
fsExtra.readFile()
})
app.use(handleErrors)

app.listen(3000,'localhost',()=>{console.log("im listening")})

