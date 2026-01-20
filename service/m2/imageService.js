const pool = require('../../config/mysql2/connectionPool')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { ImageDto } = require('../../dto/ImageDto')

const imageType = ['title', 'explanation']

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
        throw new Error(`${err.message}`)
    }
}

async function replaceImageByQuestionId(questionId, fileName, anchorName) {
    let sql =
        `update image set name = ? where question_id = ? and name = ?`
    try {
        const [rows] = await pool.query(sql,
            [
                fileName,
                questionId,
                anchorName
            ]
        )

        if (rows.affectedRows == 0) {
            throw new Error(`replace image failed, original questionId ${questionId} fileName ${anchorName}`)
        }

    } catch (err) {
        console.log(`replaceImageByQuestionId: ${err}`)
        throw new Error(`${err.message}`)
    }
}

//后期需要并发安全控制，加锁
async function priorInsertImageByQuestionId(questionId, fileName, type, anchorName) {
    if (!imageType.includes(type)) {
        throw new Error(`imageType "${type}" is not question or explanation`)
    }
    let connection, sql

    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()

        sql =
            `select serial from image where question_id = ?and name = ? limit 1`
        const [anchorRows] = await pool.query(sql,
            [
                questionId,
                anchorName
            ]
        )

        if (anchorRows.length == 0) {
            throw new Error(`未找到锚点图片: ${anchorName}`)
        }

        const anchorSerial = anchorRows[0].serial

        sql =
            `update image set serial = serial + 1 where question_id = ? and serial >= ? and type = ?`

        const [updateResult] = await connection.query(sql,
            [
                questionId,
                anchorSerial,
                type
            ]
        )

        sql =
            `insert into image (question_id, name, type, serial) values(?, ?, ?, ?)`

        const [insertResult] = await connection.query(sql,
            [
                questionId,
                fileName,
                type,
                anchorSerial
            ]
        )

        if (insertResult.affectedRows == 0) {
            throw new Error(`priorInsert image failed, original questionId ${questionId} fileName ${anchorName}`)
        }

        await connection.commit()
    } catch (err) {
        await connection.rollback()
        console.log(`priorInsertImageByQuestionId: ${err}`)
        throw new Error(`${err.message}`)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

function getUUIDFileName(originalFileName) {
    const ext = path.extname(originalFileName).toLowerCase()

    return uuidv4() + ext
}

async function getAllTypeImageByQuestionId(questionId, type) {
    if (!["title", "explanation"].includes(type)) {
        throw new Error(`${type} must be one of ["title", "explanation"]`)
    }
    const sql =
        `select * from image where question_id = ? and type = ? order by serial asc`

    try {
        const [result] = await pool.query(sql,
            [
                questionId,
                type
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

async function removeImageByNames(questionId, nameList) {
    console.dir(questionId, nameList)
    let connection
    try {
        if (!Array.isArray(nameList)) {
            throw new Error('nameList is not array')
        }
        connection = await pool.getConnection()
        await connection.beginTransaction()

        const placeholders = nameList.map(() => '?').join(', ')
        let sql =
            `delete from image where question_id = ? and name in (${placeholders})`
            console.dir( [questionId, ...nameList])
        const [deleteRows] = await connection.query(sql, [questionId, ...nameList])
        
        if (deleteRows.affectedRows == 0) {
            throw new Error('delete 0 doc')
        }

        sql = 
        `update image
        set 
            serial = (
                select new_serial
                from (
                    select 
                        id,
                        row_number() over (order by serial asc) as new_serial
                    from image
                    where question_id = ?
                ) as ranked
                where ranked.id = image.id
            )
        where question_id = ?`

        const [updateRows] = await connection.query(sql,
            [
                questionId,
                questionId
            ]
        )

        await connection.commit()
    } catch (err) {
        await connection.rollback()
        console.log(`removeImageByNames: ${err}`)
        throw new Error(`${err.message}`)
    }
}

module.exports = {
    appendImageByQuestionId,
    replaceImageByQuestionId,
    priorInsertImageByQuestionId,
    getAllTypeImageByQuestionId,
    getUUIDFileName,
    removeImageByNames
}