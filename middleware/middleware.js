import { v4 as uuidv4 } from 'uuid';
import fsExtra from 'fs-extra';
import path from 'path'
import { decrypt, encrypt } from '../utils/crypto.js';


export function logActions(action){
    return async(req,res,next)=>{
        req.id = uuidv4()
        let autherName
        let fileName
        let type
        if(!await(fsExtra.exists('log.csv'))){
             await fsExtra.writeFile('log.csv','id,name,action,file name,file type,date')
        }
        try {
            let bodyData = req.body
            autherName = bodyData.autherName
            fileName = bodyData.fileName
            type = bodyData.type
        } catch (error) {
            autherName = 'anonymous'
            const filePath = req.query.filePath
            const file = path.parse(filePath)
            fileName = file.name
            type = file.ext
        }
        



        const date = new Date(Date.now()).toString()
        await fsExtra.writeFile('log.csv',`\n${req.id},${autherName},${action},${fileName},${type},${date}`,{flag:"a"})
        next()
    }
}
export async function confirmAction(id,action,autherName='anonymous',fileName,type,notes){
    const date = new Date(Date.now()).toString()
    if(!await(fsExtra.exists('logActive.csv'))){
        await fsExtra.writeFile('logActive.csv','id,name,action,file name,file type,date,notes,status')
   }
    await fsExtra.writeFile('logActive.csv',`\n${id},${autherName},${action},${fileName},${type},${date},${notes},'confirmed'`,{flag:"a"})
}

export function handleErrors(error,req,res,next){
    switch(error.errno){
        case -4058:
            return res.redirect('/')
        case 600:
            // Bad path
            return res.redirect('/')
        case 601:
            return res.status(error.status).send(error.message)
        case 602:
            return res.status(error.status).send('file already exists')
        default:
            console.log(error)
            return res.status(400).send("opps somthing went wrong")
    }
    
}
