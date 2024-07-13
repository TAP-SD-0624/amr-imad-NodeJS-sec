import path from 'path'
import fsExtra from 'fs-extra'
import zlib from 'zlib'

export async function getAllfiles(filesPath){
    const folderPath = path.join(import.meta.dirname,"../",filesPath)
    const filesList = await fsExtra.readdir(folderPath)
    const filesAndPaths = filesList.map(i=>[i,path.join(filesPath,i)])
    return filesAndPaths
}
export function filterFilesByName(files,searchValue){
    const filterdFiles = files.filter((i)=>i[0].toLowerCase().includes(searchValue.toLowerCase().trim()))
    return filterdFiles
}
export function filterByCreationDate(files,searchValue){
    const filterdFiles = files.filter((i)=>i[3]===(searchValue.trim()))
    return filterdFiles
}

export async function getFilesStat(files){
    const filterdFiles = Promise.all(files.map(async(i)=>{
        const fileStat = await fsExtra.stat(i[1])
        return [i[0],i[1],fileStat.mtime.toLocaleDateString(),fileStat.birthtime.toLocaleDateString(),fileStat.atimeMs]
    }))
    return await filterdFiles
}

export async function checkFile(filePath){
    return (await fsExtra.exists(filePath))
}

export async function writeFileController(filePath,data){
    return (await fsExtra.writeFile(filePath,data))
}
export async function downloadStream(inputPath,res){
    const input = fsExtra.readFile(inputPath); 
    input.pipe(res)
}

export function readAndCompress(inputPath,res){
    const zip = zlib.createGzip();
    const input = fsExtra.createReadStream(inputPath); 
    input.pipe(zip).pipe(res);
}
// export function readAndDecompress(inputPath,outputPath){
//     const unzip = zlib.createGunzip();
//     const input = fsExtra.createReadStream(inputPath); 
//     const output = fsExtra.createWriteStream(outputPath);
//     input.pipe(unzip).pipe(output);
// }
