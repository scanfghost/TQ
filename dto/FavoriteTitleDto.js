class FavoriteTitleDto {
    constructor(data) {
        this.fuseremail = data.fuseremail;
        this.ftitleid = data.ftitleid;
        this.subject = data.subject;
        this.chapter = data.chapter;
        this.section = data.section;
        this.comment = data.comment;
        this.keywords = data.keywords;
    }
}

module.exports = { FavoriteTitleDto }