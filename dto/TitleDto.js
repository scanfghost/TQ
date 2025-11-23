/**
 * 题目基础数据结构
 */
class TitleDto {
    constructor(data) {
        this._id = data._id;
        this.type = data.type || null; // "choice", "fill", "answer"
        this.userAnswer = data.userAnswer || null;
        this.isAnswered = !!data.userAnswer || false;
        
        // 选择题相关数据成员显式初始化
        this.title = null;
        this.optionType = null;
        this.options = null;
        this.rightOption = null;
        this.explanation = null;
        this.explanImg = null;
        this.img = null;
        this.blankSize = null;
        this.isChoiceCorrect = null;
        this.blankType = null; // 'single' 单空单选| 'singlemultiple' 单空多选| 'multiplesingle' 多空单选

        // 填空题相关数据成员显式初始化
        this.fillContent = null;
        this.fillAnswer = null;
        
        // 问答题相关数据成员显式初始化
        this.answerContent = null;
        this.answerReference = null;
        
        // 根据题目类型处理特定数据
        if (this.type === 'fill' && data.fill) {
            this.processFillData(data.fill);
        } else if (this.type === 'answer' && data.answer) {
            this.processAnswerData(data.answer);
        } else if (this.type === 'choice' && data.choice) {
            this.processChoiceData(data.choice);
        }
    }

    /**
     * 处理选择题数据
     */
    processChoiceData(choiceData) {
        this.title = choiceData.title || '';
        this.optionType = choiceData.optionType || ''; // "shared" 或 "individual"
        this.explanation = choiceData.explanation || '';
        this.explanImg = choiceData.explanImg || '';
        this.img = choiceData.img || '';
        this.rightOption = choiceData.rightOption || [];
        this.blankSize = choiceData.rightOption.length || 0;
        if (this.blankSize === 1) {
            if (this.rightOption[0].length === 1) {
                this.blankType = 'single';
            } else if (this.rightOption[0].length > 1) {
                this.blankType = 'singlemultiple';
            }
        } else if (this.blankSize > 1) {
            this.blankType = 'multiplesingle';
        }
        if (this.optionType === 'shared') {
            this.options = choiceData.shared || [];
        } else if (this.optionType === 'individual'){
            this.options = choiceData.individual || [];
        }
    }

    /**
     * 处理填空题数据
     */
    processFillData(fillData) {
        this.fillContent = fillData.content || '';
        this.fillAnswer = fillData.answer || [];
        this.explanation = fillData.explanation || '';
        this.img = fillData.img || '';
    }

    /**
     * 处理问答题数据
     */
    processAnswerData(answerData) {
        this.answerContent = answerData.content || '';
        this.answerReference = answerData.reference || '';
        this.explanation = answerData.explanation || '';
        this.img = answerData.img || '';
    }

    /**
     * 转换为前端展示格式
     */
    toDisplayFormat() {
        const display = {
            id: this._id,
            type: this.type,
            isAnswered: this.isAnswered,
            answerStatus: this.getUserAnswerStatus()
        };

        if (this.type === 'choice') {
            display.title = this.title;
            display.options = this.options.map((option, index) => ({
                index: index,
                text: option.text,
                isCorrect: option.isCorrect
            }));
            display.explanation = this.explanation;
            display.img = this.img;
            display.correctAnswer = this.correctAnswer;
            
            if (this.userAnswer && this.userAnswer.userOption) {
                display.userAnswer = this.userAnswer.userOption;
            }
        }

        return display;
    }

    /**
     * 转换为API响应格式
     */
    toApiResponse() {
        return {
            success: true,
            data: this.toDisplayFormat()
        };
    }
}


module.exports = {
    TitleDto
};