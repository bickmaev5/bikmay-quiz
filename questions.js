const API = process.env.HASURA_URL;

const queries = require('./queries');

const { request } = require('graphql-request');;
const { getUser } = require('./user');

const getQuestion = async (userId) => {
    try {
        const user = await getUser(userId);
        const questions = await request(API, queries.getQuestions);
    
        if (!user.question_id) {
            await request(API, queries.setQuestuion, {
                userId: user.id,
                question_id: questions.quiz_questions[0].id
            });
            const question = await request(API, queries.getQuestion, {
                id: questions.quiz_questions[0].id,
            });
            return question.quiz_questions_by_pk;
        }
        const questionIndex = questions.quiz_questions.findIndex((q) => q.id === user.question_id);
        if (!!questions.quiz_questions[questionIndex + 1]) {
            const question = await request(API, queries.getQuestion, {
                id: questions.quiz_questions[questionIndex + 1].id,
            });
            await request(API, queries.setQuestuion, {
                userId: user.id,
                question_id: question.quiz_questions_by_pk.id
            });
            return question.quiz_questions_by_pk;
        };
        const result = await getResults(userId);
        return result;
    } catch (e) {
        return e;
    }
}

const getResults = async (userId) => {
    const results = await request(API, queries.getResults, {
        id: userId,
    });
    const res = results.quiz_results.reduce((r, c) => r=r+c.correct, 0);
    const calc = (100* res)/results.quiz_results.length;
    if (calc >= 95) {
        return 'Вы сдали на 5'
    }
    if (calc >= 80 && calc < 95) {
        return 'Вы сдали на 4'
    }
    if (calc >= 50 && calc < 80) {
        return 'Вы сдали на 3'
    }
    if ( calc < 50) {
        return 'Вы не сдали'
    }
}

const answerQuestion = async (userId, index) => {
    try {
        const user = await getUser(userId);
        const dataQuestion = await request(API, queries.getQuestion, {
            id: user.question_id
        });
        const question = dataQuestion.quiz_questions_by_pk;
        const answer = question.answers[index];
        await request(API, queries.setAnswer, {
            object: {
                user_id: user.user_id,
                quiz_answer_id: answer.id,
                correct: answer.isCorrect,
            }
        });
    } catch(e) {
        console.error(e);
    }
};


const removeResults = async (userId) => {
    try {
        await request(API, queries.removeResults, {
            user_id: userId,
        })
    } catch(e) {
        console.error(e);
    }
}

module.exports = {
    getQuestion,
    answerQuestion,
    getResults,
    removeResults,
};
