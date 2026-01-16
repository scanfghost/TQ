const pool = require('../../config/mysql2/connectionPool')

async function getAllSubject() {
    const sql =  
    `select
        *
    from subject`

    try {
        const [result] = await pool.query(sql,
            []
        )
        if (result.length == 0) {
            throw new Error(`无subject`)
        }

        return result
    } catch (err) {
        throw new Error(`getAllSubject: ${err}`)
    }
}

async function getChapterBySubjectName(subjectName) {
    const sql = 
    `select 
        chapter.*
    from chapter
    inner join subject on chapter.subject_id = subject.id
    where subject.name = ?`

    try {
        const [result] = await pool.query(sql,
            [
                subjectName
            ]
        )

        if (result.length == 0) {
            throw new Error(`chapter not found by ${subjectName}`)
        }        
        return result
    } catch (err) {
        throw new Error(`getChapterBySubjectName: ${err}`)
    }
}

async function getSectionByChapterName(ChapterName) {
    const sql = 
    `select 
        section.*
    from section
    inner join chapter on section.chapter_id = chapter.id
    where chapter.name = ?`

    try {
        const [result] = await pool.query(sql,
            [
                ChapterName
            ]
        )

        if (result.length == 0) {
            throw new Error(`section not found by ${ChapterName}`)
        }        
        return result
    } catch (err) {
        throw new Error(`getSectionByChapterName: ${err}`)
    }
}

module.exports = {
    getAllSubject,
    getChapterBySubjectName,
    getSectionByChapterName
}