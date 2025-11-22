/**
 * Title Data Transfer Object
 * 用于题目数据的传输和格式转换
 */

/**
 * 选择题选项结构
 */
class ChoiceOption {
    constructor(text, isCorrect = false) {
        this.text = text;
        this.isCorrect = isCorrect;
    }
}

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

/**
 * 题目创建/更新DTO
 */
class TitleCreateDto {
    constructor(data) {
        this.type = data.type;
        this.validateBasicData(data);
        
        if (this.type === 'choice') {
            this.validateChoiceData(data.choice);
            this.choice = this.buildChoiceData(data.choice);
        }
    }

    /**
     * 验证基础数据
     */
    validateBasicData(data) {
        const validTypes = ['choice', 'fill', 'answer'];
        if (!validTypes.includes(data.type)) {
            throw new Error('Invalid title type. Must be one of: choice, fill, answer');
        }
    }

    /**
     * 验证选择题数据
     */
    validateChoiceData(choiceData) {
        if (!choiceData) {
            throw new Error('Choice data is required for choice type');
        }

        const validOptionTypes = ['shared', 'individual'];
        if (!validOptionTypes.includes(choiceData.optionType)) {
            throw new Error('Invalid option type. Must be shared or individual');
        }

        if (choiceData.optionType === 'shared' && (!choiceData.shared || !Array.isArray(choiceData.shared))) {
            throw new Error('Shared options are required for optionType=shared');
        }

        if (choiceData.optionType === 'individual' && (!choiceData.individual || !Array.isArray(choiceData.individual))) {
            throw new Error('Individual options are required for optionType=individual');
        }

        if (!choiceData.rightOption || !Array.isArray(choiceData.rightOption)) {
            throw new Error('Right option is required');
        }
    }

    /**
     * 构建选择题数据
     */
    buildChoiceData(choiceData) {
        return {
            title: choiceData.title || '',
            optionType: choiceData.optionType,
            shared: choiceData.optionType === 'shared' ? choiceData.shared : undefined,
            individual: choiceData.optionType === 'individual' ? choiceData.individual : undefined,
            rightOption: choiceData.rightOption,
            explanation: choiceData.explanation || '',
            img: choiceData.img || ''
        };
    }

    /**
     * 转换为数据库存储格式
     */
    toDatabaseFormat() {
        const dbData = {
            type: this.type
        };

        if (this.type === 'choice' && this.choice) {
            dbData.choice = this.choice;
        }

        return dbData;
    }
}

module.exports = {
    TitleDto,
    TitleCreateDto,
    ChoiceOption
};