export class PrivateErrors extends Error{
    constructor(errno,message,status){
        super(message)
        this.errno = errno
        this.status = status
    }
}
//600 bad path
//601 missing info
//602 file already exists