async function deleteFile(filePath){
    const results = await fetch(`/delete?filePath=${filePath}`,{
        method:'delete'
    }).catch(err=>console.log(err.message))
}

async function updateFile(filename){
    const data = document.getElementById('textEditor').value
    const newName = document.getElementById('newName').value
    const originalName = document.getElementById('originalName').value
    const results = await fetch(`/updateFile?filename=${filename}`,{
        method:'put',
        body:JSON.stringify({data,originalName,newName})
    })
}

//////////////////////////////////////////////////////////////////////////////
//script only for create
try {
    document.querySelector("form").addEventListener('submit',(e)=>{
        e.preventDefault()
    })
} catch (error) {
    
}

async function createFile(target){
    const statusUpdate = document.getElementById('statusUpdate')
    const fileName = target[0].value.trim()
    const autherName = target[1].value.trim()
    const type = target[2].value
    const data = target[3].value
    const results = await fetch(`/create`,{
        method:'post',
        headers:{"Content-Type": "application/json",},
        body:JSON.stringify({fileName,autherName,type,data})
    }).then(resp=>{if (resp.status===200){
        statusUpdate.innerText="Success"
        }else resp.text().then((res)=>statusUpdate.innerText=res)
}).catch(err=>console.log(err.message))
}
function updateEditor(e){
    const textEditor = document.getElementById('textEditor')
    const statusUpdate = document.getElementById('statusUpdate')
    e.files[0].text().then(data=>textEditor.value=data).then(statusUpdate.innerText="File uploaded").catch(err=>statusUpdate.innerText=err.message)
}
////////////////////////////////////////////////////////////////////////////
async function searchByname(e){
    const name = document.getElementById('searchInput').value
    window.location.href = `/?searchValue=${name}`
}
///////////////////////////////////////////////////////////////////////////
//editing existing file
async function updateFile(target){
const statusUpdate = document.getElementById('statusUpdate')
const originalName = target[0].value
const type = target[1].value
const fileName = target[2].value
const autherName = target[3].value
const data = target[4].value
const results = await fetch(`/create`,{
    method:'put',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({data,originalName,fileName,type,autherName})
}).then(resp=>{if (resp.status===200){
    statusUpdate.innerText="Success"
    }else resp.text().then(res=>{statusUpdate.innerText=res})
}).catch(err=>console.log(err.message))
}