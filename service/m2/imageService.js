const pool = require('../../config/mysql2/connectionPool')
const path = require('path')
const {v4: uuidv4} = require('uuid')
const { ImageDto } = require('../../dto/ImageDto')

const imageType = ['title' , 'explanation']

/**
 * @param {string} questionId 
 * @param {string} filename 
 * @param {'title' | 'explanation'} type 
 */
async function appendImageByQuestionId(questionId, fileName, type) {
    if (!imageType.includes(type)) {
        throw new Error(`imageType "${type}" is not question or explanation`)
    }
    let sql = 
    `select name from image where question_id = ? and type = ? order by serial asc`
    try {
        const [names] = await pool.query(sql,
            [
                questionId,
                type
            ]
        )

        let newSerial = 1
        if (names.length >= 1) {
            newSerial = names.length + 1
        }

        sql = 
        `insert into image (question_id, name, type, serial) values(?, ?, ?, ?)`
        const [result] = await pool.query(sql,
            [
                questionId,
                fileName,
                type,
                newSerial
            ]
        )

        if (result.affectedRows == 0) {
            throw new Error(`append image failed at serial ${newSerial} with questionId ${questionId}`)
        }

    } catch (err) {
        console.log(`appendImageByQuestionId: ${err}`)
    }
}

/**
 * @param {string} questionId 
 * @param {string} filename 
 * @param {'title' | 'explanation'} type 
 */
async function replaceImageByQuestionId(questionId, fileName, type) {
    
}

/**
 * @param {string} questionId 
 * @param {string} filename 
 * @param {'title' | 'explanation'} type 
 */
async function priorInsertImageByQuestionId(questionId, fileName, type) {

}

function getUUIDFileName(originalFileName) {
    const ext = path.extname(originalFileName).toLowerCase()

    return uuidv4() + ext
}

async function getAllTitleImageByQuestionId(questionId){
    const sql = 
    `select * from image where question_id = ? and type = ? order by serial asc`

    try {
        const [result] = await pool.query(sql,
            [
                questionId,
                'title'
            ]
        )

        if (result.length == 0) {
            return null
        }

        return result.map(item => new ImageDto(item.question_id, item.name, item.serial))
    } catch (err) {
        console.log(`getAllImageByQuestionId: ${err}`)
        throw new Error(`${err}`)        
    }
}

module.exports = {
    appendImageByQuestionId,
    replaceImageByQuestionId,
    priorInsertImageByQuestionId,
    getAllTitleImageByQuestionId,
    getUUIDFileName
}